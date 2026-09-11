import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import engine, Base, AsyncSessionLocal
from app.crud.crud_user import seed_initial_roles_and_admin
from app.services.dataset_service import seed_dataset_from_csv

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_initial_roles_and_admin(session)
        await seed_dataset_from_csv(session, max_rows=500)
    yield

@pytest.mark.asyncio
async def test_system_status():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/system/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert "database_metrics" in data

@pytest.mark.asyncio
async def test_login_doctor():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/auth/login",
            json={"email": "doctor@hospital.org", "password": "Doctor@123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["role"] == "Doctor"
        assert data["email"] == "doctor@hospital.org"

@pytest.mark.asyncio
async def test_login_admin():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/auth/login",
            json={"email": "admin@hospital.org", "password": "Admin@123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "System Administrator"

@pytest.mark.asyncio
async def test_patients_rbac_protection():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Unauthenticated request should fail with 401
        response = await ac.get("/api/v1/patients")
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_patients_with_doctor_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "doctor@hospital.org", "password": "Doctor@123"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/patients", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "items" in data
        assert "total" in data

@pytest.mark.asyncio
async def test_get_encounters_with_doctor_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "doctor@hospital.org", "password": "Doctor@123"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        res = await ac.get("/api/v1/encounters", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert "items" in data
