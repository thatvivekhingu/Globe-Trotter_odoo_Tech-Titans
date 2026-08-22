from dataclasses import dataclass
import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Activity, City


@dataclass(frozen=True)
class RetrievedDocument:
    source: str
    title: str
    content: str
    score: int


def _tokens(value: str) -> set[str]:
    return {token for token in re.findall(r"[a-z0-9]+", value.lower()) if len(token) > 2}


def retrieve_travel_context(db: Session, query: str, limit: int = 8) -> list[RetrievedDocument]:
    query_tokens = _tokens(query)
    cities = list(db.scalars(select(City)).all())
    activities = list(db.scalars(select(Activity)).all())
    documents: list[RetrievedDocument] = []

    for city in cities:
        searchable = f'{city.name} {city.country} {city.region} {city.cost_index}'
        score = len(query_tokens & _tokens(searchable))
        if score:
            documents.append(RetrievedDocument(
                source=f'city:{city.slug}',
                title=city.name,
                content=f'{city.name}, {city.region}, {city.country}. Cost index: {city.cost_index}. Popularity score: {city.popularity_score}.',
                score=score,
            ))

    city_names = {city.id: city.name for city in cities}
    for activity in activities:
        searchable = f'{activity.name} {activity.description or ""} {activity.category} {city_names.get(activity.city_id, "")}'
        score = len(query_tokens & _tokens(searchable))
        if score:
            documents.append(RetrievedDocument(
                source=f'activity:{activity.slug}',
                title=activity.name,
                content=f'{activity.name} in {city_names.get(activity.city_id, "the selected city")}. Category: {activity.category}. Cost: INR {activity.default_cost}. Duration: {activity.duration_minutes} minutes. {activity.description or ""}',
                score=score,
            ))

    return sorted(documents, key=lambda document: (-document.score, document.title))[:limit]


def format_context(documents: list[RetrievedDocument]) -> str:
    if not documents:
        return 'No matching destination or activity records were found in the TripWise catalogue.'
    return '\n'.join(f'[{document.source}] {document.content}' for document in documents)
