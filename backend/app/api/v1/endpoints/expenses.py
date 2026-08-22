from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_owned_trip
from app.db.session import get_db
from app.models import Expense, Trip
from app.schemas.common import ExpenseCreate, ExpenseRead, ExpenseUpdate

router = APIRouter()


@router.get('/{trip_id}/expenses', response_model=list[ExpenseRead])
def list_expenses(trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> list[Expense]:
    return list(db.scalars(select(Expense).where(Expense.trip_id == trip.id).order_by(Expense.expense_date, Expense.created_at)).all())


@router.post('/{trip_id}/expenses', response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
def create_expense(payload: ExpenseCreate, trip: Trip = Depends(get_owned_trip), db: Session = Depends(get_db)) -> Expense:
    expense = Expense(trip_id=trip.id, **payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.patch('/{trip_id}/expenses/{expense_id}', response_model=ExpenseRead)
def update_expense(payload: ExpenseUpdate, trip: Trip = Depends(get_owned_trip), expense_id: int = 0, db: Session = Depends(get_db)) -> Expense:
    expense = db.scalar(select(Expense).where(Expense.id == expense_id, Expense.trip_id == trip.id))
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Expense not found.')
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(expense, key, value)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete('/{trip_id}/expenses/{expense_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(trip: Trip = Depends(get_owned_trip), expense_id: int = 0, db: Session = Depends(get_db)) -> None:
    expense = db.scalar(select(Expense).where(Expense.id == expense_id, Expense.trip_id == trip.id))
    if expense is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Expense not found.')
    db.delete(expense)
    db.commit()
