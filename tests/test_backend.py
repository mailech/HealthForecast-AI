import pytest
from fastapi.testclient import TestClient
import os
import sys

# Set isolated test database URL BEFORE importing database or main app
TEST_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "test_healthforecast.db")).replace("\\", "/")
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if not os.path.exists(backend_dir):
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "HealthForecast-AI", "backend"))
sys.path.insert(0, backend_dir)

from main import app, lifespan

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    yield
    # Remove temporary test database file after pytest session completes
    if os.path.exists(TEST_DB_PATH):
        try:
            os.remove(TEST_DB_PATH)
        except Exception:
            pass

@pytest.fixture(autouse=True)
def setup_app():
    # Ensure startup events run (table creation and default users)
    with TestClient(app) as test_client:
        yield test_client

# ==========================================================
# ROOT & HEALTH
# ==========================================================
def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "HealthForecast AI" in data["message"]
    assert data["model_performance"]["roc_auc"] == 0.658
    assert data["model_performance"]["positive_class_recall"] == 0.59

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["model_loaded"] is True
    assert data["model_roc_auc"] == 0.658
    assert data["model_recall"] == 0.59


# ==========================================================
# AUTHENTICATION: ALL 4 ROLES
# ==========================================================
def test_login_doctor():
    res = client.post("/auth/login", json={"username": "doctor@hospital.com", "password": "doctor123"})
    assert res.status_code == 200
    data = res.json()
    assert data["role"] == "Doctor"
    assert "access_token" in data

def test_login_admin():
    res = client.post("/auth/login", json={"username": "admin@hospital.com", "password": "admin123"})
    assert res.status_code == 200
    assert res.json()["role"] == "Hospital Administrator"

def test_login_researcher():
    res = client.post("/auth/login", json={"username": "researcher@hospital.com", "password": "researcher123"})
    assert res.status_code == 200
    assert res.json()["role"] == "Healthcare Researcher"

def test_login_sysadmin():
    res = client.post("/auth/login", json={"username": "sysadmin@hospital.com", "password": "sysadmin123"})
    assert res.status_code == 200
    assert res.json()["role"] == "System Administrator"

def test_login_shortname():
    """Test login using short username prefix (e.g., 'doctor' → 'doctor@hospital.com')."""
    res = client.post("/auth/login", json={"username": "doctor", "password": "doctor123"})
    assert res.status_code == 200
    assert res.json()["role"] == "Doctor"

def test_login_email_key():
    """Test login using the 'email' JSON key."""
    res = client.post("/auth/login", json={"email": "admin@hospital.com", "password": "admin123"})
    assert res.status_code == 200

def test_login_invalid():
    res = client.post("/auth/login", json={"username": "nonexistent", "password": "wrong"})
    assert res.status_code == 401


# ==========================================================
# REGISTRATION
# ==========================================================
def test_register_new_user():
    reg_res = client.post("/auth/register", json={
        "username": "testdoc_unique@hospital.com",
        "password": "password123",
        "full_name": "Test Doctor",
        "role": "Doctor"
    })
    assert reg_res.status_code in [201, 400]  # 400 if already exists from previous run

def test_register_researcher():
    reg_res = client.post("/auth/register", json={
        "username": "testresr_unique@research.edu",
        "password": "password123",
        "full_name": "Test Researcher",
        "role": "Healthcare Researcher"
    })
    assert reg_res.status_code in [201, 400]

def test_register_invalid_role():
    reg_res = client.post("/auth/register", json={
        "username": "invalid_role_user",
        "password": "password123",
        "role": "SuperAdmin"
    })
    assert reg_res.status_code == 400


# ==========================================================
# PROTECTED ROUTES WITHOUT TOKEN
# ==========================================================
def test_protected_routes_without_token():
    assert client.get("/auth/me").status_code == 401
    assert client.post("/predict", json={}).status_code == 401
    assert client.get("/predictions").status_code == 401
    assert client.get("/patients").status_code == 401
    assert client.get("/researcher/analytics").status_code == 401
    assert client.get("/sysadmin/users").status_code == 401
    assert client.get("/sysadmin/audit-logs").status_code == 401


# ==========================================================
# RBAC: ROLE-BASED ACCESS CONTROL
# ==========================================================
def _get_token(username, password):
    res = client.post("/auth/login", json={"username": username, "password": password})
    return res.json()["access_token"]

def _headers(token):
    return {"Authorization": f"Bearer {token}"}

def test_rbac_researcher_cannot_predict():
    token = _get_token("researcher@hospital.com", "researcher123")
    res = client.post("/predict", json={}, headers=_headers(token))
    assert res.status_code == 403

def test_rbac_researcher_cannot_access_patients():
    token = _get_token("researcher@hospital.com", "researcher123")
    res = client.get("/patients", headers=_headers(token))
    assert res.status_code == 403

