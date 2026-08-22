from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Activity, City

CITY_SEEDS = [
    {'slug': 'ahmedabad', 'name': 'Ahmedabad', 'country': 'India', 'region': 'Gujarat', 'latitude': Decimal('23.022505'), 'longitude': Decimal('72.571362'), 'popularity_score': 74, 'cost_index': 'medium'},
    {'slug': 'mumbai', 'name': 'Mumbai', 'country': 'India', 'region': 'Maharashtra', 'latitude': Decimal('19.075984'), 'longitude': Decimal('72.877656'), 'popularity_score': 91, 'cost_index': 'high'},
    {'slug': 'goa', 'name': 'Goa', 'country': 'India', 'region': 'Konkan Coast', 'latitude': Decimal('15.299326'), 'longitude': Decimal('74.124008'), 'popularity_score': 96, 'cost_index': 'medium'},
    {'slug': 'delhi', 'name': 'Delhi', 'country': 'India', 'region': 'Delhi NCR', 'latitude': Decimal('28.613939'), 'longitude': Decimal('77.209023'), 'popularity_score': 88, 'cost_index': 'medium'},
    {'slug': 'jaipur', 'name': 'Jaipur', 'country': 'India', 'region': 'Rajasthan', 'latitude': Decimal('26.912434'), 'longitude': Decimal('75.787270'), 'popularity_score': 93, 'cost_index': 'medium'},
    {'slug': 'udaipur', 'name': 'Udaipur', 'country': 'India', 'region': 'Rajasthan', 'latitude': Decimal('24.585445'), 'longitude': Decimal('73.712479'), 'popularity_score': 87, 'cost_index': 'medium'},
    {'slug': 'bengaluru', 'name': 'Bengaluru', 'country': 'India', 'region': 'Karnataka', 'latitude': Decimal('12.971599'), 'longitude': Decimal('77.594566'), 'popularity_score': 82, 'cost_index': 'medium'},
    {'slug': 'manali', 'name': 'Manali', 'country': 'India', 'region': 'Himachal Pradesh', 'latitude': Decimal('32.239632'), 'longitude': Decimal('77.188713'), 'popularity_score': 89, 'cost_index': 'low'},
]

ACTIVITY_SEEDS = [
    {'city_slug': 'goa', 'slug': 'goa-baga-beach-sunrise', 'name': 'Baga Beach sunrise walk', 'category': 'nature', 'description': 'Start slowly with a shoreline walk before the coast gets busy.', 'default_cost': Decimal('0.00'), 'duration_minutes': 90},
    {'city_slug': 'goa', 'slug': 'goa-arabian-sea-scuba', 'name': 'Arabian Sea scuba dive', 'category': 'adventure', 'description': 'A beginner-friendly reef dive with a local instructor.', 'default_cost': Decimal('3200.00'), 'duration_minutes': 180},
    {'city_slug': 'goa', 'slug': 'goa-home-style-thali', 'name': 'Home-style coastal thali', 'category': 'food', 'description': 'A generous tasting of coconut, spice, and fresh catch classics.', 'default_cost': Decimal('850.00'), 'duration_minutes': 90},
    {'city_slug': 'mumbai', 'slug': 'mumbai-gateway-blue-hour', 'name': 'Gateway of India at blue hour', 'category': 'sightseeing', 'description': 'See the harbor lights come on from Mumbai’s most iconic promenade.', 'default_cost': Decimal('0.00'), 'duration_minutes': 75},
    {'city_slug': 'mumbai', 'slug': 'mumbai-fort-food-walk', 'name': 'Fort food walk', 'category': 'food', 'description': 'A small-group walk through old bakeries, cafés, and street stalls.', 'default_cost': Decimal('1800.00'), 'duration_minutes': 150},
    {'city_slug': 'jaipur', 'slug': 'jaipur-amber-fort-trail', 'name': 'Amber Fort architecture trail', 'category': 'culture', 'description': 'Follow courtyards, mirror halls, and hilltop views with a local guide.', 'default_cost': Decimal('1400.00'), 'duration_minutes': 180},
    {'city_slug': 'jaipur', 'slug': 'jaipur-johari-bazaar', 'name': 'Johari Bazaar craft hour', 'category': 'shopping', 'description': 'Browse block prints, blue pottery, and small-batch jewelry.', 'default_cost': Decimal('600.00'), 'duration_minutes': 120},
    {'city_slug': 'udaipur', 'slug': 'udaipur-lake-pichola-sunset', 'name': 'Lake Pichola sunset boat', 'category': 'nature', 'description': 'A quiet evening on the lake with palace silhouettes in the distance.', 'default_cost': Decimal('2200.00'), 'duration_minutes': 120},
    {'city_slug': 'delhi', 'slug': 'delhi-humayun-tomb-walk', 'name': 'Humayun’s Tomb heritage walk', 'category': 'culture', 'description': 'A thoughtful architecture and garden walk through old Delhi.', 'default_cost': Decimal('900.00'), 'duration_minutes': 120},
    {'city_slug': 'manali', 'slug': 'manali-solang-meadow-hike', 'name': 'Solang Valley meadow hike', 'category': 'adventure', 'description': 'A moderate hillside route with broad valley views.', 'default_cost': Decimal('1100.00'), 'duration_minutes': 210},
    {'city_slug': 'bengaluru', 'slug': 'bengaluru-indiranagar-coffee-crawl', 'name': 'Indiranagar coffee crawl', 'category': 'food', 'description': 'A relaxed tasting route through three independent coffee counters.', 'default_cost': Decimal('1250.00'), 'duration_minutes': 135},
    {'city_slug': 'ahmedabad', 'slug': 'ahmedabad-heritage-pol-walk', 'name': 'Old city heritage pol walk', 'category': 'culture', 'description': 'A guided morning through carved façades, courtyards, and local stories.', 'default_cost': Decimal('600.00'), 'duration_minutes': 120},
]


def seed_reference_data(db: Session) -> None:
    cities_by_slug: dict[str, City] = {}
    for payload in CITY_SEEDS:
        city = db.scalar(select(City).where(City.slug == payload['slug']))
        if city is None:
            city = City(**payload)
            db.add(city)
        else:
            for key, value in payload.items():
                setattr(city, key, value)
        cities_by_slug[city.slug] = city
    db.flush()

    for payload in ACTIVITY_SEEDS:
        city = cities_by_slug[payload['city_slug']]
        activity = db.scalar(select(Activity).where(Activity.slug == payload['slug']))
        activity_payload = {key: value for key, value in payload.items() if key != 'city_slug'}
        activity_payload['city_id'] = city.id
        if activity is None:
            db.add(Activity(**activity_payload))
        else:
            for key, value in activity_payload.items():
                setattr(activity, key, value)
    db.commit()
