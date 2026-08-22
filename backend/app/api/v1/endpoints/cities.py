from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import City
from app.schemas.common import CityRead, CostIndex

router = APIRouter()


@router.get('', response_model=list[CityRead])
def list_cities(
    q: str | None = Query(default=None, min_length=1, max_length=120),
    country: str | None = Query(default=None, max_length=120),
    region: str | None = Query(default=None, max_length=120),
    cost_index: CostIndex | None = None,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=30, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[City]:
    statement = select(City)
    if q:
        search = f'%{q.strip()}%'
        statement = statement.where(or_(City.name.ilike(search), City.country.ilike(search), City.region.ilike(search)))
    if country:
        statement = statement.where(City.country == country)
    if region:
        statement = statement.where(City.region == region)
    if cost_index:
        statement = statement.where(City.cost_index == cost_index)
    statement = statement.order_by(City.popularity_score.desc(), City.name).offset(offset).limit(limit)
    return list(db.scalars(statement).all())


@router.get('/{city_id}', response_model=CityRead)
def get_city(city_id: int, db: Session = Depends(get_db)) -> City:
    city = db.get(City, city_id)
    if city is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='City not found.')
    return city
