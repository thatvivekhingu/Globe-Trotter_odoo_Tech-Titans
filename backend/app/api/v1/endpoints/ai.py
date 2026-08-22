"""AI endpoints — Tier 1 features (itinerary generator, chat, budget optimizer, discovery) and RAG recommendations."""
import json
import urllib.error
import urllib.request
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models import Trip, User
from app.schemas.ai import (
    BudgetOptimizerResponse,
    ChatRequest,
    ChatResponse,
    DiscoveryRequest,
    DiscoveryResponse,
    ItineraryRequest,
    ItineraryResponse,
)
from app.services.ai_service import (
    analyse_budget,
    chat_with_guide,
    generate_itinerary,
    recommend_destinations,
)
from app.services.rag import format_context, retrieve_travel_context

router = APIRouter()


class RecommendationRequest(BaseModel):
    starting_city: str = Field(default='Ahmedabad', description='Origin city')
    days: int = Field(default=5, ge=1, le=30)
    budget: float = Field(default=25000.0, ge=1000.0)
    travel_style: str = Field(default='balanced')
    interests: list[str] = Field(default_factory=lambda: ['Heritage & Palaces', 'Local Street Food'])
    destination_type: str = Field(default='heritage')


class RAGChatRequest(BaseModel):
    message: str
    trip_context: str | None = None


def call_groq_llm(prompt: str, json_mode: bool = False) -> str | None:
    api_key = getattr(settings, 'groq_api_key', '')
    if not api_key:
        return None

    url = 'https://api.groq.com/openai/v1/chat/completions'
    payload = {
        'model': getattr(settings, 'groq_model', 'openai/gpt-oss-120b'),
        'messages': [
            {
                'role': 'system',
                'content': 'You are GlobeTrotter AI, an expert travel architect.' + (' Output valid JSON only.' if json_mode else ''),
            },
            {'role': 'user', 'content': prompt},
        ],
        'temperature': 0.6,
    }
    if json_mode:
        payload['response_format'] = {'type': 'json_object'}

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {api_key}'},
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data['choices'][0]['message']['content']
    except Exception as e:
        print(f'[Groq LLM Error] {e}')
        return None


@router.post('/itinerary', response_model=ItineraryResponse, status_code=status.HTTP_200_OK)
def ai_generate_itinerary(
    payload: ItineraryRequest,
    _current_user: User = Depends(get_current_user),
) -> ItineraryResponse:
    """Generate a full day-by-day AI itinerary for any destination."""
    try:
        return generate_itinerary(payload)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f'AI service error: {exc}',
        ) from exc


@router.post('/chat', response_model=ChatResponse)
def ai_chat(
    payload: ChatRequest,
    _current_user: User = Depends(get_current_user),
) -> ChatResponse:
    """Chat with Globe Guide, the AI travel assistant."""
    try:
        return chat_with_guide(payload)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f'AI service error: {exc}',
        ) from exc


@router.get('/budget/{trip_id}', response_model=BudgetOptimizerResponse)
def ai_budget_insights(
    trip_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BudgetOptimizerResponse:
    """Get AI-powered budget insights and saving recommendations for a trip."""
    trip = db.scalar(select(Trip).where(Trip.id == trip_id, Trip.owner_user_id == current_user.id))
    if trip is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Trip not found.')
    try:
        return analyse_budget(db, trip)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f'AI service error: {exc}',
        ) from exc


@router.post('/discover', response_model=DiscoveryResponse)
def ai_discover_destinations(
    payload: DiscoveryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DiscoveryResponse:
    """Get AI-powered personalised destination recommendations."""
    try:
        return recommend_destinations(db, current_user.id, payload)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f'AI service error: {exc}',
        ) from exc


