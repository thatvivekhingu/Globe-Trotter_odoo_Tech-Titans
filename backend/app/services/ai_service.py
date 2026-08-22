"""AI service layer — all four Tier-1 AI features powered by Gemini."""
from __future__ import annotations

import json
import re
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.ai_client import get_gemini_model
from app.core.cache import ai_cache
from app.models import City, Expense, Trip, TripActivity, TripStop
from app.schemas.ai import (
    BudgetInsight,
    BudgetOptimizerResponse,
    ChatRequest,
    ChatResponse,
    DestinationRecommendation,
    DiscoveryRequest,
    DiscoveryResponse,
    ItineraryDay,
    ItineraryRequest,
    ItineraryResponse,
)
from app.services.budget import calculate_budget


# ─── helpers ──────────────────────────────────────────────────────────────────

def _extract_json(text: str) -> str:
    """Strip markdown fences and return the raw JSON string."""
    text = text.strip()
    # Remove ```json ... ``` or ``` ... ```
    text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
    text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
    return text.strip()


def _days_count(start: date, end: date) -> int:
    return max(1, (end - start).days + 1)


# ─── 1. Itinerary Generator ───────────────────────────────────────────────────

def generate_itinerary(request: ItineraryRequest) -> ItineraryResponse:
    cache_key = f"itinerary:{request.destination.lower()}:{request.start_date}:{request.end_date}:{request.travel_style}:{','.join(request.interests)}"
    cached_val = ai_cache.get(cache_key)
    if cached_val:
        return ItineraryResponse(**cached_val)

    days = _days_count(request.start_date, request.end_date)

    interests_str = ', '.join(request.interests) if request.interests else 'general tourism'
    budget_str = f'{request.currency} {request.budget}' if request.budget else 'flexible'

    prompt = f"""You are an expert travel planner. Create a detailed {days}-day itinerary for:

Destination: {request.destination}
Dates: {request.start_date} to {request.end_date}
Budget: {budget_str}
Travel style: {request.travel_style}
Interests: {interests_str}

Return ONLY valid JSON matching this exact schema (no markdown, no extra text):
{{
  "destination": "City Name",
  "summary": "2-3 sentence trip overview",
  "total_days": {days},
  "total_estimated_cost": 12345.00,
  "currency": "{request.currency}",
  "best_time_to_visit": "string",
  "packing_tips": ["tip1", "tip2", "tip3"],
  "days": [
    {{
      "date": "YYYY-MM-DD",
      "theme": "Day theme e.g. Cultural Immersion",
      "notes": "Optional day note",
      "total_cost": 2000.00,
      "activities": [
        {{
          "time": "09:00",
          "name": "Activity name",
          "category": "sightseeing",
          "duration_minutes": 120,
          "estimated_cost": 500.00,
          "description": "Brief description",
          "tips": "Optional insider tip"
        }}
      ]
    }}
  ]
}}

Activity categories must be one of: sightseeing, food, adventure, nature, shopping, culture, entertainment.
All costs in {request.currency}. Provide realistic costs for {request.travel_style} travel.
Generate exactly {days} days starting from {request.start_date}."""

    model = get_gemini_model()
    response = model.generate_content(prompt)
    raw = _extract_json(response.text)
    data = json.loads(raw)

    # Build validated response
    res = ItineraryResponse(
        destination=data['destination'],
        summary=data['summary'],
        total_days=data['total_days'],
        total_estimated_cost=Decimal(str(data['total_estimated_cost'])),
        currency=data['currency'],
        best_time_to_visit=data.get('best_time_to_visit', ''),
        packing_tips=data.get('packing_tips', []),
        days=[
            ItineraryDay(
                date=day['date'],
                theme=day['theme'],
                notes=day.get('notes'),
                total_cost=Decimal(str(day['total_cost'])),
                activities=[
                    {
                        'time': a['time'],
                        'name': a['name'],
                        'category': a['category'],
                        'duration_minutes': int(a['duration_minutes']),
                        'estimated_cost': Decimal(str(a['estimated_cost'])),
                        'description': a['description'],
                        'tips': a.get('tips'),
                    }
                    for a in day['activities']
                ],
            )
            for day in data['days']
        ],
    )
    ai_cache.set(cache_key, res.model_dump())
    return res



# ─── 2. Chat (Globe Guide) ────────────────────────────────────────────────────

def chat_with_guide(request: ChatRequest) -> ChatResponse:
    system_prompt = """You are Globe Guide, an enthusiastic and knowledgeable AI travel assistant for the Globe-Trotter app.
You help users plan trips, discover destinations, estimate costs, understand local culture, and optimise their itineraries.
Be concise, friendly, and practical. Always provide actionable advice.
When mentioning costs, default to INR unless the user specifies otherwise.
Always end with 1-3 short follow-up question suggestions to keep the conversation going."""

    context_block = ''
    if request.trip_context:
        ctx = request.trip_context
        context_block = f"""
Current trip context:
- Destination: {ctx.get('destination', 'unknown')}
- Dates: {ctx.get('start_date', '?')} to {ctx.get('end_date', '?')}
- Budget: {ctx.get('currency', 'INR')} {ctx.get('budget_limit', 'not set')}
- Status: {ctx.get('status', 'draft')}
"""

    # Build conversation history for the model
    history_text = ''
    for msg in request.history[-10:]:  # Last 10 messages
        role_label = 'User' if msg.role == 'user' else 'Globe Guide'
        history_text += f'{role_label}: {msg.content}\n'

    prompt = f"""{system_prompt}
{context_block}
Previous conversation:
{history_text}
User: {request.message}

Respond as Globe Guide. After your main response, add a line starting with "SUGGESTIONS:" followed by 3 comma-separated follow-up questions the user might want to ask."""

    model = get_gemini_model()
    response = model.generate_content(prompt)
    text = response.text.strip()

    # Parse suggestions out of the response
    suggestions: list[str] = []
    if 'SUGGESTIONS:' in text:
        parts = text.split('SUGGESTIONS:', 1)
        reply = parts[0].strip()
        raw_suggestions = parts[1].strip()
        suggestions = [s.strip().strip('- ').strip() for s in raw_suggestions.split(',') if s.strip()]
    else:
        reply = text

    return ChatResponse(reply=reply, suggestions=suggestions[:3])


