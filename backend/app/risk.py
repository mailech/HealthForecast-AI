from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sklearn.preprocessing import LabelEncoder
import joblib
import os

from app.security import get_current_user, require_role

router = APIRouter(prefix="/risk", tags=["risk"])

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "risk_model.pkl")
AGE_ENCODER_PATH = os.path.join(os.path.dirname(__file__), "..", "age_encoder.pkl")

model = joblib.load(MODEL_PATH)
age_encoder = joblib.load(AGE_ENCODER_PATH)


class RiskInput(BaseModel):
    time_in_hospital: int
    num_lab_procedures: int
    num_procedures: int
    num_medications: int
    number_outpatient: int
    number_emergency: int
    number_inpatient: int
    number_diagnoses: int
    age: str  # e.g. "[70-80)"
    admission_type_id: int
    change: str  # "Ch" or "No"
    diabetesMed: str  # "Yes" or "No"


@router.post("/predict")
def predict_risk(
    data: RiskInput,
    current_user=Depends(require_role("doctor", "hospital_administrator", "system_admin")),
):
    try:
        age_encoded = age_encoder.transform([data.age])[0]
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Unknown age bracket: {data.age}")

    change_encoded = 1 if data.change == "Ch" else 0
    diabetesMed_encoded = 1 if data.diabetesMed == "Yes" else 0

    features = [[
        data.time_in_hospital,
        data.num_lab_procedures,
        data.num_procedures,
        data.num_medications,
        data.number_outpatient,
        data.number_emergency,
        data.number_inpatient,
        data.number_diagnoses,
        age_encoded,
        data.admission_type_id,
        change_encoded,
        diabetesMed_encoded,
    ]]

    probability = model.predict_proba(features)[0][1]
    risk_category = "High" if probability >= 0.5 else ("Medium" if probability >= 0.2 else "Low")

    return {
        "readmission_probability": round(float(probability), 4),
        "risk_category": risk_category,
    }