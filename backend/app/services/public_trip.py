from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import SharedTrip, Trip, TripActivity, TripStop
from app.schemas.common import BudgetSummary, PublicTripRead, TripActivityRead, TripRead, TripStopRead
from .budget import calculate_budget


def get_public_trip(db: Session, share_token: str) -> PublicTripRead:
    shared = db.scalar(select(SharedTrip).where(SharedTrip.share_token == share_token, SharedTrip.is_active.is_(True)))
    if shared is None or (shared.expires_at and shared.expires_at <= datetime.now(timezone.utc).replace(tzinfo=None)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Shared itinerary not found.')

    trip = db.get(Trip, shared.trip_id)
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Shared itinerary not found.')

    stops = db.scalars(select(TripStop).where(TripStop.trip_id == trip.id).order_by(TripStop.stop_order)).all()
    activities = db.scalars(select(TripActivity).where(TripActivity.trip_id == trip.id).order_by(TripActivity.scheduled_date, TripActivity.activity_order)).all()
    return PublicTripRead(
        trip=TripRead.model_validate(trip),
        stops=[TripStopRead.model_validate(stop) for stop in stops],
        activities=[TripActivityRead.model_validate(activity) for activity in activities],
        budget=calculate_budget(db, trip),
    )
