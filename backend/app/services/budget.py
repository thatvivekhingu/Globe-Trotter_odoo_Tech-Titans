from collections.abc import Mapping
from datetime import date
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Expense, Trip, TripActivity
from app.schemas.common import BudgetSummary, ExpenseCategory

CATEGORY_NAMES: tuple[ExpenseCategory, ...] = ('transportation', 'accommodation', 'activities', 'food', 'other')


def calculate_budget(db: Session, trip: Trip) -> BudgetSummary:
    categories: dict[ExpenseCategory, Decimal] = {category: Decimal('0.00') for category in CATEGORY_NAMES}

    expense_rows = db.execute(
        select(Expense.category, func.coalesce(func.sum(Expense.amount), 0))
        .where(Expense.trip_id == trip.id)
        .group_by(Expense.category)
    ).all()
    for category, total in expense_rows:
        categories[category] = Decimal(str(total or 0))

    activity_total = db.scalar(
        select(func.coalesce(func.sum(TripActivity.estimated_cost), 0))
        .where(TripActivity.trip_id == trip.id)
    )
    categories['activities'] += Decimal(str(activity_total or 0))

    total = sum(categories.values(), Decimal('0.00'))
    days = max(1, (trip.end_date - trip.start_date).days + 1)
    cost_per_day = (total / days).quantize(Decimal('0.01'))
    remaining = None if trip.budget_limit is None else Decimal(str(trip.budget_limit)) - total

    return BudgetSummary(
        total=total,
        cost_per_day=cost_per_day,
        budget_limit=trip.budget_limit,
        remaining=remaining,
        categories=categories,
    )


def days_in_range(start_date: date, end_date: date) -> int:
    return max(1, (end_date - start_date).days + 1)
