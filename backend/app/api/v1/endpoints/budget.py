from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_owned_trip
from app.db.session import get_db
from app.models import Trip
from app.schemas.common import BudgetSummary
from app.services.budget import calculate_budget

router = APIRouter()


@router.get('/{trip_id}/budget', response_model=BudgetSummary)
def get_budget(trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> BudgetSummary:
    return calculate_budget(db, trip)