@router.post('/recommendations')
def generate_recommendations(req: RecommendationRequest, db: Session = Depends(get_db)) -> dict[str, Any]:
    """Generate AI-powered, constraint-aware travel itineraries using grounded RAG data."""
    retrieved_context = format_context(retrieve_travel_context(db, f'{req.starting_city} {req.destination_type} {" ".join(req.interests)}'))
    prompt = f"""
You are GlobeTrotter AI, an expert travel architect.
Create a detailed, realistic travel itinerary for India based on these constraints:
- Origin: {req.starting_city}
- Destination Type: {req.destination_type}
- Duration: {req.days} days
- Total Budget: INR {req.budget}
- Travel Style: {req.travel_style}
- Interests: {', '.join(req.interests)}

Use only the following TripWise catalogue records as factual grounding. Do not invent prices,
availability, reviews, or attractions that are not present in these records:
{retrieved_context}

Return ONLY a valid JSON object (no markdown, no backticks) with this structure:
{{
  "tripName": "Trip Name",
  "summary": "Brief inspiring summary",
  "suggestedCities": ["City 1", "City 2"],
  "budgetBreakdown": {{
    "transportation": 6000,
    "accommodation": 10000,
    "activities": 4000,
    "food": 5000,
    "other": 1000
  }},
  "days": [
    {{
      "dayNumber": 1,
      "city": "City Name",
      "theme": "Theme of the day",
      "activities": [
        {{ "name": "Activity Name", "category": "sightseeing", "time": "09:30", "cost": 500, "duration": "2h" }}
      ]
    }}
  ],
  "proTips": ["Tip 1", "Tip 2"]
}}
"""
    raw_response = call_groq_llm(prompt, json_mode=True)
    if raw_response:
        cleaned = raw_response.strip()
        if cleaned.startswith('```json'):
            cleaned = cleaned[7:]
        if cleaned.startswith('```'):
            cleaned = cleaned[3:]
        if cleaned.endswith('```'):
            cleaned = cleaned[:-3]
        try:
            return json.loads(cleaned.strip())
        except Exception:
            pass

    trans_budget = round(req.budget * 0.25)
    hotel_budget = round(req.budget * 0.40)
    act_budget = round(req.budget * 0.15)
    food_budget = round(req.budget * 0.15)
    other_budget = round(req.budget * 0.05)

    dest_city = 'Jaipur' if req.destination_type == 'heritage' else 'Goa' if req.destination_type == 'coastal' else 'Manali'

    return {
        'tripName': f'{dest_city} Slow Escape ({req.days} Days)',
        'summary': f'A carefully balanced {req.days}-day {req.travel_style} journey from {req.starting_city} exploring the beauty of {dest_city}.',
        'suggestedCities': [dest_city],
        'budgetBreakdown': {
            'transportation': trans_budget,
            'accommodation': hotel_budget,
            'activities': act_budget,
            'food': food_budget,
            'other': other_budget,
        },
        'days': [
            {
                'dayNumber': i + 1,
                'city': dest_city,
                'theme': f'Day {i + 1} Discovery & Exploration',
                'activities': [
                    {
                        'name': f'Morning Anchor in {dest_city}',
                        'category': 'sightseeing',
                        'time': '09:30',
                        'cost': round(act_budget / req.days * 0.5),
                        'duration': '2.5h',
                    },
                    {
                        'name': 'Local Cuisine & Cultural Walk',
                        'category': 'food',
                        'time': '14:00',
                        'cost': round(food_budget / req.days * 0.4),
                        'duration': '2h',
                    },
                    {
                        'name': 'Sunset Viewpoint & Leisure',
                        'category': 'nature',
                        'time': '17:30',
                        'cost': 0,
                        'duration': '1.5h',
                    },
                ],
            }
            for i in range(req.days)
        ],
        'proTips': [
            'Book intercity rail or express trains 15 days in advance for best fares.',
            'Carry a refillable water bottle and comfortable trail sneakers.',
            'Check local museum opening hours as some are closed on Mondays.',
        ],
    }


@router.post('/copilot')
def chat_copilot(req: RAGChatRequest, db: Session = Depends(get_db)) -> dict[str, str | list[str]]:
    """AI Travel Copilot chat endpoint powered by RAG."""
    documents = retrieve_travel_context(db, f'{req.message} {req.trip_context or ""}')
    context = format_context(documents)
    prompt = f"""
You are GlobeTrotter AI Copilot, a helpful and knowledgeable travel assistant.
Context: {req.trip_context or 'General travel in India and worldwide'}
User question: {req.message}

Ground your answer in these TripWise records. If the records do not answer the question, say
that clearly and recommend checking an official provider. Never invent live prices or availability.
{context}

Respond concisely and practically with friendly travel guidance in 2-3 short bullet points or sentences.
"""
    reply = call_groq_llm(prompt)
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail='AI provider is not configured or unavailable. Set GROQ_API_KEY on the backend.',
        )

    return {'reply': reply, 'sources': [document.source for document in documents]}
