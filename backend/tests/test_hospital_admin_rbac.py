import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import engine, Base, AsyncSessionLocal
from app.crud.crud_user import seed_initial_roles_and_admin

@pytest_asyncio.fixture(scope="module", autouse=True)
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
# 1. Hospital Administrator can access hospital performance analytics
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_hospital_admin_can_access_hospital_performance():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "hospital_admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/analytics/hospital-performance", headers=headers)
        assert res.status_code == 200, f"Hospital Admin should access performance: {res.text}"
        data = res.json()
        assert "eligible_encounters_count" in data
        assert "early_readmit_rate_pct" in data

# ----------------------------------------------------------------------
# 2. Hospital Administrator can access patient outcome analytics
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_hospital_admin_can_access_patient_outcomes():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "hospital_admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/analytics/patient-outcomes", headers=headers)
        assert res.status_code == 200, f"Hospital Admin should access patient outcomes: {res.text}"

# ----------------------------------------------------------------------
# 3. Hospital Administrator can access readmission statistics
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_hospital_admin_can_access_readmission_statistics():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "hospital_admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/analytics/utilization-trends", headers=headers)
        assert res.status_code == 200, f"Hospital Admin should access utilization trends: {res.text}"

# ----------------------------------------------------------------------
# 4. Hospital Administrator can access treatment effectiveness analytics
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_hospital_admin_can_access_treatment_effectiveness():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "hospital_admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/analytics/medication-outcomes", headers=headers)
        assert res.status_code == 200, f"Hospital Admin should access medication outcomes: {res.text}"

# ----------------------------------------------------------------------
# 5. Hospital Administrator can access population health analytics
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_hospital_admin_can_access_population_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "hospital_admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/analytics/admission-context-outcomes", headers=headers)
        assert res.status_code == 200, f"Hospital Admin should access admission context outcomes: {res.text}"

# ----------------------------------------------------------------------
# 6. Hospital Administrator can export hospital analytics
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_hospital_admin_can_export_hospital_analytics():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "hospital_admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.post(
            "/api/v1/researcher/analytical-report/export",
            json={"report_type": "hospital_performance"},
            headers=headers
        )
        assert res.status_code == 200, f"Hospital Admin should export analytical report CSV: {res.text}"

# ----------------------------------------------------------------------
# 7. Hospital Administrator cannot modify patient records
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_hospital_admin_cannot_modify_patient_records():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "hospital_admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.post("/api/v1/patients", json={"patient_nbr": 99999}, headers=headers)
        assert res.status_code in [403, 405, 404], "Hospital Admin must not create/modify patient records"

# ----------------------------------------------------------------------
# 8. Hospital Administrator cannot access user management
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_hospital_admin_forbidden_from_user_management():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "hospital_admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/users", headers=headers)
        assert res.status_code == 403, "Hospital Admin must be forbidden from user management"

# ----------------------------------------------------------------------
# 9. Hospital Administrator cannot access AI model management
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_hospital_admin_forbidden_from_model_management():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "hospital_admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/system/model-info", headers=headers)
        assert res.status_code == 403, "Hospital Admin must be forbidden from AI model management"

# ----------------------------------------------------------------------
# 10. Hospital Administrator cannot access Researcher-only dataset generation
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_hospital_admin_forbidden_from_researcher_dataset_gen():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "hospital_admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.post("/api/v1/researcher/research-dataset/generate", json={}, headers=headers)
        assert res.status_code == 403, "Hospital Admin must be forbidden from researcher dataset generation"

# ----------------------------------------------------------------------
# 11 & 12. Doctor and Researcher cannot access SysAdmin features
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_doctor_and_researcher_forbidden_from_sysadmin():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        for email, pwd in [("doctor@hospital.org", "Doctor@123"), ("researcher@hospital.org", "Research@123")]:
            token = await get_token_for(ac, email, pwd)
            headers = {"Authorization": f"Bearer {token}"}
            res = await ac.get("/api/v1/users", headers=headers)
            assert res.status_code == 403

# ----------------------------------------------------------------------
# 13. System Administrator retains access where permitted
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_sysadmin_retains_access():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        res_perf = await ac.get("/api/v1/analytics/hospital-performance", headers=headers)
        assert res_perf.status_code == 200
        res_users = await ac.get("/api/v1/users", headers=headers)
        assert res_users.status_code == 200
