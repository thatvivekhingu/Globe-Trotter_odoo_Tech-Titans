def signup(client, email: str, full_name: str = 'Demo Traveller') -> tuple[str, dict]:
    response = client.post('/api/v1/auth/signup', json={'email': email, 'password': 'correct-horse-battery', 'full_name': full_name})
    assert response.status_code == 201
    payload = response.json()
    return payload['access_token'], {'Authorization': f"Bearer {payload['access_token']}"}


def test_health_and_city_search(client):
    health = client.get('/health')
    assert health.status_code == 200
    assert health.json()['status'] == 'ok'

    cities = client.get('/api/v1/cities', params={'q': 'Goa'})
    assert cities.status_code == 200
    assert [city['slug'] for city in cities.json()] == ['goa']


def test_signup_trip_stop_activity_and_budget_flow(client):
    token, headers = signup(client, 'owner@example.com', 'Route Owner')
    assert token

    trip_response = client.post('/api/v1/trips', headers=headers, json={
        'name': 'Konkan Test Route',
        'start_date': '2026-10-03',
        'end_date': '2026-10-06',
        'budget_limit': '10000',
    })
    assert trip_response.status_code == 201
    trip = trip_response.json()

    goa = client.get('/api/v1/cities', params={'q': 'Goa'}).json()[0]
    stop_response = client.post(f"/api/v1/trips/{trip['id']}/stops", headers=headers, json={
        'city_id': goa['id'],
        'arrival_date': '2026-10-03',
        'departure_date': '2026-10-04',
    })
    assert stop_response.status_code == 201
    stop = stop_response.json()

    activity = client.get('/api/v1/activities', params={'city_id': goa['id'], 'category': 'adventure'}).json()[0]
    activity_response = client.post(f"/api/v1/trips/{trip['id']}/activities", headers=headers, json={
        'trip_stop_id': stop['id'],
        'activity_id': activity['id'],
        'scheduled_date': '2026-10-04',
        'start_time': '10:00:00',
        'duration_minutes': 180,
        'estimated_cost': '3200',
    })
    assert activity_response.status_code == 201

    budget = client.get(f"/api/v1/trips/{trip['id']}/budget", headers=headers)
    assert budget.status_code == 200
    assert budget.json()['total'] == '3200.00'
    assert budget.json()['categories']['activities'] == '3200.00'


def test_private_trip_is_not_visible_to_another_user(client):
    _, owner_headers = signup(client, 'private-owner@example.com')
    trip = client.post('/api/v1/trips', headers=owner_headers, json={
        'name': 'Private Route',
        'start_date': '2026-12-01',
        'end_date': '2026-12-02',
    }).json()
    _, other_headers = signup(client, 'other-user@example.com')

    response = client.get(f"/api/v1/trips/{trip['id']}", headers=other_headers)
    assert response.status_code == 404


def test_activity_city_must_match_stop_city(client):
    _, headers = signup(client, 'city-rule@example.com')
    trip = client.post('/api/v1/trips', headers=headers, json={
        'name': 'City Rule Route',
        'start_date': '2026-10-03',
        'end_date': '2026-10-06',
    }).json()
    goa = client.get('/api/v1/cities', params={'q': 'Goa'}).json()[0]
    mumbai = client.get('/api/v1/cities', params={'q': 'Mumbai'}).json()[0]
    stop = client.post(f"/api/v1/trips/{trip['id']}/stops", headers=headers, json={
        'city_id': goa['id'],
        'arrival_date': '2026-10-03',
        'departure_date': '2026-10-06',
    }).json()
    activity = client.get('/api/v1/activities', params={'city_id': mumbai['id']}).json()[0]

    response = client.post(f"/api/v1/trips/{trip['id']}/activities", headers=headers, json={
        'trip_stop_id': stop['id'],
        'activity_id': activity['id'],
        'scheduled_date': '2026-10-04',
        'start_time': '10:00:00',
        'duration_minutes': activity['duration_minutes'],
        'estimated_cost': str(activity['default_cost']),
    })
    assert response.status_code == 422


