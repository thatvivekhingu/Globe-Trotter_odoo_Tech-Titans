from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_owned_trip
from app.db.session import get_db
from app.models import Trip, TripActivity, TripStop
from app.schemas.common import ReorderRequest, TripStopCreate, TripStopRead, TripStopUpdate
from app.services.validation import get_city_or_404, get_stop_for_trip_or_404, next_stop_order, raise_validation, reorder_stops, validate_stop_activity_dates, validate_stop_dates

router = APIRouter()


@router.get('/{trip_id}/stops', response_model=list[TripStopRead])
def list_stops(trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> list[TripStop]:
    return list(db.scalars(select(TripStop).where(TripStop.trip_id == trip.id).order_by(TripStop.stop_order)).all())


@router.post('/{trip_id}/stops', response_model=TripStopRead, status_code=status.HTTP_201_CREATED)
def create_stop(payload: TripStopCreate, trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> TripStop:
    get_city_or_404(db, payload.city_id)
    validate_stop_dates(trip, payload.arrival_date, payload.departure_date)
    stop = TripStop(trip_id=trip.id, stop_order=next_stop_order(db, trip.id), **payload.model_dump())
    db.add(stop)
    db.commit()
    db.refresh(stop)
    return stop


@router.patch('/{trip_id}/stops/{stop_id}', response_model=TripStopRead)
def update_stop(payload: TripStopUpdate, trip: Trip = Depends(get_owned_trip), stop_id: int = 0, db: Session = Depends(get_db)) -> TripStop:
    stop = get_stop_for_trip_or_404(db, trip.id, stop_id)
    changes = payload.model_dump(exclude_unset=True)
    city_id = changes.get('city_id', stop.city_id)
    arrival_date = changes.get('arrival_date', stop.arrival_date)
    departure_date = changes.get('departure_date', stop.departure_date)
    get_city_or_404(db, city_id)
    validate_stop_dates(trip, arrival_date, departure_date)
    validate_stop_activity_dates(db, stop.id, arrival_date, departure_date)
    if city_id != stop.city_id and db.scalar(select(TripActivity.id).where(TripActivity.trip_stop_id == stop.id)) is not None:
        raise_validation('Move or remove activities before changing a stop city.')
    for key, value in changes.items():
        setattr(stop, key, value)
    db.commit()
    db.refresh(stop)
    return stop


@router.delete('/{trip_id}/stops/{stop_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_stop(trip: Trip = Depends(get_owned_trip), stop_id: int = 0, db: Session = Depends(get_db)) -> None:
    stop = get_stop_for_trip_or_404(db, trip.id, stop_id)
    db.delete(stop)
    db.commit()


@router.post('/{trip_id}/stops/reorder', response_model=list[TripStopRead])
def reorder_trip_stops(payload: ReorderRequest, trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> list[TripStop]:
    stops = list(db.scalars(select(TripStop).where(TripStop.trip_id == trip.id)).all())
    reorder_stops(db, stops, payload.ordered_ids)
    db.commit()
    return list(db.scalars(select(TripStop).where(TripStop.trip_id == trip.id).order_by(TripStop.stop_order)).all())
