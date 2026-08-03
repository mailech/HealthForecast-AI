import os
import sys
from fastapi.testclient import TestClient

# Adjust path to import from app
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.main import app

client = TestClient(app)

def test_health_endpoint():
    """
    Verifies health check endpoint returns correct DB connectivity status.
    """
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "version" in data
    assert "environment" in data

def test_login_success():
    """
    Tests successful login and token generation for seeded doctor user.
    """
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "doctor@hospital.com", "password": "Password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "doctor@hospital.com"
    assert data["user"]["role"] == "Doctor"

def test_login_invalid_credentials():
    """
    Checks rejection of incorrect passwords.
    """
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "doctor@hospital.com", "password": "WrongPassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_get_current_user_me():
    """
    Tests fetch of profile for validated session token.
    """
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": "doctor@hospital.com", "password": "Password123"}
    )
    token = login_resp.json()["access_token"]
    
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "doctor@hospital.com"

def test_rbac_doctor_cannot_manage_users():
    """
    Ensures RBAC denies doctors access to user administration functions.
    """
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": "doctor@hospital.com", "password": "Password123"}
    )
    token = login_resp.json()["access_token"]
    
    response = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 403
    assert "Operation forbidden" in response.json()["detail"]

def test_rbac_sysadmin_can_manage_users():
    """
    Ensures System Administrators can query users registry.
    """
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": "sysadmin@hospital.com", "password": "Password123"}
    )
    token = login_resp.json()["access_token"]
    
    response = client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) > 0