def test_rbac_doctor_cannot_access_sysadmin():
    token = _get_token("doctor@hospital.com", "doctor123")
    res = client.get("/sysadmin/users", headers=_headers(token))
    assert res.status_code == 403

def test_rbac_doctor_cannot_access_researcher_analytics():
    token = _get_token("doctor@hospital.com", "doctor123")
    res = client.get("/researcher/analytics", headers=_headers(token))
    assert res.status_code == 403

def test_rbac_researcher_can_access_analytics():
    token = _get_token("researcher@hospital.com", "researcher123")
    res = client.get("/researcher/analytics", headers=_headers(token))
    assert res.status_code == 200

def test_rbac_sysadmin_can_access_users():
    token = _get_token("sysadmin@hospital.com", "sysadmin123")
    res = client.get("/sysadmin/users", headers=_headers(token))
    assert res.status_code == 200
    users = res.json()
    assert len(users) >= 4  # At least the 4 seed users

def test_rbac_sysadmin_can_access_audit_logs():
    token = _get_token("sysadmin@hospital.com", "sysadmin123")
    res = client.get("/sysadmin/audit-logs", headers=_headers(token))
    assert res.status_code == 200

def test_rbac_sysadmin_can_access_system_health():
    token = _get_token("sysadmin@hospital.com", "sysadmin123")
    res = client.get("/sysadmin/health", headers=_headers(token))
    assert res.status_code == 200
    data = res.json()
    assert "total_users" in data
    assert data["model_loaded"] is True

def test_rbac_admin_stats_permissions():
    """Verify /admin/stats is restricted to Hospital Administrator and System Administrator."""
    doc_token = _get_token("doctor@hospital.com", "doctor123")
    res_token = _get_token("researcher@hospital.com", "researcher123")
    admin_token = _get_token("admin@hospital.com", "admin123")
    sysadmin_token = _get_token("sysadmin@hospital.com", "sysadmin123")

    # Doctor and Researcher are denied (403)
    assert client.get("/admin/stats", headers=_headers(doc_token)).status_code == 403
    assert client.get("/admin/stats", headers=_headers(res_token)).status_code == 403

    # Hospital Admin and System Admin are allowed (200)
    assert client.get("/admin/stats", headers=_headers(admin_token)).status_code == 200
    assert client.get("/admin/stats", headers=_headers(sysadmin_token)).status_code == 200


# ==========================================================
# ML PREDICTION & DATABASE PERSISTENCE
# ==========================================================
SAMPLE_PATIENT_PAYLOAD = {
    "patient_name": "Test Patient John Doe",
    "race": "Caucasian",
    "gender": "Male",
    "age": "[60-70)",
    "admission_type_id": "1",
    "discharge_disposition_id": "1",
    "admission_source_id": "7",
    "time_in_hospital": 4,
    "payer_code": "MC",
    "medical_specialty": "InternalMedicine",
    "num_lab_procedures": 45,
    "num_procedures": 1,
    "num_medications": 15,
    "number_outpatient": 0,
    "number_emergency": 1,
    "number_inpatient": 1,
    "number_diagnoses": 7,
    "max_glu_serum": "None",
    "A1Cresult": "Norm",
    "metformin": "Steady",
    "repaglinide": "No",
    "nateglinide": "No",
    "chlorpropamide": "No",
    "glimepiride": "No",
    "acetohexamide": "No",
    "glipizide": "No",
    "glyburide": "No",
    "tolbutamide": "No",
    "pioglitazone": "No",
    "rosiglitazone": "No",
    "acarbose": "No",
    "miglitol": "No",
    "troglitazone": "No",
    "tolazamide": "No",
    "examide": "No",
    "citoglipton": "No",
    "insulin": "Steady",
    "glyburide_metformin": "No",
    "glipizide_metformin": "No",
    "glimepiride_pioglitazone": "No",
    "metformin_rosiglitazone": "No",
    "metformin_pioglitazone": "No",
    "change": "Ch",
    "diabetesMed": "Yes",
    "diag_1_group": "Circulatory",
    "diag_2_group": "Diabetes",
    "diag_3_group": "Respiratory"
}

