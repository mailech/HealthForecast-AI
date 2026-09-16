import os
import sys
from fastapi.testclient import TestClient

# Adjust path to import from app
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.main import app

client = TestClient(app)

def get_token(username, password):
    resp = client.post(
        "/api/v1/auth/login",
        data={"username": username, "password": password}
    )
    assert resp.status_code == 200, f"Login failed for {username}: {resp.text}"
    return resp.json()["access_token"]

def test_full_ai_prediction_and_treatment_workflow():
    doctor_token = get_token("doctor@hospital.com", "Password123")
    doctor_headers = {"Authorization": f"Bearer {doctor_token}"}

    # STEP 1: Verify patient exists or fetch patients
    p_resp = client.get("/api/v1/patients?limit=10", headers=doctor_headers)
    assert p_resp.status_code == 200
    patients = p_resp.json()
    assert len(patients) > 0, "No patients found in DB"
    test_patient = patients[0]
    patient_id = test_patient["patient_id"]

    # STEP 2: Run AI Prediction as Doctor
    pred_payload = {
        "patient_id": patient_id,
        "blood_pressure_systolic": 135,
        "blood_pressure_diastolic": 85,
        "blood_glucose": 140.0,
        "hba1c": 7.2,
        "heart_rate": 78,
        "spo2": 98.0,
        "body_temperature": 37.0,
        "bmi": 26.5,
        "cholesterol": 190.0,
        "has_diabetes": True,
        "has_hypertension": True,
        "has_heart_disease": False,
        "other_conditions": "Mild hypertension",
        "symptoms_notes": "Patient reports mild fatigue"
    }

    pred_resp = client.post("/api/v1/prediction/simple-predict", json=pred_payload, headers=doctor_headers)
    assert pred_resp.status_code == 200, f"Prediction failed: {pred_resp.text}"
    pred_data = pred_resp.json()

    # Validate prediction result contents
    assert "patient_id" in pred_data
    assert pred_data["patient_id"] == patient_id
    assert "risk_level" in pred_data
    assert pred_data["risk_level"] in ["Low", "Medium", "High"]
    assert "readmission_risk_score" in pred_data
    assert "_id" in pred_data or "id" in pred_data

    prediction_id = str(pred_data.get("_id") or pred_data.get("id"))

    # STEP 3: Doctor adds prediction to treatment
    treatment_payload = {
        "patient_id": patient_id,
        "prediction_id": prediction_id,
        "doctor_id": "doctor@hospital.com",
        "treatment_plan": "Metformin 500mg daily, lifestyle modifications and blood pressure monitoring",
        "medications": [
            {"name": "Metformin", "dosage": "500mg", "frequency": "Once daily"}
        ],
        "status": "Active",
        "start_date": "2026-09-14T00:00:00Z",
        "end_date": "2026-12-14T00:00:00Z",
        "diagnosis": "Type 2 Diabetes Mellitus with Essential Hypertension",
        "notes": "Patient advised to monitor daily glucose levels",
        "monitoring_parameters": "Weekly HbA1c and daily BP"
    }

    treat_resp = client.post("/api/v1/treatments", json=treatment_payload, headers=doctor_headers)
    assert treat_resp.status_code == 201, f"Treatment creation failed: {treat_resp.text}"
    treat_data = treat_resp.json()

    assert treat_data["patient_id"] == patient_id
    assert treat_data["prediction_id"] == prediction_id

    # STEP 4: Query treatment by prediction_id
    treat_by_pred = client.get(f"/api/v1/treatments/prediction/{prediction_id}", headers=doctor_headers)
    assert treat_by_pred.status_code == 200
    linked_treatments = treat_by_pred.json()
    assert len(linked_treatments) >= 1
    assert linked_treatments[0]["prediction_id"] == prediction_id

    # STEP 5: Attempt to delete prediction while linked to treatment (should be blocked safely)
    del_resp = client.delete(f"/api/v1/prediction/{prediction_id}", headers=doctor_headers)
    assert del_resp.status_code == 400, "Should block deleting prediction linked to active treatment"
    assert "linked" in del_resp.json()["detail"].lower()

    # Clean up treatment first, then prediction
    treatment_id = str(treat_data.get("_id") or treat_data.get("id"))
    del_treat_resp = client.delete(f"/api/v1/treatments/{treatment_id}", headers=doctor_headers)
    assert del_treat_resp.status_code == 204

    # Now deletion of prediction succeeds
    del_pred_resp = client.delete(f"/api/v1/prediction/{prediction_id}", headers=doctor_headers)
    assert del_pred_resp.status_code == 204

def test_rbac_prediction_permissions():
    """Verify that non-Doctor roles cannot run predictions."""
    # Test Researcher
    researcher_token = get_token("researcher@hospital.com", "Password123")
    res_headers = {"Authorization": f"Bearer {researcher_token}"}

    pred_payload = {"patient_id": "PAT-001"}
    res_resp = client.post("/api/v1/prediction/simple-predict", json=pred_payload, headers=res_headers)
    assert res_resp.status_code == 403

    # Test SysAdmin
    sysadmin_token = get_token("sysadmin@hospital.com", "Password123")
    sys_headers = {"Authorization": f"Bearer {sysadmin_token}"}

    sys_resp = client.post("/api/v1/prediction/simple-predict", json=pred_payload, headers=sys_headers)
    assert sys_resp.status_code == 403
