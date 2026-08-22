from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Activity, City

CITY_SEEDS = [
    {'slug': 'mumbai', 'name': 'Mumbai', 'country': 'India', 'region': 'Maharashtra', 'latitude': Decimal('18.9220'), 'longitude': Decimal('72.8347'), 'popularity_score': 96, 'cost_index': 'high', 'image_url': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Gateway of India, Mumbai'},
    {'slug': 'goa', 'name': 'Goa', 'country': 'India', 'region': 'Konkan Coast', 'latitude': Decimal('15.2993'), 'longitude': Decimal('74.1240'), 'popularity_score': 98, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Palolem Beach, Goa'},
    {'slug': 'jaipur', 'name': 'Jaipur', 'country': 'India', 'region': 'Rajasthan', 'latitude': Decimal('26.9124'), 'longitude': Decimal('75.7873'), 'popularity_score': 94, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Hawa Mahal, Jaipur'},
    {'slug': 'udaipur', 'name': 'Udaipur', 'country': 'India', 'region': 'Rajasthan', 'latitude': Decimal('24.5854'), 'longitude': Decimal('73.7125'), 'popularity_score': 93, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'City Palace, Udaipur'},
    {'slug': 'jaisalmer', 'name': 'Jaisalmer', 'country': 'India', 'region': 'Rajasthan', 'latitude': Decimal('26.9157'), 'longitude': Decimal('70.9083'), 'popularity_score': 89, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Thar Desert Sand Dunes, Jaisalmer'},
    {'slug': 'varanasi', 'name': 'Varanasi', 'country': 'India', 'region': 'Uttar Pradesh', 'latitude': Decimal('25.3176'), 'longitude': Decimal('82.9739'), 'popularity_score': 95, 'cost_index': 'low', 'image_url': 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Dashashwamedh Ghat, Varanasi'},
    {'slug': 'agra', 'name': 'Agra', 'country': 'India', 'region': 'Uttar Pradesh', 'latitude': Decimal('27.1767'), 'longitude': Decimal('78.0081'), 'popularity_score': 97, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Taj Mahal, Agra'},
    {'slug': 'delhi', 'name': 'Delhi', 'country': 'India', 'region': 'Delhi NCR', 'latitude': Decimal('28.6139'), 'longitude': Decimal('77.2090'), 'popularity_score': 95, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'India Gate, Delhi'},
    {'slug': 'amritsar', 'name': 'Amritsar', 'country': 'India', 'region': 'Punjab', 'latitude': Decimal('31.6200'), 'longitude': Decimal('74.8765'), 'popularity_score': 91, 'cost_index': 'low', 'image_url': 'https://images.unsplash.com/photo-1583275479278-709ffaa5b169?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Golden Temple, Amritsar'},
    {'slug': 'manali', 'name': 'Manali', 'country': 'India', 'region': 'Himachal Pradesh', 'latitude': Decimal('32.2396'), 'longitude': Decimal('77.1887'), 'popularity_score': 92, 'cost_index': 'low', 'image_url': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Solang Valley, Manali'},
    {'slug': 'shimla', 'name': 'Shimla', 'country': 'India', 'region': 'Himachal Pradesh', 'latitude': Decimal('31.1048'), 'longitude': Decimal('77.1734'), 'popularity_score': 88, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'The Ridge, Shimla'},
    {'slug': 'rishikesh', 'name': 'Rishikesh', 'country': 'India', 'region': 'Uttarakhand', 'latitude': Decimal('30.0869'), 'longitude': Decimal('78.2676'), 'popularity_score': 93, 'cost_index': 'low', 'image_url': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Laxman Jhula, Rishikesh'},
    {'slug': 'ladakh', 'name': 'Leh-Ladakh', 'country': 'India', 'region': 'Ladakh', 'latitude': Decimal('34.1526'), 'longitude': Decimal('77.5771'), 'popularity_score': 96, 'cost_index': 'high', 'image_url': 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Pangong Tso Lake, Ladakh'},
    {'slug': 'srinagar', 'name': 'Srinagar', 'country': 'India', 'region': 'Jammu & Kashmir', 'latitude': Decimal('34.0837'), 'longitude': Decimal('74.7973'), 'popularity_score': 90, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Dal Lake, Srinagar'},
    {'slug': 'kolkata', 'name': 'Kolkata', 'country': 'India', 'region': 'West Bengal', 'latitude': Decimal('22.5726'), 'longitude': Decimal('88.3639'), 'popularity_score': 88, 'cost_index': 'low', 'image_url': 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Howrah Bridge, Kolkata'},
    {'slug': 'darjeeling', 'name': 'Darjeeling', 'country': 'India', 'region': 'West Bengal', 'latitude': Decimal('27.0410'), 'longitude': Decimal('88.2663'), 'popularity_score': 89, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Tea Gardens, Darjeeling'},
    {'slug': 'ahmedabad', 'name': 'Ahmedabad', 'country': 'India', 'region': 'Gujarat', 'latitude': Decimal('23.0225'), 'longitude': Decimal('72.5714'), 'popularity_score': 84, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1599831104321-71bc56950293?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Adalaj Stepwell, Ahmedabad'},
    {'slug': 'bengaluru', 'name': 'Bengaluru', 'country': 'India', 'region': 'Karnataka', 'latitude': Decimal('12.9716'), 'longitude': Decimal('77.5946'), 'popularity_score': 89, 'cost_index': 'high', 'image_url': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Cubbon Park, Bengaluru'},
    {'slug': 'hampi', 'name': 'Hampi', 'country': 'India', 'region': 'Karnataka', 'latitude': Decimal('15.3350'), 'longitude': Decimal('76.4600'), 'popularity_score': 94, 'cost_index': 'low', 'image_url': 'https://images.unsplash.com/photo-1600100397608-f010e42a9b4d?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Vijayanagara Stone Chariot, Hampi'},
    {'slug': 'coorg', 'name': 'Coorg', 'country': 'India', 'region': 'Karnataka', 'latitude': Decimal('12.3375'), 'longitude': Decimal('75.8069'), 'popularity_score': 90, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Coffee Plantations, Coorg'},
    {'slug': 'kochi', 'name': 'Kochi', 'country': 'India', 'region': 'Kerala', 'latitude': Decimal('9.9312'), 'longitude': Decimal('76.2673'), 'popularity_score': 95, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Alleppey Backwaters, Kerala'},
    {'slug': 'munnar', 'name': 'Munnar', 'country': 'India', 'region': 'Kerala', 'latitude': Decimal('10.0889'), 'longitude': Decimal('77.0595'), 'popularity_score': 93, 'cost_index': 'low', 'image_url': 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Tea Valleys, Munnar'},
    {'slug': 'chennai', 'name': 'Chennai', 'country': 'India', 'region': 'Tamil Nadu', 'latitude': Decimal('12.6208'), 'longitude': Decimal('80.1945'), 'popularity_score': 87, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Shore Temple Mahabalipuram'},
    {'slug': 'madurai', 'name': 'Madurai', 'country': 'India', 'region': 'Tamil Nadu', 'latitude': Decimal('9.9252'), 'longitude': Decimal('78.1198'), 'popularity_score': 89, 'cost_index': 'low', 'image_url': 'https://images.unsplash.com/photo-1621847468516-1ed5d0df56fe?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Meenakshi Amman Temple, Madurai'},
    {'slug': 'pondicherry', 'name': 'Pondicherry', 'country': 'India', 'region': 'Puducherry', 'latitude': Decimal('11.9416'), 'longitude': Decimal('79.8083'), 'popularity_score': 91, 'cost_index': 'medium', 'image_url': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'French Quarter, Pondicherry'},
    {'slug': 'andaman', 'name': 'Havelock Island', 'country': 'India', 'region': 'Andaman & Nicobar', 'latitude': Decimal('11.9761'), 'longitude': Decimal('92.9876'), 'popularity_score': 96, 'cost_index': 'high', 'image_url': 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80', 'image_alt': 'Radhanagar Beach, Havelock Island'},
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