def test_predict_and_persistence():
    token = _get_token("doctor@hospital.com", "doctor123")
    headers = _headers(token)

    pred_res = client.post("/predict", json=SAMPLE_PATIENT_PAYLOAD, headers=headers)
    assert pred_res.status_code == 200
    pred_data = pred_res.json()
    
    # Verify real ML prediction output
    assert "probability" in pred_data
    assert "risk_percentage" in pred_data
    assert "risk_class" in pred_data
    assert pred_data["risk_class"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert 0.0 <= pred_data["probability"] <= 1.0
    assert pred_data["patient_name"] == "Test Patient John Doe"
    assert "not a medical diagnosis" in pred_data["note"]
    
    # Verify clinical insights are returned
    assert "clinical_insights" in pred_data
    assert isinstance(pred_data["clinical_insights"], list)

    # Test predictions history
    history_res = client.get("/predictions", headers=headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 1
    assert any(h["patient_name"] == "Test Patient John Doe" for h in history)


# ==========================================================
# PATIENT ENDPOINTS
# ==========================================================
def test_patients_endpoints():
    token = _get_token("doctor@hospital.com", "doctor123")
    headers = _headers(token)

    new_patient_payload = {
        "patient_name": "Alice Smith",
        "race": "AfricanAmerican",
        "gender": "Female",
        "age": "[40-50)",
        "admission_type_id": "1",
        "discharge_disposition_id": "1",
        "admission_source_id": "1",
        "time_in_hospital": 2,
        "payer_code": "MC",
        "medical_specialty": "InternalMedicine",
        "num_lab_procedures": 25,
        "num_procedures": 0,
        "num_medications": 8,
        "number_outpatient": 0,
        "number_emergency": 0,
        "number_inpatient": 0,
        "number_diagnoses": 4,
        "max_glu_serum": "None",
        "A1Cresult": "None",
        "metformin": "No", "repaglinide": "No", "nateglinide": "No", "chlorpropamide": "No",
        "glimepiride": "No", "acetohexamide": "No", "glipizide": "No", "glyburide": "No",
        "tolbutamide": "No", "pioglitazone": "No", "rosiglitazone": "No", "acarbose": "No",
        "miglitol": "No", "troglitazone": "No", "tolazamide": "No", "examide": "No",
        "citoglipton": "No", "insulin": "No",
        "glyburide_metformin": "No", "glipizide_metformin": "No",
        "glimepiride_pioglitazone": "No", "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No",
        "change": "No", "diabetesMed": "No",
        "diag_1_group": "Circulatory", "diag_2_group": "Diabetes", "diag_3_group": "Other"
    }
    create_res = client.post("/patients", json=new_patient_payload, headers=headers)
    assert create_res.status_code == 201
    patient_id = create_res.json()["id"]

    list_res = client.get("/patients", headers=headers)
    assert list_res.status_code == 200
    assert any(p["id"] == patient_id for p in list_res.json())

    get_res = client.get(f"/patients/{patient_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["patient_name"] == "Alice Smith"


# ==========================================================
# ADMIN STATS
# ==========================================================
def test_admin_stats():
    token = _get_token("admin@hospital.com", "admin123")
    headers = _headers(token)

    stats_res = client.get("/admin/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_patients" in stats
    assert "total_predictions" in stats
    assert stats["model_roc_auc"] == 0.658
    assert stats["model_recall"] == 0.59


# ==========================================================
# RESEARCHER ANALYTICS
# ==========================================================
def test_researcher_analytics():
    token = _get_token("researcher@hospital.com", "researcher123")
    headers = _headers(token)

    res = client.get("/researcher/analytics", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_predictions" in data
    assert "risk_distribution" in data
    assert "age_group_distribution" in data
    assert "gender_distribution" in data
    assert "readmission_rate" in data
    assert data["model_roc_auc"] == 0.658


# ==========================================================
# SYSADMIN: USER MANAGEMENT
# ==========================================================
def test_sysadmin_user_management():
    token = _get_token("sysadmin@hospital.com", "sysadmin123")
    headers = _headers(token)

    # List users
    users_res = client.get("/sysadmin/users", headers=headers)
    assert users_res.status_code == 200
    users = users_res.json()
    assert len(users) >= 4

    # Find a non-sysadmin user to modify
    target = next(u for u in users if u["role"] == "Doctor")
    
    # Deactivate user
    patch_res = client.patch(f"/sysadmin/users/{target['id']}", json={"is_active": False}, headers=headers)
    assert patch_res.status_code == 200
    assert patch_res.json()["is_active"] is False

    # Re-activate
    patch_res2 = client.patch(f"/sysadmin/users/{target['id']}", json={"is_active": True}, headers=headers)
    assert patch_res2.status_code == 200
    assert patch_res2.json()["is_active"] is True


# ==========================================================
# NOTIFICATIONS
# ==========================================================
def test_notifications():
    token = _get_token("doctor@hospital.com", "doctor123")
    headers = _headers(token)

    res = client.get("/notifications", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

    count_res = client.get("/notifications/unread-count", headers=headers)
    assert count_res.status_code == 200
    assert "unread_count" in count_res.json()


# ==========================================================
# AUTH/ME ENDPOINT
# ==========================================================
def test_auth_me():
    token = _get_token("doctor@hospital.com", "doctor123")
    res = client.get("/auth/me", headers=_headers(token))
    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "doctor@hospital.com"
    assert data["role"] == "Doctor"
