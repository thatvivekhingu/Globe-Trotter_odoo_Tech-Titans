"""AI schemas — request / response models for all four Tier-1 AI features."""
from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


# ─── Shared ──────────────────────────────────────────────────────────────────

ActivityCategory = Literal[
    'sightseeing', 'food', 'adventure', 'nature', 'shopping', 'culture', 'entertainment'
]


# ─── 1. Itinerary Generator ──────────────────────────────────────────────────

class ItineraryRequest(BaseModel):
    destination: str = Field(min_length=2, max_length=120, description='City or region name')
    start_date: date
    end_date: date
    budget: Decimal | None = Field(default=None, ge=0, description='Optional total budget in the user\'s currency')
    currency: str = Field(default='INR', min_length=3, max_length=3)
    interests: list[ActivityCategory] = Field(default_factory=list, description='Preferred activity categories')
    travel_style: Literal['budget', 'comfort', 'luxury'] = 'comfort'


class ItineraryActivity(BaseModel):
    time: str = Field(description='e.g. 09:00')
    name: str
    category: ActivityCategory
    duration_minutes: int
    estimated_cost: Decimal
    description: str
    tips: str | None = None


class ItineraryDay(BaseModel):
    date: str
    theme: str
    activities: list[ItineraryActivity]
    total_cost: Decimal
    notes: str | None = None


class ItineraryResponse(BaseModel):
    destination: str
    summary: str
    total_days: int
    total_estimated_cost: Decimal
    currency: str
    days: list[ItineraryDay]
    packing_tips: list[str]
    best_time_to_visit: str


# ─── 2. Chat (Globe Guide) ────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: Literal['user', 'assistant']
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list, max_length=20)
    trip_context: dict | None = Field(
        default=None,
        description='Optional trip data (destination, dates, budget) to ground the assistant'
    )


class ChatResponse(BaseModel):
    reply: str
    suggestions: list[str] = Field(default_factory=list, description='Follow-up question suggestions')


# ─── 3. Budget Optimizer ─────────────────────────────────────────────────────

class BudgetInsight(BaseModel):
    category: str
    status: Literal['on_track', 'overspending', 'underspending', 'no_data']
    message: str
    saving_tip: str | None = None
    suggested_adjustment: Decimal | None = None


class BudgetOptimizerResponse(BaseModel):
    overall_health: Literal['healthy', 'warning', 'critical']
    headline: str
    summary: str
    insights: list[BudgetInsight]
    top_saving_opportunities: list[str]
    reallocation_advice: str | None = None


# ─── 4. Smart Destination Discovery ──────────────────────────────────────────

class DiscoveryRequest(BaseModel):
    past_destinations: list[str] = Field(default_factory=list, description='Cities the user has visited')
    saved_destinations: list[str] = Field(default_factory=list, description='Cities the user has wishlisted')
    budget_style: Literal['low', 'medium', 'high'] = 'medium'
    preferred_categories: list[ActivityCategory] = Field(default_factory=list)
    exclude_destinations: list[str] = Field(default_factory=list)
    count: int = Field(default=5, ge=1, le=10)


class DestinationRecommendation(BaseModel):
    city: str
    country: str
    reason: str
    highlights: list[str]
    best_season: str
    estimated_daily_budget: str
    match_score: int = Field(ge=1, le=100, description='How well this matches user preferences')


class DiscoveryResponse(BaseModel):
    recommendations: list[DestinationRecommendation]
    personalization_summary: str
