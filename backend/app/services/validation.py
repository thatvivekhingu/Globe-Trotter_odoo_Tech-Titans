from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Activity, City, Trip, TripActivity, TripStop


def raise_validation(message: str) -> None:
    raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=message)


def validate_range(start_date: date, end_date: date, label: str = 'date range') -> None:
    if end_date < start_date:
        raise_validation(f'Invalid {label}: the end date must be on or after the start date.')


def validate_trip_dates(db: Session, trip: Trip, start_date: date, end_date: date) -> None:
    validate_range(start_date, end_date, 'trip date range')
    stops = db.scalars(select(TripStop).where(TripStop.trip_id == trip.id)).all()
    if any(stop.arrival_date < start_date or stop.departure_date > end_date for stop in stops):
        raise_validation('Trip dates cannot exclude an existing city stop.')


def validate_stop_dates(trip: Trip, arrival_date: date, departure_date: date) -> None:
    validate_range(arrival_date, departure_date, 'stop date range')
    if arrival_date < trip.start_date or departure_date > trip.end_date:
        raise_validation('Stop dates must fall inside the parent trip dates.')


def validate_stop_activity_dates(db: Session, stop_id: int, arrival_date: date, departure_date: date) -> None:
    activities = db.scalars(select(TripActivity).where(TripActivity.trip_stop_id == stop_id)).all()
    if any(activity.scheduled_date < arrival_date or activity.scheduled_date > departure_date for activity in activities):
        raise_validation('Stop dates cannot exclude an existing activity.')


def get_city_or_404(db: Session, city_id: int) -> City:
    city = db.get(City, city_id)
    if city is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='City not found.')
    return city


def get_stop_for_trip_or_404(db: Session, trip_id: int, stop_id: int) -> TripStop:
    stop = db.scalar(select(TripStop).where(TripStop.id == stop_id, TripStop.trip_id == trip_id))
    if stop is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='City stop not found.')
    return stop


def get_activity_or_404(db: Session, activity_id: int) -> Activity:
    activity = db.get(Activity, activity_id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Activity not found.')
    return activity


def validate_trip_activity(db: Session, trip: Trip, stop: TripStop, activity: Activity, scheduled_date: date) -> None:
    if stop.trip_id != trip.id:
        raise_validation('The selected stop does not belong to this trip.')
    if activity.city_id != stop.city_id:
        raise_validation('The activity city must match the selected city stop.')
    if scheduled_date < stop.arrival_date or scheduled_date > stop.departure_date:
        raise_validation('Activity date must fall inside the selected stop dates.')
    if scheduled_date < trip.start_date or scheduled_date > trip.end_date:
        raise_validation('Activity date must fall inside the parent trip dates.')


def next_stop_order(db: Session, trip_id: int) -> int:
    orders = db.scalars(select(TripStop.stop_order).where(TripStop.trip_id == trip_id)).all()
    return max(orders, default=-1) + 1


def next_activity_order(db: Session, stop_id: int) -> int:
    orders = db.scalars(select(TripActivity.activity_order).where(TripActivity.trip_stop_id == stop_id)).all()
    return max(orders, default=-1) + 1


def reorder_stops(db: Session, stops: list[TripStop], ordered_ids: list[int]) -> None:
    stop_by_id = {stop.id: stop for stop in stops}
    if set(stop_by_id) != set(ordered_ids) or len(ordered_ids) != len(stops):
        raise_validation('ordered_ids must contain every stop exactly once.')
    for index, stop_id in enumerate(ordered_ids):
        stop_by_id[stop_id].stop_order = -(index + 1)
    db.flush()
    for index, stop_id in enumerate(ordered_ids):
        stop_by_id[stop_id].stop_order = index


def reorder_activities(db: Session, activities: list[TripActivity], ordered_ids: list[int]) -> None:
    activity_by_id = {activity.id: activity for activity in activities}
    if set(activity_by_id) != set(ordered_ids) or len(ordered_ids) != len(activities):
        raise_validation('ordered_ids must contain every activity exactly once.')
    for index, activity_id in enumerate(ordered_ids):
        activity_by_id[activity_id].activity_order = -(index + 1)
    db.flush()
    for index, activity_id in enumerate(ordered_ids):
        activity_by_id[activity_id].activity_order = index
