import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import engine, Base, AsyncSessionLocal
from app.crud.crud_user import seed_initial_roles_and_admin

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_initial_roles_and_admin(session)
    yield

async def get_token_for(ac: AsyncClient, email: str, password: str) -> str:
    res = await ac.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, f"Login failed for {email}: {res.text}"
    return res.json()["access_token"]

# ----------------------------------------------------------------------
# 1-4: Prediction Endpoint RBAC Tests
# ----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_doctor_can_access_prediction():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "doctor@hospital.org", "Doctor@123")
        headers = {"Authorization": f"Bearer {token}"}
        
        sample_request = {
            "time_in_hospital": 3,
            "num_lab_procedures": 40,
            "num_procedures": 1,
            "num_medications": 10,
            "number_outpatient": 0,
            "number_emergency": 0,
            "number_inpatient": 0,
            "number_diagnoses": 5,
            "race": "Caucasian",
            "gender": "Female",
            "age": "[60-70)"
        }
        res = await ac.post("/api/v1/predictions/predict", json=sample_request, headers=headers)
        assert res.status_code == 200, f"Doctor should access prediction: {res.text}"
        assert "risk_probability" in res.json()

@pytest.mark.asyncio
async def test_hospital_administrator_forbidden_from_prediction():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "hospital_admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        
        sample_request = {
            "time_in_hospital": 3,
            "num_lab_procedures": 40,
            "num_procedures": 1,
            "num_medications": 10
        }
        res = await ac.post("/api/v1/predictions/predict", json=sample_request, headers=headers)
        assert res.status_code == 403, "Hospital Administrator must be forbidden from clinical prediction API"

@pytest.mark.asyncio
async def test_healthcare_researcher_forbidden_from_prediction():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "researcher@hospital.org", "Research@123")
        headers = {"Authorization": f"Bearer {token}"}
        
        sample_request = {
            "time_in_hospital": 3,
            "num_lab_procedures": 40,
            "num_procedures": 1,
            "num_medications": 10
        }
        res = await ac.post("/api/v1/predictions/predict", json=sample_request, headers=headers)
        assert res.status_code == 403, "Healthcare Researcher must be forbidden from clinical prediction API"

@pytest.mark.asyncio
async def test_system_administrator_forbidden_from_prediction():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        
        sample_request = {
            "time_in_hospital": 3,
            "num_lab_procedures": 40,
            "num_procedures": 1,
            "num_medications": 10
        }
        res = await ac.post("/api/v1/predictions/predict", json=sample_request, headers=headers)
        assert res.status_code == 403, "System Administrator must not access clinical prediction API"

# ----------------------------------------------------------------------
# 5-8: Dataset Seeding Endpoint RBAC Tests
# ----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_doctor_forbidden_from_seeding():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "doctor@hospital.org", "Doctor@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.post("/api/v1/system/seed-dataset?max_rows=100", headers=headers)
        assert res.status_code == 403, "Doctor must be forbidden from dataset seeding"

@pytest.mark.asyncio
async def test_hospital_administrator_forbidden_from_seeding():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "hospital_admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.post("/api/v1/system/seed-dataset?max_rows=100", headers=headers)
        assert res.status_code == 403, "Hospital Administrator must be forbidden from dataset seeding"

@pytest.mark.asyncio
async def test_healthcare_researcher_forbidden_from_seeding():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "researcher@hospital.org", "Research@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.post("/api/v1/system/seed-dataset?max_rows=100", headers=headers)
        assert res.status_code == 403, "Healthcare Researcher must be forbidden from dataset seeding"

@pytest.mark.asyncio
async def test_system_administrator_can_access_seeding():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.post("/api/v1/system/seed-dataset?max_rows=100", headers=headers)
        assert res.status_code == 200, f"System Administrator should trigger dataset seeding: {res.text}"

# ----------------------------------------------------------------------
# 9: Raw Patient API RBAC Test
# ----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_healthcare_researcher_forbidden_from_raw_patients():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "researcher@hospital.org", "Research@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/patients", headers=headers)
        assert res.status_code == 403, "Healthcare Researcher must not access raw patient-identifying records"

# ----------------------------------------------------------------------
# 10: User Management RBAC Test
# ----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_non_sysadmin_forbidden_from_user_management():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        for email, pwd in [
            ("doctor@hospital.org", "Doctor@123"),
            ("hospital_admin@hospital.org", "Admin@123"),
            ("researcher@hospital.org", "Research@123")
        ]:
            token = await get_token_for(ac, email, pwd)
            headers = {"Authorization": f"Bearer {token}"}
            res = await ac.get("/api/v1/users", headers=headers)
            assert res.status_code == 403, f"Role logged in as {email} must be rejected from user management"

# ----------------------------------------------------------------------
# 11-14: AI Model Management (/system/model-info) RBAC Tests
# ----------------------------------------------------------------------

@pytest.mark.asyncio
async def test_system_administrator_can_access_model_info():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/system/model-info", headers=headers)
        assert res.status_code == 200, f"System Administrator should access model info: {res.text}"
        data = res.json()
        assert data["model_name"] == "XGBoost Readmission Classifier"
        assert data["model_version"] == "v1.0.0-xgb"
        assert data["feature_count"] == 187
        assert "evaluation_metrics" in data
        assert "top_features" in data
        assert "deployment_status" in data

@pytest.mark.asyncio
async def test_non_sysadmin_roles_forbidden_from_model_info():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        for email, pwd in [
            ("doctor@hospital.org", "Doctor@123"),
            ("hospital_admin@hospital.org", "Admin@123"),
            ("researcher@hospital.org", "Research@123")
        ]:
            token = await get_token_for(ac, email, pwd)
            headers = {"Authorization": f"Bearer {token}"}
            res = await ac.get("/api/v1/system/model-info", headers=headers)
            assert res.status_code == 403, f"Role {email} must be rejected from /system/model-info"

