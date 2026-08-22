import json
import urllib.request
import urllib.error
from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.core.config import settings

router = APIRouter()


class RecommendationRequest(BaseModel):
    starting_city: str = Field(default='Ahmedabad', description='Origin city')
    days: int = Field(default=5, ge=1, le=30)
    budget: float = Field(default=25000.0, ge=1000.0)
    travel_style: str = Field(default='balanced')
    interests: list[str] = Field(default_factory=lambda: ['Heritage & Palaces', 'Local Street Food'])
    destination_type: str = Field(default='heritage')


class ChatRequest(BaseModel):
    message: str
    trip_context: str | None = None


def call_groq_llm(prompt: str, json_mode: bool = False) -> str | None:
    api_key = settings.groq_api_key
    if not api_key:
        return None

    url = "https://api.groq.com/openai/v1/chat/completions"
    payload = {
        "model": settings.groq_model,
        "messages": [
            {"role": "system", "content": "You are GlobeTrotter AI, an expert travel architect." + (" Output valid JSON only." if json_mode else "")},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.6,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {api_key}'
            }
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data['choices'][0]['message']['content']
    except Exception as e:
        print(f"[Groq LLM Error] {e}")
        return None


@router.post('/recommendations')
def generate_recommendations(req: RecommendationRequest) -> dict[str, Any]:
    """
    Generate AI-powered, constraint-aware travel itineraries using Gemini 1.5 Flash
    with robust deterministic fallback.
    """
    prompt = f"""
You are GlobeTrotter AI, an expert travel architect.
Create a detailed, realistic travel itinerary for India based on these constraints:
- Origin: {req.starting_city}
- Destination Type: {req.destination_type}
- Duration: {req.days} days
- Total Budget: INR {req.budget}
- Travel Style: {req.travel_style}
- Interests: {', '.join(req.interests)}

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

    # Deterministic fallback when API key is rate-limited or offline
    trans_budget = round(req.budget * 0.25)
    hotel_budget = round(req.budget * 0.40)
    act_budget = round(req.budget * 0.15)
    food_budget = round(req.budget * 0.15)
    other_budget = round(req.budget * 0.05)

    dest_city = "Jaipur" if req.destination_type == "heritage" else "Goa" if req.destination_type == "coastal" else "Manali"

    return {
        "tripName": f"{dest_city} Slow Escape ({req.days} Days)",
        "summary": f"A carefully balanced {req.days}-day {req.travel_style} journey from {req.starting_city} exploring the beauty of {dest_city}.",
        "suggestedCities": [dest_city],
        "budgetBreakdown": {
            "transportation": trans_budget,
            "accommodation": hotel_budget,
            "activities": act_budget,
            "food": food_budget,
            "other": other_budget
        },
        "days": [
            {
                "dayNumber": i + 1,
                "city": dest_city,
                "theme": f"Day {i + 1} Discovery & Exploration",
                "activities": [
                    {
                        "name": f"Morning Anchor in {dest_city}",
                        "category": "sightseeing",
                        "time": "09:30",
                        "cost": round(act_budget / req.days * 0.5),
                        "duration": "2.5h"
                    },
                    {
                        "name": "Local Cuisine & Cultural Walk",
                        "category": "food",
                        "time": "14:00",
                        "cost": round(food_budget / req.days * 0.4),
                        "duration": "2h"
                    },
                    {
                        "name": "Sunset Viewpoint & Leisure",
                        "category": "nature",
                        "time": "17:30",
                        "cost": 0,
                        "duration": "1.5h"
                    }
                ]
            }
            for i in range(req.days)
        ],
        "proTips": [
            "Book intercity rail or express trains 15 days in advance for best fares.",
            "Carry a refillable water bottle and comfortable trail sneakers.",
            "Check local museum opening hours as some are closed on Mondays."
        ]
    }


@router.post('/chat')
def chat_copilot(req: ChatRequest) -> dict[str, str]:
    """
    AI Travel Copilot chat endpoint powered by Groq LLaMA / GPT-OSS 120B.
    """
    prompt = f"""
You are GlobeTrotter AI Copilot, a helpful and knowledgeable travel assistant.
Context: {req.trip_context or 'General travel in India and worldwide'}
User question: {req.message}

Respond concisely and practically with friendly travel guidance in 2-3 short bullet points or sentences.
"""
    reply = call_groq_llm(prompt)
    if not reply:
        reply = "I recommend booking transport early, trying local breakfast specialties, and keeping a buffer for unexpected scenic detours!"

    return {"response": reply}
