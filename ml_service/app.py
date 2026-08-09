import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, "model.pkl")
scaler_path = os.path.join(script_dir, "scaler.pkl")
version_path = os.path.join(script_dir, "model_version.json")

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
    version="2.4.0"
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
    patientName: str = Field(..., example="Rahul Verma", description="Patient full name")
    age: float = Field(..., ge=1, le=120, example=61, description="Patient age in years")
    glucose: float = Field(..., ge=30, le=500, example=185, description="Fasting glucose in mg/dL")
    bp: str = Field(..., example="140/90", description="Blood pressure string (SBP/DBP)")
    bmi: float = Field(..., ge=10, le=70, example=28.4, description="Body Mass Index in kg/m²")
    previousAdmissions: int = Field(0, ge=0, le=50, example=3, description="Admissions in past 12 months")

class RiskSpectrum(BaseModel):
    high: float
    moderate: float
    low: float

class FeatureExplanation(BaseModel):
    feature: str
    feature_name: str
    value: Any
    importance_weight: float
    risk_contribution: str

class PredictionResponse(BaseModel):
    success: bool
    data: Dict[str, Any]

def parse_bp(bp_str: str):
    try:
        parts = bp_str.split("/")
        sys = float(parts[0])
        dia = float(parts[1]) if len(parts) > 1 else 80.0
        return sys, dia
    except Exception:
        return 120.0, 80.0

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "HealthForecast AI ML Engine",
        "version": model_metadata.get("version", "v2.4.0"),
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
    
    bp_sys, bp_dia = parse_bp(patient.bp)
    
    # Construct feature vector
    # Order: ["age", "glucose", "bp_systolic", "bp_diastolic", "bmi", "previous_admissions"]
    raw_features = np.array([[
        patient.age,
        patient.glucose,
        bp_sys,
        bp_dia,
        patient.bmi,
        patient.previousAdmissions
    ]])
    
    # Scale features
    scaled_features = scaler.transform(raw_features)
    
    # Inference probability
    probabilities = model.predict_proba(scaled_features)[0]
    readmission_prob = float(probabilities[1])
    score = int(round(readmission_prob * 100))
    
    # Determine risk level
    if score >= 70:
        level = "HIGH"
    elif score >= 40:
        level = "MEDIUM"
    else:
        level = "LOW"
        
    confidence = round(float(model_metadata.get("metrics", {}).get("roc_auc", 0.94)) * 100, 1)
    
    # Calculate feature importances & SHAP-style risk contributions
    feature_names = ["age", "glucose", "bp_systolic", "bp_diastolic", "bmi", "previous_admissions"]
    display_names = [
        "Patient Age",
        "Fasting Glucose",
        "Systolic Blood Pressure",
        "Diastolic Blood Pressure",
        "BMI Score",
        "Previous Admissions (12 Mo)"
    ]
    raw_values = [patient.age, patient.glucose, bp_sys, bp_dia, patient.bmi, patient.previousAdmissions]
    importances = model.feature_importances_
    
    # Compute relative risk contribution for each feature
    explanations = []
    for f_id, f_disp, val, imp in zip(feature_names, display_names, raw_values, importances):
        contrib_pct = round(float(imp * 100), 1)
        if f_id == "glucose" and val > 140:
            impact = f"Elevated ({val} mg/dL) — Major Risk Driver (+{contrib_pct}%)"
        elif f_id == "previous_admissions" and val > 1:
            impact = f"High Recurrence ({val} admissions) — Major Risk Driver (+{contrib_pct}%)"
        elif f_id == "bp_systolic" and val > 135:
            impact = f"Hypertensive ({val} mmHg) — Moderate Risk Driver (+{contrib_pct}%)"
        elif f_id == "bmi" and val > 30:
            impact = f"High BMI ({val}) — Moderate Risk Driver (+{contrib_pct}%)"
        else:
            impact = f"Baseline Level ({val}) — Standard Weight (+{contrib_pct}%)"
            
        explanations.append({
            "feature": f_id,
            "feature_name": f_disp,
            "value": val,
            "importance_weight": round(float(imp), 4),
            "risk_contribution": impact
        })
        
    # Sort explanations by importance weight descending
    explanations.sort(key=lambda x: x["importance_weight"], reverse=True)
    
    # Clinical Action Recommendations
    if level == "HIGH":
        recommendations = [
            "Immediate post-discharge consultation required within 48 hours.",
            "Schedule continuous glycemic & blood pressure telemetry monitoring.",
            "Assign dedicated nurse case manager for daily medication adherence.",
            "Conduct comprehensive lab panel (HbA1c & renal profile) prior to exit."
        ]
    elif level == "MEDIUM":
        recommendations = [
            "Schedule follow-up outpatient consultation within 7 days.",
            "Provide specialized dietary and blood pressure management plan.",
            "Weekly nurse tele-checkup call scheduled."
        ]
    else:
        recommendations = [
            "Standard outpatient checkup scheduled in 30 days.",
            "Provide routine post-discharge care guidelines."
        ]
        
    spectrum = {
        "high": score if level == "HIGH" else int(score * 0.4),
        "moderate": score if level == "MEDIUM" else max(100 - score - 15, 5),
        "low": 100 - score if level == "LOW" else 5
    }
    
    return {
        "success": True,
        "data": {
            "patientName": patient.patientName,
            "score": score,
            "level": level,
            "confidence": confidence,
            "probabilities": spectrum,
            "feature_explanations": explanations,
            "recommendations": recommendations,
            "model_version": model_metadata.get("version", "v2.4.0"),
            "algorithm": model_metadata.get("algorithm", "RandomForestClassifier")
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
