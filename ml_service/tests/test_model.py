import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure ml_service root directory is in sys.path for app import
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, model, scaler, model_metadata, model_path, scaler_path, version_path
from preprocessing import parse_age, parse_max_glu_serum, parse_a1c_result, parse_diabetes_med

client = TestClient(app)

def test_model_artifact_loading():
    """Verify ML model artifacts and metadata files exist and load successfully."""
    assert os.path.exists(model_path), f"Model pickle not found at {model_path}"
    assert os.path.exists(scaler_path), f"Scaler pickle not found at {scaler_path}"
    assert os.path.exists(version_path), f"Version metadata json not found at {version_path}"
    assert model is not None, "Loaded model artifact should not be None"
    assert scaler is not None, "Loaded scaler artifact should not be None"
    assert isinstance(model_metadata, dict), "Loaded model_metadata should be a dictionary"
    assert "model_name" in model_metadata
    assert "version" in model_metadata
    assert "algorithm" in model_metadata
    assert model_metadata["feature_count"] == 10
    assert list(model.classes_) == [0, 1]

def test_health_check_endpoint():
    """Test /health status endpoint returns 200 OK and healthy operational status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "HealthForecast AI ML Engine"
    assert data["modelLoaded"] is True
    assert "version" in data

def test_model_info_endpoint():
    """Test /model-info endpoint returns 200 OK and valid model metadata."""
    response = client.get("/model-info")
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "data" in res
    assert res["data"]["algorithm"] == "RandomForestClassifier"
    assert len(res["data"]["features"]) == 10
    assert "feature_importances" in res["data"]

def test_categorical_and_age_mappings():
    """Test shared preprocessing transformation helpers."""
    assert parse_age("[60-70)") == 65
    assert parse_age("[20-30)") == 25
    assert parse_max_glu_serum("None") == 0
    assert parse_max_glu_serum(">200") == 2
    assert parse_max_glu_serum(">300") == 3
    assert parse_a1c_result("None") == 0
    assert parse_a1c_result(">8") == 3
    assert parse_diabetes_med("Yes") == 1
    assert parse_diabetes_med("No") == 0

def test_predict_endpoint_valid_input():
    """Test /predict endpoint with valid clinical patient input."""
    payload = {
        "patientName": "Rahul Verma",
        "age_range": "[60-70)",
        "time_in_hospital": 4,
        "num_lab_procedures": 45,
        "num_medications": 14,
        "number_inpatient": 2,
        "number_emergency": 1,
        "number_diagnoses": 8,
        "max_glu_serum": ">200",
        "A1Cresult": ">8",
        "diabetesMed": "Yes"
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    data = res["data"]
    assert data["patientName"] == "Rahul Verma"
    assert 0 <= data["score"] <= 100
    assert data["level"] in ["LOW", "MEDIUM", "HIGH"]
    assert 0.0 <= data["confidence"] <= 100.0
    
    # Binary probabilities assertion
    probs = data["probabilities"]
    assert isinstance(probs, dict)
    assert "high" in probs or "readmitted" in probs
    
    # Assert feature explanations use Random Forest Feature Importance terminology (not SHAP)
    assert len(data["feature_explanations"]) == 10
    for exp in data["feature_explanations"]:
        assert "Random Forest Feature Importance" in exp["risk_contribution"]
        assert "SHAP" not in exp["risk_contribution"]
        
    assert len(data["recommendations"]) > 0

def test_predict_endpoint_risk_threshold_bands():
    """Test /predict endpoint risk level decision bands (HIGH >= 40, MEDIUM >= 20, LOW < 20)."""
    # Low risk clinical profile
    low_payload = {
        "patientName": "Sneha Patel",
        "age_range": "[20-30)",
        "time_in_hospital": 1,
        "num_lab_procedures": 15,
        "num_medications": 4,
        "number_inpatient": 0,
        "number_emergency": 0,
        "number_diagnoses": 3,
        "max_glu_serum": "None",
        "A1Cresult": "None",
        "diabetesMed": "No"
    }
    low_res = client.post("/predict", json=low_payload)
    assert low_res.status_code == 200
    low_data = low_res.json()["data"]
    if low_data["score"] >= 40:
        assert low_data["level"] == "HIGH"
    elif low_data["score"] >= 20:
        assert low_data["level"] == "MEDIUM"
    else:
        assert low_data["level"] == "LOW"

    # High risk clinical profile
    high_payload = {
        "patientName": "Ramesh Kumar",
        "age_range": "[70-80)",
        "time_in_hospital": 10,
        "num_lab_procedures": 85,
        "num_medications": 28,
        "number_inpatient": 5,
        "number_emergency": 3,
        "number_diagnoses": 12,
        "max_glu_serum": ">300",
        "A1Cresult": ">8",
        "diabetesMed": "Yes"
    }
    high_res = client.post("/predict", json=high_payload)
    assert high_res.status_code == 200
    high_data = high_res.json()["data"]
    if high_data["score"] >= 40:
        assert high_data["level"] == "HIGH"
    elif high_data["score"] >= 20:
        assert high_data["level"] == "MEDIUM"

def test_predict_endpoint_input_validation():
    """Test /predict endpoint input boundary validation for missing inputs (422 Unprocessable Entity)."""
    res_missing_field = client.post("/predict", json={
        "patientName": "Incomplete Patient",
        "age_range": "[60-70)",
        "num_lab_procedures": 45
    })
    assert res_missing_field.status_code == 422