# ─── 3. Budget Optimizer ──────────────────────────────────────────────────────

def analyse_budget(db: Session, trip: Trip) -> BudgetOptimizerResponse:
    budget = calculate_budget(db, trip)
    days = _days_count(trip.start_date, trip.end_date)

    # Build expense breakdown text
    cat_lines = '\n'.join(
        f'  - {cat}: {trip.currency} {amount:.2f}'
        for cat, amount in budget.categories.items()
    )

    budget_info = f"""Trip: {trip.name}
Duration: {days} days ({trip.start_date} to {trip.end_date})
Budget limit: {trip.currency} {budget.budget_limit or 'not set'}
Total estimated: {trip.currency} {budget.total:.2f}
Cost per day: {trip.currency} {budget.cost_per_day:.2f}
Remaining: {trip.currency} {budget.remaining if budget.remaining is not None else 'N/A'}

Category breakdown:
{cat_lines}"""

    prompt = f"""You are a smart travel budget advisor. Analyse this trip budget and provide detailed insights.

{budget_info}

Return ONLY valid JSON matching this schema:
{{
  "overall_health": "healthy|warning|critical",
  "headline": "Short headline about budget status (max 10 words)",
  "summary": "2-3 sentence overall budget assessment",
  "reallocation_advice": "Optional advice on redistributing budget",
  "top_saving_opportunities": ["tip1", "tip2", "tip3"],
  "insights": [
    {{
      "category": "transportation",
      "status": "on_track|overspending|underspending|no_data",
      "message": "Specific insight for this category",
      "saving_tip": "Optional actionable saving tip",
      "suggested_adjustment": 500.00
    }}
  ]
}}

Provide insights for all 5 categories: transportation, accommodation, activities, food, other.
Be specific and actionable. Reference actual numbers from the data."""

    model = get_gemini_model()
    response = model.generate_content(prompt)
    raw = _extract_json(response.text)
    data = json.loads(raw)

    return BudgetOptimizerResponse(
        overall_health=data['overall_health'],
        headline=data['headline'],
        summary=data['summary'],
        reallocation_advice=data.get('reallocation_advice'),
        top_saving_opportunities=data.get('top_saving_opportunities', []),
        insights=[
            BudgetInsight(
                category=insight['category'],
                status=insight['status'],
                message=insight['message'],
                saving_tip=insight.get('saving_tip'),
                suggested_adjustment=Decimal(str(insight['suggested_adjustment'])) if insight.get('suggested_adjustment') else None,
            )
            for insight in data['insights']
        ],
    )


# ─── 4. Smart Destination Discovery ──────────────────────────────────────────

def recommend_destinations(
    db: Session,
    user_id: int,
    request: DiscoveryRequest,
) -> DiscoveryResponse:
    # Enrich request with DB data if not supplied
    if not request.past_destinations:
        rows = db.execute(
            select(City.name).join(TripStop, TripStop.city_id == City.id)
            .join(Trip, Trip.id == TripStop.trip_id)
            .where(Trip.owner_user_id == user_id)
            .distinct()
        ).scalars().all()
        request.past_destinations = list(rows)

    if not request.saved_destinations:
        request.saved_destinations = []

    past_str = ', '.join(request.past_destinations) or 'none yet'
    saved_str = ', '.join(request.saved_destinations) or 'none yet'
    cats_str = ', '.join(request.preferred_categories) or 'general'
    exclude_str = ', '.join(request.exclude_destinations) or 'none'

    prompt = f"""You are a world-class travel recommendation engine. Recommend {request.count} travel destinations.

User profile:
- Past destinations: {past_str}
- Wishlisted destinations: {saved_str}
- Budget style: {request.budget_style}
- Preferred activities: {cats_str}
- Exclude: {exclude_str}

Return ONLY valid JSON:
{{
  "personalization_summary": "Why these recommendations match this traveller",
  "recommendations": [
    {{
      "city": "City Name",
      "country": "Country",
      "reason": "Why this matches the user's profile (2 sentences)",
      "highlights": ["highlight1", "highlight2", "highlight3"],
      "best_season": "e.g. October to March",
      "estimated_daily_budget": "e.g. INR 2,000 - 4,000 per day",
      "match_score": 87
    }}
  ]
}}

Recommend {request.count} unique destinations. Do not repeat past or excluded destinations.
Prioritise destinations that complement their travel history and interests."""

    model = get_gemini_model()
    response = model.generate_content(prompt)
    raw = _extract_json(response.text)
    data = json.loads(raw)

    return DiscoveryResponse(
        personalization_summary=data['personalization_summary'],
        recommendations=[
            DestinationRecommendation(**rec) for rec in data['recommendations']
        ],
    )
