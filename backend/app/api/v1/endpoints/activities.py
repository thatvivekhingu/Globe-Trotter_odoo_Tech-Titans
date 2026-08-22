from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Activity
from app.schemas.common import ActivityCategory, ActivityRead

router = APIRouter()


@router.get('', response_model=list[ActivityRead])
def list_activities(
    q: str | None = Query(default=None, min_length=1, max_length=160),
    city_id: int | None = Query(default=None, ge=1),
    category: ActivityCategory | None = None,
    max_cost: float | None = Query(default=None, ge=0),
    max_duration: int | None = Query(default=None, ge=1, le=1440),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=30, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[Activity]:
    conditions = []
    if q:
        search = f'%{q.strip()}%'
        conditions.append(or_(Activity.name.ilike(search), Activity.description.ilike(search)))
    if city_id:
        conditions.append(Activity.city_id == city_id)
    if category:
        conditions.append(Activity.category == category)
    if max_cost is not None:
        conditions.append(Activity.default_cost <= max_cost)
    if max_duration is not None:
        conditions.append(Activity.duration_minutes <= max_duration)

    statement = select(Activity)
    if conditions:
        statement = statement.where(and_(*conditions))
    statement = statement.order_by(Activity.name).offset(offset).limit(limit)
    return list(db.scalars(statement).all())


@router.get('/{activity_id}', response_model=ActivityRead)
def get_activity(activity_id: int, db: Session = Depends(get_db)) -> Activity:
    activity = db.get(Activity, activity_id)
    if activity is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Activity not found.')
    return activity
