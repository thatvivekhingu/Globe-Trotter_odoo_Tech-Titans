from datetime import date, datetime, time
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

TripStatus = Literal['draft', 'upcoming', 'in-progress', 'completed']
ExpenseCategory = Literal['transportation', 'accommodation', 'activities', 'food', 'other']
ActivityCategory = Literal['sightseeing', 'food', 'adventure', 'nature', 'shopping', 'culture', 'entertainment']
CostIndex = Literal['low', 'medium', 'high']
LanguageCode = Literal['en', 'hi']
UserRole = Literal['user', 'admin']


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class UserRead(ORMModel):
    id: int
    email: str
    full_name: str
    avatar_url: str | None = None
    language_code: LanguageCode
    role: UserRole
    created_at: datetime
    updated_at: datetime


class CityRead(ORMModel):
    id: int
    slug: str
    name: str
    country: str
    region: str
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    popularity_score: int
    cost_index: CostIndex
    image_url: str | None = None
    image_alt: str | None = None


class ActivityRead(ORMModel):
    id: int
    city_id: int
    slug: str
    name: str
    category: ActivityCategory
    description: str | None = None
    default_cost: Decimal
    duration_minutes: int
    image_url: str | None = None
    image_alt: str | None = None


class TripCreate(BaseModel):
    name: str = Field(min_length=3, max_length=160)
    description: str | None = Field(default=None, max_length=5000)
    start_date: date
    end_date: date
    currency: str = Field(default='INR', min_length=3, max_length=3)
    budget_limit: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    cover_image_url: str | None = Field(default=None, max_length=2048)

    @model_validator(mode='after')
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError('end_date must be on or after start_date')
        return self

    @field_validator('currency')
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        return value.upper()


class TripUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=160)
    description: str | None = Field(default=None, max_length=5000)
    start_date: date | None = None
    end_date: date | None = None
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    budget_limit: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    cover_image_url: str | None = Field(default=None, max_length=2048)
    status: TripStatus | None = None

    @model_validator(mode='after')
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError('end_date must be on or after start_date')
        return self

    @field_validator('currency')
    @classmethod
    def normalize_currency(cls, value: str | None) -> str | None:
        return value.upper() if value else value


class TripRead(ORMModel):
    id: int
    owner_user_id: int
    name: str
    description: str | None = None
    start_date: date
    end_date: date
    currency: str
    budget_limit: Decimal | None = None
    cover_image_url: str | None = None
    status: TripStatus
    created_at: datetime
    updated_at: datetime


class TripStopCreate(BaseModel):
    city_id: int
    arrival_date: date
    departure_date: date
    notes: str | None = Field(default=None, max_length=5000)

    @model_validator(mode='after')
    def validate_dates(self):
        if self.departure_date < self.arrival_date:
            raise ValueError('departure_date must be on or after arrival_date')
        return self


class TripStopUpdate(BaseModel):
    city_id: int | None = None
    arrival_date: date | None = None
    departure_date: date | None = None
    notes: str | None = Field(default=None, max_length=5000)

    @model_validator(mode='after')
    def validate_dates(self):
        if self.arrival_date and self.departure_date and self.departure_date < self.arrival_date:
            raise ValueError('departure_date must be on or after arrival_date')
        return self


class TripStopRead(ORMModel):
    id: int
    trip_id: int
    city_id: int
    arrival_date: date
    departure_date: date
    stop_order: int
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class ReorderRequest(BaseModel):
    ordered_ids: list[int] = Field(min_length=1)


class TripActivityCreate(BaseModel):
    trip_stop_id: int
    activity_id: int
    scheduled_date: date
    start_time: time
    duration_minutes: int = Field(gt=0, le=1440)
    estimated_cost: Decimal = Field(default=Decimal('0'), ge=0, max_digits=12, decimal_places=2)
    notes: str | None = Field(default=None, max_length=5000)


class TripActivityUpdate(BaseModel):
    trip_stop_id: int | None = None
    activity_id: int | None = None
    scheduled_date: date | None = None
    start_time: time | None = None
    duration_minutes: int | None = Field(default=None, gt=0, le=1440)
    estimated_cost: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    notes: str | None = Field(default=None, max_length=5000)


class TripActivityRead(ORMModel):
    id: int
    trip_id: int
    trip_stop_id: int
    activity_id: int
    scheduled_date: date
    start_time: time
    duration_minutes: int
    estimated_cost: Decimal
    activity_order: int
    notes: str | None = None
    created_at: datetime
    updated_at: datetime


class ExpenseCreate(BaseModel):
    category: ExpenseCategory
    amount: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    description: str = Field(min_length=1, max_length=255)
    expense_date: date | None = None
    is_actual: bool = False


class ExpenseUpdate(BaseModel):
    category: ExpenseCategory | None = None
    amount: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    description: str | None = Field(default=None, min_length=1, max_length=255)
    expense_date: date | None = None
    is_actual: bool | None = None


class ExpenseRead(ORMModel):
    id: int
    trip_id: int
    category: ExpenseCategory
    amount: Decimal
    description: str
    expense_date: date | None = None
    is_actual: bool
    created_at: datetime
    updated_at: datetime


class BudgetSummary(BaseModel):
    total: Decimal
    cost_per_day: Decimal
    budget_limit: Decimal | None = None
    remaining: Decimal | None = None
    categories: dict[ExpenseCategory, Decimal]


class TripDetailRead(BaseModel):
    trip: TripRead
    stops: list[TripStopRead]
    activities: list[TripActivityRead]
    expenses: list[ExpenseRead]


class SharedTripRead(ORMModel):
    id: int
    trip_id: int
    share_token: str
    is_active: bool
    expires_at: datetime | None = None
    created_at: datetime


class PublicTripRead(BaseModel):
    trip: TripRead
    stops: list[TripStopRead]
    activities: list[TripActivityRead]
    budget: BudgetSummary
