import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
import joblib
import pandas as pd

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from database.connection import (
    client,
    patients_collection,
    users_collection,
    reports_collection,
)


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="HealthForecast AI API",
    description="Hospital Readmission Prediction & Patient Risk Intelligence System",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# JWT SECRET
# =========================================================

JWT_SECRET = os.getenv("JWT_SECRET")

if not JWT_SECRET:
    raise RuntimeError(
        "JWT_SECRET is missing. Add JWT_SECRET to your .env file."
    )


# =========================================================
# ML MODEL
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "ml",
    "model.pkl"
)

if not os.path.exists(MODEL_PATH):
    raise RuntimeError(
        f"ML model not found at: {MODEL_PATH}"
    )

try:

    model_package = joblib.load(
        MODEL_PATH
    )

    readmission_model = model_package["model"]

    READMISSION_THRESHOLD = model_package[
        "threshold"
    ]

    MODEL_FEATURES = model_package[
        "features"
    ]

except Exception as e:

    raise RuntimeError(
        f"Failed to load ML model: {str(e)}"
    )


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

    age: int
    gender: str
    blood_pressure: str
    cholesterol: float
    bmi: float
    diabetes: str
    hypertension: str
    medication_count: int
    length_of_stay: int
    discharge_destination: str


class RiskPredictionInput(BaseModel):

    age: int
    gender: str
    blood_pressure: str
    cholesterol: float
    bmi: float
    diabetes: str
    hypertension: str
    medication_count: int
    length_of_stay: int
    discharge_destination: str


class RegisterUser(BaseModel):

    name: str
    email: EmailStr
    password: str
    role: str


class LoginUser(BaseModel):

    email: EmailStr
    password: str
    role: str


class Report(BaseModel):

    patient_id: str
    patient_name: str
    type: str
    status: str


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "HealthForecast AI Backend is running!"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/api/health")
def health_check():

    try:

        client.admin.command("ping")

        return {
            "status": "healthy",
            "database": "connected",
            "ml_model": "loaded",
        }

    except Exception as e:

        return {
            "status": "error",
            "database": "disconnected",
            "ml_model": "loaded",
            "message": str(e),
        }


# =========================================================
# HELPER - CREATE PATIENT DATAFRAME
# =========================================================

def create_prediction_dataframe(data):

    patient_data = pd.DataFrame(
        [
            {
                "age": data.age,
                "gender": data.gender,
                "blood_pressure": data.blood_pressure,
                "cholesterol": data.cholesterol,
                "bmi": data.bmi,
                "diabetes": data.diabetes,
                "hypertension": data.hypertension,
                "medication_count": data.medication_count,
                "length_of_stay": data.length_of_stay,
                "discharge_destination": (
                    data.discharge_destination
                ),
            }
        ]
    )

    patient_data = patient_data[
        MODEL_FEATURES
    ]

    return patient_data


# =========================================================
# HELPER - GET ML PREDICTION
# =========================================================

def get_ml_prediction(data):

    patient_data = create_prediction_dataframe(
        data
    )

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

    return (
        probability,
        prediction,
        risk
    )


# =========================================================
# READMISSION PREDICTION
# =========================================================

@app.post("/api/predict-readmission")
def predict_readmission(
    data: ReadmissionInput
):

    try:

        probability, prediction, risk = (
            get_ml_prediction(data)
        )

        return {

            "prediction": (
                "Readmitted"
                if prediction == 1
                else "Not Readmitted"
            ),

            "readmission_probability": round(
                probability * 100,
                2
            ),

            "risk_level": risk,

            "model_threshold": round(
                READMISSION_THRESHOLD,
                2
            ),

            "message": (
                "Patient has a higher predicted "
                "risk of readmission."
                if prediction == 1
                else
                "Patient has a lower predicted "
                "risk of readmission."
            ),
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}",
        )


# =========================================================
# PATIENT RISK PREDICTION
# =========================================================

@app.post("/api/predict-risk")
def predict_risk(
    data: RiskPredictionInput
):

    try:

        probability, prediction, risk = (
            get_ml_prediction(data)
        )

        return {

            "risk_score": round(
                probability * 100,
                2
            ),

            "risk_level": risk,

            "readmission_probability": round(
                probability * 100,
                2
            ),

            "prediction": (
                "Higher Risk"
                if prediction == 1
                else "Lower Risk"
            ),

            "message": (
                "Patient has a higher predicted "
                "risk of hospital readmission."
                if prediction == 1
                else
                "Patient has a lower predicted "
                "risk of hospital readmission."
            ),

        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Risk prediction failed: {str(e)}",
        )


