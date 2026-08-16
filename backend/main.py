import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr

from database.connection import (
    client,
    patients_collection,
    users_collection
)
from database.connection import (
    client,
    patients_collection,
    users_collection,
    reports_collection
)

# APP

app = FastAPI(
    title="HealthForecast AI API",
    description="Hospital Readmission Prediction & Patient Risk Intelligence System",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
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
# SCHEMAS
# =========================================================

class Patient(BaseModel):
    name: str
    age: int
    disease: str
    risk: str
    status: str


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
            "database": "connected"
        }

    except Exception as e:

        return {
            "status": "error",
            "database": "disconnected",
            "message": str(e)
        }


# =========================================================
# REGISTER
# =========================================================

@app.post("/api/register")
def register_user(user: RegisterUser):

    # Check whether email already exists
    existing_user = users_collection.find_one({
        "email": user.email
    })

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="An account with this email already exists."
        )


    # Hash password
    hashed_password = bcrypt.hashpw(
        user.password.encode("utf-8"),
        bcrypt.gensalt()
    )


    # User document
    user_data = {
        "name": user.name,
        "email": user.email,
        "password": hashed_password.decode("utf-8"),
        "role": user.role
    }


    # Save to MongoDB
    result = users_collection.insert_one(user_data)


    return {
        "message": "User registered successfully",
        "user_id": str(result.inserted_id)
    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/api/login")
def login_user(user: LoginUser):

    # Find user by email
    existing_user = users_collection.find_one({
        "email": user.email
    })


    # User doesn't exist
    if not existing_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    # Check password
    try:

        password_correct = bcrypt.checkpw(
            user.password.encode("utf-8"),
            existing_user["password"].encode("utf-8")
        )

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    if not password_correct:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )


    # Check selected role
    if existing_user["role"] != user.role:

        raise HTTPException(
            status_code=401,
            detail="Incorrect role selected."
        )


    # Create JWT token
    token = jwt.encode(
        {
            "user_id": str(existing_user["_id"]),
            "email": existing_user["email"],
            "role": existing_user["role"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=2)
        },
        JWT_SECRET,
        algorithm="HS256"
    )


    return {
        "message": "Login successful",

        "token": token,

        "user": {
            "id": str(existing_user["_id"]),
            "name": existing_user["name"],
            "email": existing_user["email"],
            "role": existing_user["role"]
        }
    }


# =========================================================
# CREATE PATIENT
# =========================================================

@app.post("/api/patients")
def create_patient(patient: Patient):

    patient_data = patient.model_dump()

    result = patients_collection.insert_one(
        patient_data
    )

    return {
        "message": "Patient created successfully",
        "patient_id": str(result.inserted_id)
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
def get_patient(patient_id: str):

    from bson import ObjectId

    try:

        patient = patients_collection.find_one(
            {
                "_id": ObjectId(patient_id)
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid patient ID."
        )


    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found."
        )


    patient["_id"] = str(
        patient["_id"]
    )

    return patient


# =========================================================
# DELETE PATIENT
# =========================================================

@app.delete("/api/patients/{patient_id}")
def delete_patient(patient_id: str):

    from bson import ObjectId

    try:

        result = patients_collection.delete_one(
            {
                "_id": ObjectId(patient_id)
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid patient ID."
        )


    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Patient not found."
        )


    return {
        "message": "Patient deleted successfully"
    }
# =========================================================
# REPORTS
# =========================================================

@app.post("/api/reports")
def create_report(report: Report):

    report_data = {
        "patient_id": report.patient_id,
        "patient_name": report.patient_name,
        "type": report.type,
        "status": report.status,
        "created_at": datetime.now(timezone.utc)
    }

    result = reports_collection.insert_one(report_data)

    return {
        "message": "Report created successfully",
        "report_id": str(result.inserted_id)
    }


@app.get("/api/reports")
def get_reports():

    reports = list(
        reports_collection.find()
    )

    for report in reports:
        report["_id"] = str(report["_id"])

        if report.get("created_at"):
            report["created_at"] = report["created_at"].isoformat()

    return reports


@app.delete("/api/reports/{report_id}")
def delete_report(report_id: str):

    from bson import ObjectId

    try:
        result = reports_collection.delete_one(
            {
                "_id": ObjectId(report_id)
            }
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid report ID."
        )

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Report not found."
        )

    return {
        "message": "Report deleted successfully"
    }