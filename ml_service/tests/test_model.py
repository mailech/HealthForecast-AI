import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure ml_service root directory is in sys.path for app import
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app, model, scaler, model_metadata, model_path, scaler_path, version_path

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
    assert "features" in res["data"]
    assert "feature_importances" in res["data"]

def test_predict_endpoint_valid_input():
    """Test /predict endpoint with valid clinical patient input."""
    payload = {
        "patientName": "Rahul Verma",
        "age": 61.0,
        "glucose": 185.0,
        "bp": "140/90",
        "bmi": 28.4,
        "previousAdmissions": 3
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
    assert isinstance(data["probabilities"], dict)
    assert "high" in data["probabilities"]
    assert "moderate" in data["probabilities"]
    assert "low" in data["probabilities"]
    assert len(data["feature_explanations"]) == 6
    assert len(data["recommendations"]) > 0

def test_predict_endpoint_edge_cases():
    """Test /predict endpoint with low risk and high risk clinical profiles."""
    # Low risk clinical profile
    low_payload = {
        "patientName": "Sneha Patel",
        "age": 25.0,
        "glucose": 85.0,
        "bp": "115/75",
        "bmi": 21.5,
        "previousAdmissions": 0
    }
    low_res = client.post("/predict", json=low_payload)
    assert low_res.status_code == 200
    low_data = low_res.json()["data"]
    assert 0 <= low_data["score"] <= 100
    assert low_data["level"] in ["LOW", "MEDIUM", "HIGH"]

    # High risk clinical profile
    high_payload = {
        "patientName": "Ramesh Kumar",
        "age": 78.0,
        "glucose": 280.0,
        "bp": "170/105",
        "bmi": 34.2,
        "previousAdmissions": 6
    }
    high_res = client.post("/predict", json=high_payload)
    assert high_res.status_code == 200
    high_data = high_res.json()["data"]
    assert 0 <= high_data["score"] <= 100
    assert high_data["level"] in ["LOW", "MEDIUM", "HIGH"]

def test_predict_endpoint_input_validation():
    """Test /predict endpoint input boundary validation for invalid inputs (422 Unprocessable Entity)."""
    # Negative age
    res_neg_age = client.post("/predict", json={
        "patientName": "Invalid Patient",
        "age": -10,
        "glucose": 120,
        "bp": "120/80",
        "bmi": 24.5,
        "previousAdmissions": 1
    })
    assert res_neg_age.status_code == 422

    # Out of bounds age (> 120)
    res_high_age = client.post("/predict", json={
        "patientName": "Invalid Patient",
        "age": 150,
        "glucose": 120,
        "bp": "120/80",
        "bmi": 24.5,
        "previousAdmissions": 1
    })
    assert res_high_age.status_code == 422

    # Missing required parameter (glucose)
    res_missing_field = client.post("/predict", json={
        "patientName": "Incomplete Patient",
        "age": 45,
        "bp": "120/80",
        "bmi": 24.5,
        "previousAdmissions": 1
    })
    assert res_missing_field.status_code == 422
