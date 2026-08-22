from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_owned_trip
from app.db.session import get_db
from app.models import Expense, Trip, TripActivity, TripStop, User
from app.schemas.common import ExpenseRead, TripActivityRead, TripCreate, TripDetailRead, TripRead, TripStopRead, TripUpdate
from app.services.validation import validate_trip_dates

router = APIRouter()


@router.get('', response_model=list[TripRead])
def list_trips(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[Trip]:
    statement = select(Trip).where(Trip.owner_user_id == current_user.id).order_by(Trip.start_date, Trip.created_at.desc())
    return list(db.scalars(statement).all())


@router.post('', response_model=TripRead, status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Trip:
    trip = Trip(owner_user_id=current_user.id, **payload.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.get('/{trip_id}', response_model=TripRead)
def get_trip(trip: Trip = Depends(get_owned_trip)) -> Trip:
    return trip


@router.get('/{trip_id}/itinerary', response_model=TripDetailRead)
def get_itinerary(trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> TripDetailRead:
    stops = db.scalars(select(TripStop).where(TripStop.trip_id == trip.id).order_by(TripStop.stop_order)).all()
    activities = db.scalars(select(TripActivity).where(TripActivity.trip_id == trip.id).order_by(TripActivity.scheduled_date, TripActivity.activity_order)).all()
    expenses = db.scalars(select(Expense).where(Expense.trip_id == trip.id).order_by(Expense.expense_date, Expense.created_at)).all()
    return TripDetailRead(
        trip=TripRead.model_validate(trip),
        stops=[TripStopRead.model_validate(stop) for stop in stops],
        activities=[TripActivityRead.model_validate(activity) for activity in activities],
        expenses=[ExpenseRead.model_validate(expense) for expense in expenses],
    )


@router.patch('/{trip_id}', response_model=TripRead)
def update_trip(payload: TripUpdate, trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> Trip:
    changes = payload.model_dump(exclude_unset=True)
    start_date = changes.get('start_date', trip.start_date)
    end_date = changes.get('end_date', trip.end_date)
    validate_trip_dates(db, trip, start_date, end_date)
    for key, value in changes.items():
        setattr(trip, key, value)
    db.commit()
    db.refresh(trip)
    return trip


@router.delete('/{trip_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> None:
    db.delete(trip)
    db.commit()
