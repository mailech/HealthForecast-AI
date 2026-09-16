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
# 1. Researcher can access anonymized researcher data
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_researcher_can_access_anonymized_patients():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "researcher@hospital.org", "Research@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/researcher/anonymized-patients", headers=headers)
        assert res.status_code == 200, f"Researcher should access anonymized patients: {res.text}"
        data = res.json()
        assert "total_eligible_encounters" in data
        assert "age_distribution" in data

# ----------------------------------------------------------------------
# 2. Researcher cannot access raw /patients endpoint
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_researcher_forbidden_from_raw_patients():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "researcher@hospital.org", "Research@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/patients", headers=headers)
        assert res.status_code == 403, "Researcher must be forbidden from raw /patients endpoint"

# ----------------------------------------------------------------------
# 3. Researcher cannot access raw /encounters endpoint
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_researcher_forbidden_from_raw_encounters():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "researcher@hospital.org", "Research@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/encounters", headers=headers)
        assert res.status_code == 403, "Researcher must be forbidden from raw /encounters endpoint"

# ----------------------------------------------------------------------
# 4. Researcher cannot access individual prediction endpoint
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_researcher_forbidden_from_predictions():
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
        assert res.status_code == 403, "Researcher must be forbidden from clinical predictions endpoint"

# ----------------------------------------------------------------------
# 5. Researcher cannot access user management
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_researcher_forbidden_from_user_management():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "researcher@hospital.org", "Research@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/users", headers=headers)
        assert res.status_code == 403, "Researcher must be forbidden from user management endpoint"

# ----------------------------------------------------------------------
# 6. Researcher cannot access model management
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_researcher_forbidden_from_model_management():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "researcher@hospital.org", "Research@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/system/model-info", headers=headers)
        assert res.status_code == 403, "Researcher must be forbidden from model management endpoint"

# ----------------------------------------------------------------------
# 7 & 8. Research dataset export contains no patient_nbr or encounter_id
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_research_dataset_export_scrubs_identifiers():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "researcher@hospital.org", "Research@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.post("/api/v1/researcher/research-dataset/export", json={}, headers=headers)
        assert res.status_code == 200, f"Export should succeed: {res.text}"
        csv_text = res.text
        first_line = csv_text.split("\n")[0]
        header_cols = [col.strip().lower() for col in first_line.split(",")]
        
        assert "patient_nbr" not in header_cols, "patient_nbr must not be present in CSV export header"
        assert "encounter_id" not in header_cols, "encounter_id must not be present in CSV export header"

# ----------------------------------------------------------------------
# 9. No direct identifiers are present in researcher responses
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_anonymized_patients_response_contains_no_pii():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "researcher@hospital.org", "Research@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.get("/api/v1/researcher/anonymized-patients", headers=headers)
        assert res.status_code == 200
        data = res.json()
        for record in data.get("anonymized_patients", []):
            keys = [k.lower() for k in record.keys()]
            assert "patient_nbr" not in keys
            assert "encounter_id" not in keys
            assert "name" not in keys
            assert "email" not in keys
            assert "phone" not in keys
            assert "address" not in keys

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
        assert res.status_code == 403, "Hospital Administrator must be forbidden from researcher dataset generation"

# ----------------------------------------------------------------------
# 11. Doctor cannot access Researcher-only dataset generation
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_doctor_forbidden_from_researcher_dataset_gen():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "doctor@hospital.org", "Doctor@123")
        headers = {"Authorization": f"Bearer {token}"}
        res = await ac.post("/api/v1/researcher/research-dataset/generate", json={}, headers=headers)
        assert res.status_code == 403, "Doctor must be forbidden from researcher dataset generation"

# ----------------------------------------------------------------------
# 12. System Administrator retains administrative access where permitted
# ----------------------------------------------------------------------
@pytest.mark.asyncio
async def test_sysadmin_retains_admin_access():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        token = await get_token_for(ac, "admin@hospital.org", "Admin@123")
        headers = {"Authorization": f"Bearer {token}"}
        
        # User management access
        res_users = await ac.get("/api/v1/users", headers=headers)
        assert res_users.status_code == 200, "SysAdmin must retain user management access"

        # Model management access
        res_model = await ac.get("/api/v1/system/model-info", headers=headers)
        assert res_model.status_code == 200, "SysAdmin must retain model management access"