# =========================================================
# REGISTER
# =========================================================

@app.post("/api/register")
def register_user(
    user: RegisterUser
):

    existing_user = users_collection.find_one(
        {
            "email": user.email
        }
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail=(
                "An account with this email "
                "already exists."
            ),
        )

    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt(),
    )

    user_data = {

        "name": user.name,

        "email": user.email,

        "password": (
            hashed_password.decode("utf-8")
        ),

        "role": user.role,
    }

    result = users_collection.insert_one(
        user_data
    )

    return {

        "message": (
            "User registered successfully"
        ),

        "user_id": str(
            result.inserted_id
        ),
    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/api/login")
def login_user(
    user: LoginUser
):

    existing_user = users_collection.find_one(
        {
            "email": user.email
        }
    )

    if not existing_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    try:

        password_correct = bcrypt.checkpw(

            user.password.encode("utf-8"),

            existing_user[
                "password"
            ].encode("utf-8"),

        )

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not password_correct:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if existing_user["role"] != user.role:

        raise HTTPException(
            status_code=401,
            detail="Incorrect role selected.",
        )

    token = jwt.encode(

        {

            "user_id": str(
                existing_user["_id"]
            ),

            "email": existing_user["email"],

            "role": existing_user["role"],

            "exp": (
                datetime.now(timezone.utc)
                + timedelta(hours=2)
            ),
        },

        JWT_SECRET,

        algorithm="HS256",
    )

    return {

        "message": "Login successful",

        "token": token,

        "user": {

            "id": str(
                existing_user["_id"]
            ),

            "name": existing_user["name"],

            "email": existing_user["email"],

            "role": existing_user["role"],
        },
    }


# =========================================================
# CREATE PATIENT
# =========================================================

@app.post("/api/patients")
def create_patient(
    patient: Patient
):

    patient_data = patient.model_dump()

    result = patients_collection.insert_one(
        patient_data
    )

    return {

        "message": (
            "Patient created successfully"
        ),

        "patient_id": str(
            result.inserted_id
        ),
    }


# =========================================================
# GET ALL PATIENTS
# =========================================================

@app.get("/api/patients")
def get_patients():

    patients = list(
        patients_collection.find()
    )

    for patient in patients:

        patient["_id"] = str(
            patient["_id"]
        )

    return patients


# =========================================================
# GET SINGLE PATIENT
# =========================================================

@app.get("/api/patients/{patient_id}")
def get_patient(
    patient_id: str
):

    from bson import ObjectId

    try:

        patient = patients_collection.find_one(
            {
                "_id": ObjectId(
                    patient_id
                )
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid patient ID.",
        )

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    patient["_id"] = str(
        patient["_id"]
    )

    return patient


# =========================================================
# DELETE PATIENT
# =========================================================

@app.delete("/api/patients/{patient_id}")
def delete_patient(
    patient_id: str
):

    from bson import ObjectId

    try:

        result = patients_collection.delete_one(
            {
                "_id": ObjectId(
                    patient_id
                )
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid patient ID.",
        )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    return {
        "message": "Patient deleted successfully"
    }


# =========================================================
# CREATE REPORT
# =========================================================

@app.post("/api/reports")
def create_report(
    report: Report
):

    report_data = {

        "patient_id": report.patient_id,

        "patient_name": report.patient_name,

        "type": report.type,

        "status": report.status,

        "created_at": (
            datetime.now(timezone.utc)
        ),
    }

    result = reports_collection.insert_one(
        report_data
    )

    return {

        "message": (
            "Report created successfully"
        ),

        "report_id": str(
            result.inserted_id
        ),
    }


# =========================================================
# GET ALL REPORTS
# =========================================================

@app.get("/api/reports")
def get_reports():

    reports = list(
        reports_collection.find()
    )

    for report in reports:

        report["_id"] = str(
            report["_id"]
        )

        if report.get("created_at"):

            report["created_at"] = (
                report[
                    "created_at"
                ].isoformat()
            )

    return reports


# =========================================================
# DELETE REPORT
# =========================================================

@app.delete("/api/reports/{report_id}")
def delete_report(
    report_id: str
):

    from bson import ObjectId

    try:

        result = reports_collection.delete_one(
            {
                "_id": ObjectId(
                    report_id
                )
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid report ID.",
        )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Report not found.",
        )

    return {
        "message": "Report deleted successfully"
    }