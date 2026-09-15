import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from preprocessing import transform_single_patient, FEATURE_NAMES

script_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(script_dir, "models")
model_path = os.path.join(models_dir, "model.pkl")
scaler_path = os.path.join(models_dir, "scaler.pkl")
version_path = os.path.join(models_dir, "model_version.json")

# Load model, scaler, and metadata
try:
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    with open(version_path, "r") as f:
        model_metadata = json.load(f)
    print(f"Loaded ML model: {model_metadata['model_name']} ({model_metadata['version']})")
except Exception as e:
    print(f"Error loading model artifacts: {e}")
    model, scaler, model_metadata = None, None, {}

app = FastAPI(
    title="HealthForecast AI ML Microservice",
    description="Dedicated predictive intelligence engine for 30-day clinical readmission risk & feature importance explanations.",
    version="3.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PatientInput(BaseModel):
    patientName: str = Field(..., description="Patient full name")
    age_range: str = Field(..., description="Age bracket e.g. [60-70)")
    time_in_hospital: int = Field(..., ge=1, le=14, description="Length of hospital stay in days")
    num_lab_procedures: int = Field(..., ge=1, le=150, description="Lab procedures count")
    num_medications: int = Field(..., ge=1, le=100, description="Distinct medications count")
    number_inpatient: int = Field(..., ge=0, le=50, description="Inpatient stays in past 12 months")
    number_emergency: int = Field(..., ge=0, le=50, description="Emergency visits in past 12 months")
    number_diagnoses: int = Field(..., ge=1, le=20, description="Total diagnoses count")
    max_glu_serum: str = Field(..., description="Max serum glucose result (None, Norm, >200, >300)")
    A1Cresult: str = Field(..., description="HbA1c test result (None, Norm, >7, >8)")
    diabetesMed: str = Field(..., description="Prescribed diabetes medication (Yes/No)")

class PredictionResponse(BaseModel):
    success: bool
    data: Dict[str, Any]

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HealthForecast AI ML Engine",
        "version": model_metadata.get("version", "v3.0.0"),
        "modelLoaded": model is not None and scaler is not None
    }

@app.get("/model-info")
def get_model_info():
    if not model_metadata:
        raise HTTPException(status_code=500, detail="Model metadata unavailable")
    return {
        "success": True,
        "data": model_metadata
    }

@app.post("/predict")
def predict_readmission_risk(patient: PatientInput):
    if model is None or scaler is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Model engine is not loaded"
        )
    
    patient_dict = patient.model_dump() if hasattr(patient, "model_dump") else patient.dict()
    
    # Transform single patient dict using shared preprocessing module
    raw_vector = transform_single_patient(patient_dict)
    
    # Scale feature vector
    scaled_features = scaler.transform(raw_vector)
    
    # Verify binary model classes [0, 1]
    classes = list(model.classes_)
    pos_idx = classes.index(1) if 1 in classes else 1
    neg_idx = 1 - pos_idx
    
    # Inference probabilities
    probabilities = model.predict_proba(scaled_features)[0]
    readmission_prob = float(probabilities[pos_idx])
    no_readmission_prob = float(probabilities[neg_idx])
    
    readmission_pct = round(readmission_prob * 100, 1)
    no_readmission_pct = round(no_readmission_prob * 100, 1)
    
    # Score derived directly from positive-class readmission probability (0-100)
    score = int(round(readmission_prob * 100))
    
    # Project-defined risk decision bands based on baseline population prevalence (11.39%)
    # HIGH: >= 40% (nearly 4x baseline prevalence)
    # MEDIUM: >= 20% (nearly 2x baseline prevalence)
    # LOW: < 20%
    if score >= 40:
        level = "HIGH"
    elif score >= 20:
        level = "MEDIUM"
    else:
        level = "LOW"
        
    display_names = {
        "age_num": "Patient Age Bracket",
        "time_in_hospital": "Length of Hospital Stay",
        "num_lab_procedures": "Lab Procedures Count",
        "num_medications": "Distinct Medications Count",
        "number_inpatient": "Inpatient Stays (Past 12 Mo)",
        "number_emergency": "Emergency Visits (Past 12 Mo)",
        "number_diagnoses": "Total Diagnoses Count",
        "max_glu_serum": "Max Serum Glucose Result",
        "A1Cresult": "HbA1c Test Result",
        "diabetesMed": "Prescribed Diabetes Medication"
    }
    
    raw_values = [
        patient_dict.get("age_range", "[60-70)"),
        patient.time_in_hospital,
        patient.num_lab_procedures,
        patient.num_medications,
        patient.number_inpatient,
        patient.number_emergency,
        patient.number_diagnoses,
        patient.max_glu_serum,
        patient.A1Cresult,
        patient.diabetesMed
    ]
    
    importances = model.feature_importances_
    
    explanations = []
    for f_id, val, imp in zip(FEATURE_NAMES, raw_values, importances):
        contrib_pct = round(float(imp * 100), 1)
        disp_name = display_names.get(f_id, f_id)
        impact_text = f"{disp_name}: {val} — Random Forest Feature Importance ({contrib_pct}%)"
        explanations.append({
            "feature": f_id,
            "feature_name": disp_name,
            "value": val,
            "importance_weight": round(float(imp), 4),
            "risk_contribution": impact_text
        })
        
    explanations.sort(key=lambda x: x["importance_weight"], reverse=True)
    
    # Project Rule-Based Care Recommendations
    if level == "HIGH":
        recommendations = [
            "Immediate post-discharge telehealth consultation required within 48 hours.",
            "Assign dedicated nurse case manager for medication adherence and follow-up.",
            "Schedule follow-up outpatient consultation within 7 days.",
            "Review discharge medication reconciliation and lab panel prior to exit."
        ]
    elif level == "MEDIUM":
        recommendations = [
            "Schedule follow-up outpatient consultation within 7 days.",
            "Provide specialized diabetes self-management and diet guidance.",
            "Schedule 14-day nurse tele-checkup call."
        ]
    else:
        recommendations = [
            "Standard outpatient checkup scheduled in 30 days.",
            "Provide routine post-discharge care guidelines."
        ]
        
    binary_probabilities = {
        "readmitted": readmission_pct,
        "not_readmitted": no_readmission_pct
    }
    
    return {
        "success": True,
        "data": {
            "patientName": patient.patientName,
            "score": score,
            "level": level,
            "confidence": readmission_pct,
            "probabilities": binary_probabilities,
            "feature_explanations": explanations,
            "recommendations": recommendations,
            "model_version": model_metadata.get("version", "v3.0.0"),
            "algorithm": model_metadata.get("algorithm", "RandomForestClassifier")
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