def test_recommendations_use_catalogue_without_provider(client):
    response = client.post('/api/v1/ai/recommendations', json={
        'starting_city': 'Ahmedabad',
        'days': 3,
        'budget': 18000,
        'travel_style': 'balanced',
        'interests': ['food'],
        'destination_type': 'heritage',
    })

    assert response.status_code == 200
    payload = response.json()
    assert payload['days']
    assert payload['budgetBreakdown']['transportation'] == 4500


def test_stop_date_update_cannot_exclude_existing_activity(client):
    _, headers = signup(client, 'stop-date-rule@example.com')
    trip = client.post('/api/v1/trips', headers=headers, json={
        'name': 'Stop Date Rule Route',
        'start_date': '2026-10-03',
        'end_date': '2026-10-06',
    }).json()
    goa = client.get('/api/v1/cities', params={'q': 'Goa'}).json()[0]
    stop = client.post(f"/api/v1/trips/{trip['id']}/stops", headers=headers, json={
        'city_id': goa['id'],
        'arrival_date': '2026-10-03',
        'departure_date': '2026-10-06',
    }).json()
    activity = client.get('/api/v1/activities', params={'city_id': goa['id']}).json()[0]
    created = client.post(f"/api/v1/trips/{trip['id']}/activities", headers=headers, json={
        'trip_stop_id': stop['id'],
        'activity_id': activity['id'],
        'scheduled_date': '2026-10-05',
        'start_time': '10:00:00',
        'duration_minutes': activity['duration_minutes'],
        'estimated_cost': str(activity['default_cost']),
    })
    assert created.status_code == 201

    response = client.patch(f"/api/v1/trips/{trip['id']}/stops/{stop['id']}", headers=headers, json={
        'departure_date': '2026-10-04',
    })
    assert response.status_code == 422
    assert response.json()['detail'] == 'Stop dates cannot exclude an existing activity.'


def test_stop_reorder_persists_for_owner(client):
    _, headers = signup(client, 'stop-reorder@example.com')
    trip = client.post('/api/v1/trips', headers=headers, json={
        'name': 'Stop Reorder Route',
        'start_date': '2026-10-03',
        'end_date': '2026-10-06',
    }).json()
    goa = client.get('/api/v1/cities', params={'q': 'Goa'}).json()[0]
    mumbai = client.get('/api/v1/cities', params={'q': 'Mumbai'}).json()[0]
    first = client.post(f"/api/v1/trips/{trip['id']}/stops", headers=headers, json={
        'city_id': goa['id'],
        'arrival_date': '2026-10-03',
        'departure_date': '2026-10-04',
    }).json()
    second = client.post(f"/api/v1/trips/{trip['id']}/stops", headers=headers, json={
        'city_id': mumbai['id'],
        'arrival_date': '2026-10-04',
        'departure_date': '2026-10-06',
    }).json()

    response = client.post(f"/api/v1/trips/{trip['id']}/stops/reorder", headers=headers, json={
        'ordered_ids': [second['id'], first['id']],
    })
    assert response.status_code == 200
    assert [item['id'] for item in response.json()] == [second['id'], first['id']]


def test_chat_does_not_fabricate_when_provider_is_unavailable(client):
    _, headers = signup(client, 'ai-provider@example.com')
    response = client.post('/api/v1/ai/chat', headers=headers, json={'message': 'What should I do in Goa?'})

    assert response.status_code == 503
    assert 'API_KEY' in response.json()['detail'] or 'AI provider' in response.json()['detail'] or 'provider' in response.json()['detail']


def test_ai_status_does_not_expose_provider_secret(client):
    response = client.get('/api/v1/ai/status')

    assert response.status_code == 200
    assert response.json()['configured'] is False
    assert 'api_key' not in response.json()
