from .test_api import signup


def test_signup_login_current_user_and_logout(client):
    signup_response = client.post('/api/v1/auth/signup', json={
        'email': 'auth-flow@example.com',
        'password': 'correct-horse-battery',
        'full_name': '  Auth   Traveller  ',
    })
    assert signup_response.status_code == 201
    signup_payload = signup_response.json()
    assert signup_payload['user']['full_name'] == 'Auth Traveller'
    assert signup_payload['user']['email'] == 'auth-flow@example.com'
    assert signup_payload['access_token']

    headers = {'Authorization': f"Bearer {signup_payload['access_token']}"}
    current_user = client.get('/api/v1/users/me', headers=headers)
    assert current_user.status_code == 200
    assert current_user.json()['id'] == signup_payload['user']['id']

    login_response = client.post('/api/v1/auth/login', json={
        'email': 'AUTH-FLOW@EXAMPLE.COM',
        'password': 'correct-horse-battery',
    })
    assert login_response.status_code == 200
    assert login_response.json()['user']['email'] == 'auth-flow@example.com'

    logout_response = client.post('/api/v1/auth/logout', headers=headers)
    assert logout_response.status_code == 200


def test_invalid_credentials_and_invalid_token_are_rejected(client):
    signup(client, 'invalid-credentials@example.com')

    invalid_password = client.post('/api/v1/auth/login', json={
        'email': 'invalid-credentials@example.com',
        'password': 'not-the-password',
    })
    assert invalid_password.status_code == 401
    assert invalid_password.json()['detail'] == 'Invalid email or password.'

    invalid_token = client.get('/api/v1/users/me', headers={'Authorization': 'Bearer not-a-real-token'})
    assert invalid_token.status_code == 401


def test_duplicate_signup_and_profile_update(client):
    token, headers = signup(client, 'duplicate@example.com', 'Original Name')
    assert token

    duplicate = client.post('/api/v1/auth/signup', json={
        'email': 'DUPLICATE@example.com',
        'password': 'another-correct-password',
        'full_name': 'Another Name',
    })
    assert duplicate.status_code == 409

    update = client.patch('/api/v1/users/me', headers=headers, json={
        'full_name': 'Updated Name',
        'language_code': 'hi',
    })
    assert update.status_code == 200
    assert update.json()['full_name'] == 'Updated Name'
    assert update.json()['language_code'] == 'hi'
