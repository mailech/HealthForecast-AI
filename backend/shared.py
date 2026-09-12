import os
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from bson import ObjectId
from pydantic import BaseModel, EmailStr

from database.connection import (
    patients_collection,
    users_collection,
    reports_collection,
    audit_logs_collection,
    datasets_collection,
    system_settings_collection,
)

# =========================================================
# ENVIRONMENT
# =========================================================

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is missing. Add JWT_SECRET to your .env file.")

JWT_ALGORITHM = "HS256"

SYSTEM_ADMIN_EMAIL = os.getenv("SYSTEM_ADMIN_EMAIL")
SYSTEM_ADMIN_PASSWORD = os.getenv("SYSTEM_ADMIN_PASSWORD")
if not SYSTEM_ADMIN_EMAIL or not SYSTEM_ADMIN_PASSWORD:
    raise RuntimeError(
        "SYSTEM_ADMIN_EMAIL and SYSTEM_ADMIN_PASSWORD must be defined in your .env file."
    )

# =========================================================
# ML MODEL
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "model.pkl")

if not os.path.exists(MODEL_PATH):
    raise RuntimeError(f"ML model not found at: {MODEL_PATH}")

try:
    model_package = joblib.load(MODEL_PATH)
    readmission_model = model_package["model"]
    READMISSION_THRESHOLD = model_package["threshold"]
    MODEL_FEATURES = model_package["features"]
except Exception as e:
    raise RuntimeError(f"Failed to load ML model: {str(e)}")

# =========================================================
# SCHEMAS
# =========================================================

class Patient(BaseModel):
    name: str
    age: int
    disease: str
    risk: str
    status: str


class ReadmissionInput(BaseModel):
    """
    Hospital/readmission workflow.
    """

    number_inpatient: int
    number_emergency: int
    number_outpatient: int
    time_in_hospital: int
    num_procedures: int
    num_lab_procedures: int
    num_medications: int
    number_diagnoses: int
    diabetesmed: str
    insulin: str
    change: str
    max_glu_serum: str
    a1cresult: str


class RiskPredictionInput(BaseModel):
    """
    Patient risk workflow.
    """

    age: str
    gender: str
    number_diagnoses: int
    diabetesmed: str
    insulin: str
    max_glu_serum: str
    a1cresult: str
    change: str


class RegisterUser(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class LoginUser(BaseModel):
    email: EmailStr
    password: str


class Report(BaseModel):
    patient_id: str
    patient_name: str
    type: str
    status: str


class AssignPatient(BaseModel):
    doctor_id: str


class CreateAdminUser(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str


class UpdateRole(BaseModel):
    role: str


class DatasetInfo(BaseModel):
    name: str
    description: str
    source: str


class SystemSetting(BaseModel):
    key: str
    value: str


class TreatmentPlanInput(BaseModel):
    patient_id: str
    diagnosis: str
    medicines: str
    doctor_recommendations: str
    follow_up_date: str


# =========================================================
# SHARED HELPERS
# =========================================================

def create_audit_log(
    user,
    action,
    resource=None,
    details=None,
):
    audit_logs_collection.insert_one(
        {
            "user_id": user.get("id"),
            "user_name": user.get("name"),
            "user_email": user.get("email"),
            "role": user.get("role"),
            "action": action,
            "resource": resource,
            "details": details,
            "created_at": datetime.now(timezone.utc),
        }
    )


def is_system_admin_email(email):
    return email.lower() == SYSTEM_ADMIN_EMAIL.lower()


def serialize_patient(patient):
    """
    Convert MongoDB patient document into the exact format
    expected by the React frontend.
    """

    if "_id" in patient:
        patient["id"] = str(patient["_id"])
        del patient["_id"]

    if patient.get("created_at"):
        patient["created_at"] = patient["created_at"].isoformat()

    return patient


def serialize_report(report):

    if "_id" in report:
        report["id"] = str(report["_id"])
        del report["_id"]

    if report.get("created_at"):
        report["created_at"] = report["created_at"].isoformat()

    return report


def create_prediction_dataframe(data):
    """
    Convert either Risk Prediction or Readmission input into
    the complete feature structure expected by the trained
    Random Forest pipeline.

    Fields not collected by a workflow are passed as NaN.
    The preprocessing pipeline in model.pkl handles these
    missing values using its training-time imputers.
    """

    raw_data = data.model_dump()

    patient_data = {}

    for feature in MODEL_FEATURES:
        patient_data[feature] = raw_data.get(
            feature,
            np.nan,
        )

    patient_data = pd.DataFrame([patient_data])

    # Preserve the exact feature order used during training.
    patient_data = patient_data[MODEL_FEATURES]

    return patient_data


def get_ml_prediction(data):
    """
    Run the saved Random Forest model.

    The model predicts the project's binary 30-day
    readmission target. Its probability is also used
    as the patient risk score.
    """

    patient_data = create_prediction_dataframe(data)

    probability = float(
        readmission_model.predict_proba(
            patient_data
        )[0][1]
    )

    prediction = int(
        probability >= READMISSION_THRESHOLD
    )

    if probability >= 0.70:
        risk = "HIGH"
    elif probability >= 0.40:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return probability, prediction, risk


