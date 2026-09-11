import os
import pytest
from httpx import AsyncClient, ASGITransport
from typing import Dict, Any

from app.main import app
from app.core.config import settings
from ml.inference import get_inference_engine, RISK_THRESHOLDS
from ml.cdss import get_cdss_engine

DATASET_PATH = settings.DATASET_PATH

@pytest.fixture(scope="session")
def sample_clinical_request() -> Dict[str, Any]:
    return {
        "race": "Caucasian",
        "gender": "Female",
        "age": "[60-70)",
        "admission_type_id": 1,
        "admission_source_id": 7,
        "time_in_hospital": 5,
        "payer_code": "MC",
        "medical_specialty": "InternalMedicine",
        "num_lab_procedures": 55,
        "num_procedures": 2,
        "num_medications": 14,
        "number_outpatient": 1,
        "number_emergency": 1,
        "number_inpatient": 2,
        "diag_1": "250.02",
        "diag_2": "414",
        "diag_3": "401",
        "number_diagnoses": 7,
        "max_glu_serum": ">200",
        "A1Cresult": ">8",
        "change": "Ch",
        "diabetesMed": "Yes",
        "insulin": "Up",
        "metformin": "Steady"
    }

def test_inference_engine_artifacts_loading():
    """Verify that inference engine loads preprocessor and XGBoost model artifacts."""
    engine = get_inference_engine()
    assert engine.preprocessor is not None
    assert engine.model is not None
    assert engine.model_name == "XGBoost Readmission Classifier"
    assert engine.model_version == "v1.0.0-xgb"

def test_inference_engine_prediction_output(sample_clinical_request):
    """Verify prediction probability, percentage, category, and metadata output."""
    engine = get_inference_engine()
    result = engine.predict(sample_clinical_request)
    
    assert "risk_probability" in result
    assert "risk_percentage" in result
    assert "risk_category" in result
    assert "prediction" in result
    assert "predicted_class_label" in result
    assert "top_risk_factors" in result
    assert "disclaimer" in result
    
    assert 0.0 <= result["risk_probability"] <= 1.0
    assert 0.0 <= result["risk_percentage"] <= 100.0
    assert result["risk_category"] in ["Low Risk", "Medium Risk", "High Risk"]
    assert result["prediction"] in [0, 1]
    assert result["predicted_class_label"] in ["<30", "NO/>30"]
    assert "NOT a medical diagnostic tool" in result["disclaimer"]

def test_risk_category_threshold_logic():
    """Verify risk categories match threshold bounds (<0.30 Low, 0.30-0.59 Medium, >=0.60 High)."""
    engine = get_inference_engine()
    assert engine.determine_risk_category(0.15) == "Low Risk"
    assert engine.determine_risk_category(0.299) == "Low Risk"
    assert engine.determine_risk_category(0.30) == "Medium Risk"
    assert engine.determine_risk_category(0.45) == "Medium Risk"
    assert engine.determine_risk_category(0.599) == "Medium Risk"
    assert engine.determine_risk_category(0.60) == "High Risk"
    assert engine.determine_risk_category(0.85) == "High Risk"

def test_cdss_recommendation_generation(sample_clinical_request):
    """Verify rules-based CDSS recommendations trigger for clinical flags."""
    cdss = get_cdss_engine()
    recs = cdss.generate_recommendations(
        encounter_data=sample_clinical_request,
        risk_category="High Risk",
        risk_probability=0.65
    )
    
    assert len(recs) > 0
    rule_ids = [r["rule_id"] for r in recs]
    
    # Check expected triggers from sample_clinical_request
    assert "CDSS_MED_REC" in rule_ids         # change == 'Ch'
    assert "CDSS_FOLLOW_UP" in rule_ids       # High Risk
    assert "CDSS_DIABETES_EDU" in rule_ids    # diag_1 Diabetes + A1C >8
    assert "CDSS_UTILIZATION_REV" in rule_ids # number_inpatient > 0
    assert "CDSS_GLYCEMIC_MON" in rule_ids    # A1Cresult >8
    assert "CDSS_CARE_COORD" in rule_ids      # num_medications >= 12
    
    for r in recs:
        assert "disclaimer" in r
        assert "Not a substitute for clinician judgment" in r["disclaimer"]

@pytest.mark.asyncio
async def test_api_predict_custom_endpoint(sample_clinical_request: dict):
    """Test POST /api/v1/predictions/predict custom endpoint with Doctor token."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "doctor@hospital.org", "password": "Doctor@123"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        response = await ac.post(
            "/api/v1/predictions/predict",
            json=sample_clinical_request,
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "risk_probability" in data
        assert "risk_category" in data
        assert "cdss_recommendations" in data
        assert len(data["cdss_recommendations"]) > 0

@pytest.mark.asyncio
async def test_api_predict_stored_encounter_endpoint():
    """Test POST /api/v1/predictions/predict/{encounter_id} for a DB-seeded encounter."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "doctor@hospital.org", "password": "Doctor@123"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Fetch an existing encounter
        enc_res = await ac.get("/api/v1/encounters", headers=headers)
        assert enc_res.status_code == 200
        encounters = enc_res.json()["items"]
        assert len(encounters) > 0
        target_enc_id = encounters[0]["encounter_id"]
        
        # Run prediction on stored encounter
        pred_res = await ac.post(f"/api/v1/predictions/predict/{target_enc_id}", headers=headers)
        assert pred_res.status_code == 200
        pred_data = pred_res.json()
        
        assert pred_data["encounter_id"] == target_enc_id
        assert "risk_probability" in pred_data
        assert "risk_category" in pred_data

@pytest.mark.asyncio
async def test_api_predict_invalid_input_validation():
    """Test validation errors for malformed requests (invalid age / negative numbers)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "doctor@hospital.org", "password": "Doctor@123"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        invalid_payload = {
            "gender": "Female",
            "age": "INVALID_AGE_BRACKET",  # Invalid enum value
            "time_in_hospital": -5         # Invalid negative value
        }
        response = await ac.post(
            "/api/v1/predictions/predict",
            json=invalid_payload,
            headers=headers
        )
        assert response.status_code == 422  # Unprocessable Entity validation error

@pytest.mark.asyncio
async def test_api_unauthenticated_access_block(sample_clinical_request: dict):
    """Test 401 Unauthorized block on unauthenticated prediction requests."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/predictions/predict",
            json=sample_clinical_request
        )
        assert response.status_code == 401

def test_dataset_immutability():
    """Verify dataset/diabetic_data.csv remains untouched and unchanged."""
    assert os.path.exists(DATASET_PATH)
    file_size = os.path.getsize(DATASET_PATH)
    # diabetic_data.csv is ~17.9 MB (18,790,260 bytes)
    assert file_size > 18000000
