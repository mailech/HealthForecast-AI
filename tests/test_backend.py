import pytest
from fastapi.testclient import TestClient
import os
import sys

# Add backend directory to sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "HealthForecast-AI", "backend"))
sys.path.insert(0, backend_dir)

from main import app, lifespan

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_app():
    # Ensure startup events run (table creation and default users)
    with TestClient(app) as test_client:
        yield test_client

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

def test_login_doctor_and_admin():
    # Doctor login
    doc_res = client.post("/auth/login", json={"username": "doctor@hospital.com", "password": "doctor123"})
    assert doc_res.status_code == 200
    doc_data = doc_res.json()
    assert "access_token" in doc_data
    assert doc_data["role"] == "Doctor"

    # Admin login
    admin_res = client.post("/auth/login", json={"username": "admin@hospital.com", "password": "admin123"})
    assert admin_res.status_code == 200
    admin_data = admin_res.json()
    assert admin_data["role"] == "Hospital Administrator"

def test_register_new_user():
    reg_res = client.post("/auth/register", json={
        "username": "newdoctor@hospital.com",
        "password": "password123",
        "role": "Doctor"
    })
    # If user already registered in previous test run, it returns 400, else 201
    assert reg_res.status_code in [201, 400]

def test_protected_routes_without_token():
    res = client.get("/auth/me")
    assert res.status_code == 401

    pred_res = client.post("/predict", json={})
    assert pred_res.status_code == 401

def test_predict_and_sqlite_persistence():
    # Login as doctor
    login_res = client.post("/auth/login", json={"username": "doctor@hospital.com", "password": "doctor123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    sample_patient_payload = {
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

    pred_res = client.post("/predict", json=sample_patient_payload, headers=headers)
    assert pred_res.status_code == 200
    pred_data = pred_res.json()
    
    assert "probability" in pred_data
    assert "risk_percentage" in pred_data
    assert "risk_class" in pred_data
    assert pred_data["patient_name"] == "Test Patient John Doe"
    assert "not a medical diagnosis" in pred_data["note"]

    # Test predictions history
    history_res = client.get("/predictions", headers=headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 1
    assert any(h["patient_name"] == "Test Patient John Doe" for h in history)

def test_admin_stats():
    login_res = client.post("/auth/login", json={"username": "admin@hospital.com", "password": "admin123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    stats_res = client.get("/admin/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "total_patients" in stats
    assert "total_predictions" in stats
    assert stats["model_roc_auc"] == 0.658
    assert stats["model_recall"] == 0.59
