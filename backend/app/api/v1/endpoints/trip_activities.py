from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_owned_trip
from app.db.session import get_db
from app.models import Trip, TripActivity
from app.schemas.common import ReorderRequest, TripActivityCreate, TripActivityRead, TripActivityUpdate
from app.services.validation import get_activity_or_404, get_stop_for_trip_or_404, next_activity_order, reorder_activities, validate_trip_activity

router = APIRouter()


@router.get('/{trip_id}/activities', response_model=list[TripActivityRead])
def list_trip_activities(trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> list[TripActivity]:
    statement = select(TripActivity).where(TripActivity.trip_id == trip.id).order_by(TripActivity.scheduled_date, TripActivity.activity_order)
    return list(db.scalars(statement).all())


@router.post('/{trip_id}/activities', response_model=TripActivityRead, status_code=status.HTTP_201_CREATED)
def create_trip_activity(payload: TripActivityCreate, trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> TripActivity:
    stop = get_stop_for_trip_or_404(db, trip.id, payload.trip_stop_id)
    activity = get_activity_or_404(db, payload.activity_id)
    validate_trip_activity(db, trip, stop, activity, payload.scheduled_date)
    trip_activity = TripActivity(activity_order=next_activity_order(db, stop.id), trip_id=trip.id, **payload.model_dump())
    db.add(trip_activity)
    db.commit()
    db.refresh(trip_activity)
    return trip_activity


@router.patch('/{trip_id}/activities/{trip_activity_id}', response_model=TripActivityRead)
def update_trip_activity(payload: TripActivityUpdate, trip: Trip = Depends(get_owned_trip), trip_activity_id: int = 0, db: Session = Depends(get_db)) -> TripActivity:
    trip_activity = db.scalar(select(TripActivity).where(TripActivity.id == trip_activity_id, TripActivity.trip_id == trip.id))
    if trip_activity is None:
        raise HTTPException(status_code=404, detail='Trip activity not found.')

    changes = payload.model_dump(exclude_unset=True)
    stop = get_stop_for_trip_or_404(db, trip.id, changes.get('trip_stop_id', trip_activity.trip_stop_id))
    activity = get_activity_or_404(db, changes.get('activity_id', trip_activity.activity_id))
    validate_trip_activity(db, trip, stop, activity, changes.get('scheduled_date', trip_activity.scheduled_date))
    for key, value in changes.items():
        setattr(trip_activity, key, value)
    db.commit()
    db.refresh(trip_activity)
    return trip_activity


@router.delete('/{trip_id}/activities/{trip_activity_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_trip_activity(trip: Trip = Depends(get_owned_trip), trip_activity_id: int = 0, db: Session = Depends(get_db)) -> None:
    trip_activity = db.scalar(select(TripActivity).where(TripActivity.id == trip_activity_id, TripActivity.trip_id == trip.id))
    if trip_activity is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail='Trip activity not found.')
    db.delete(trip_activity)
    db.commit()


@router.post('/{trip_id}/stops/{stop_id}/activities/reorder', response_model=list[TripActivityRead])
def reorder_stop_activities(payload: ReorderRequest, trip: Trip = Depends(get_owned_trip), stop_id: int = 0, db: Session = Depends(get_db)) -> list[TripActivity]:
    stop = get_stop_for_trip_or_404(db, trip.id, stop_id)
    activities = list(db.scalars(select(TripActivity).where(TripActivity.trip_stop_id == stop.id)).all())
    reorder_activities(db, activities, payload.ordered_ids)
    db.commit()
    return list(db.scalars(select(TripActivity).where(TripActivity.trip_stop_id == stop.id).order_by(TripActivity.activity_order)).all())
