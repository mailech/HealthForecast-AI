from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/patients", tags=["Patients & Predictions"])

# Mock Patient Data with Readmission Risk
PATIENTS_DB = [
    {
        "patient_id": "P101",
        "name": "Robert",
        "age": 62,
        "gender": "Male",
        "primary_diagnosis": "Type 2 Diabetes",
        "readmission_risk_score": 0.85,
        "risk_level": "High",
        "recommended_action": "Schedule follow-up within 7 days & review medication"
    },
    {
        "patient_id": "P102",
        "name": "Davis",
        "age": 45,
        "gender": "Female",
        "primary_diagnosis": "Hypertension",
        "readmission_risk_score": 0.25,
        "risk_level": "Low",
        "recommended_action": "Standard post-discharge care plan"
    },
    {
        "patient_id": "P103",
        "name": "Michael",
        "age": 58,
        "gender": "Male",
        "primary_diagnosis": "Heart Failure",
        "readmission_risk_score": 0.68,
        "risk_level": "Medium",
        "recommended_action": "Telehealth check-in at Day 14"
    }
]

@router.get("/", response_model=List[dict])
def get_all_patients():
    return PATIENTS_DB

@router.get("/{patient_id}")
def get_patient_by_id(patient_id: str):
    for patient in PATIENTS_DB:
        if patient["patient_id"].lower() == patient_id.lower():
            return patient
    raise HTTPException(status_code=404, detail="Patient record not found")

class PatientDataInput(BaseModel):
    age: int
    num_lab_procedures: int
    num_medications: int
    time_in_hospital: int
    prior_inpatient_visits: int

@router.post("/predict")
def predict_readmission(data: PatientDataInput):
    # Basic Risk Score Calculation Logic (Mock Machine Learning Model)
    risk_score = min(
        0.95, 
        (data.age * 0.005) + 
        (data.time_in_hospital * 0.04) + 
        (data.prior_inpatient_visits * 0.15)
    )
    
    if risk_score > 0.65:
        risk_level = "High"
        recommendation = "High risk of 30-day readmission. Immediate follow-up & care plan modification required."
    elif risk_score > 0.35:
        risk_level = "Medium"
        recommendation = "Moderate risk. Telehealth monitoring within 10 days recommended."
    else:
        risk_level = "Low"
        recommendation = "Low readmission risk. Follow standard discharge guidelines."

    return {
        "readmission_risk_score": round(risk_score, 2),
        "risk_percentage": f"{round(risk_score * 100, 1)}%",
        "risk_level": risk_level,
        "recommendation": recommendation
    }