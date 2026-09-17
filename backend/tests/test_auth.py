"""
Tests for authentication endpoints
"""
import pytest
import json
from app import create_app
from app.models.user import User, UserRole
from config import get_config

@pytest.fixture
def app():
    """Create application for testing"""
    app = create_app(get_config('testing'))
    app.config['TESTING'] = True
    return app

@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()

@pytest.fixture
def db(app):
    """Create database for testing"""
    from app import db
    with app.app_context():
        db.create_all()
        yield db
        db.drop_all()

@pytest.fixture
def test_user(db):
    """Create test user"""
    user = User(
        email='test@example.com',
        username='testuser',
        first_name='Test',
        last_name='User',
        role=UserRole.DOCTOR,
        is_active=True,
        is_verified=True
    )
    user.set_password('testpass123')
    db.session.add(user)
    db.session.commit()
    return user

def test_register(client):
    """Test user registration"""
    response = client.post('/api/auth/register', json={
        'email': 'newuser@example.com',
        'username': 'newuser',
        'password': 'password123',
        'first_name': 'New',
        'last_name': 'User'
    })
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'user' in data
    assert data['user']['email'] == 'newuser@example.com'

def test_login_success(client, test_user):
    """Test successful login"""
    response = client.post('/api/auth/login', json={
        'email_or_username': 'testuser',
        'password': 'testpass123'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'tokens' in data
    assert 'user' in data

def test_login_failure(client, test_user):
    """Test failed login with wrong password"""
    response = client.post('/api/auth/login', json={
        'email_or_username': 'testuser',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401

def test_get_current_user(client, test_user):
    """Test getting current user with valid token"""
    # First login to get token
    login_response = client.post('/api/auth/login', json={
        'email_or_username': 'testuser',
        'password': 'testpass123'
    })
    token = json.loads(login_response.data)['tokens']['access_token']
    
    # Use token to get current user
    response = client.get('/api/auth/me', headers={
        'Authorization': f'Bearer {token}'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['user']['username'] == 'testuser'
