# import os
# from datetime import datetime, timedelta, timezone

# import bcrypt
# import jwt
# import joblib
# import pandas as pd
# import numpy as np

# from bson import ObjectId
# from fastapi import FastAPI, HTTPException, Depends
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel, EmailStr

# from database.connection import (
#     client,
#     patients_collection,
#     users_collection,
#     reports_collection,
#     audit_logs_collection,
#     datasets_collection,
#     system_settings_collection,
# )

# from auth import get_current_user, require_roles


# # =========================================================
# # APP
# # =========================================================

# app = FastAPI(
#     title="HealthForecast AI API",
#     description="Hospital Readmission Prediction & Patient Risk Intelligence System",
#     version="1.0.0",
# )


# # =========================================================
# # CORS
# # =========================================================

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:5173",
#         "http://127.0.0.1:5173",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # =========================================================
# # ENVIRONMENT
# # =========================================================

# JWT_SECRET = os.getenv("JWT_SECRET")

# if not JWT_SECRET:
#     raise RuntimeError(
#         "JWT_SECRET is missing. Add JWT_SECRET to your .env file."
#     )

# JWT_ALGORITHM = "HS256"

# SYSTEM_ADMIN_EMAIL = os.getenv("SYSTEM_ADMIN_EMAIL")
# SYSTEM_ADMIN_PASSWORD = os.getenv("SYSTEM_ADMIN_PASSWORD")

# if not SYSTEM_ADMIN_EMAIL or not SYSTEM_ADMIN_PASSWORD:
#     raise RuntimeError(
#         "SYSTEM_ADMIN_EMAIL and SYSTEM_ADMIN_PASSWORD "
#         "must be defined in your .env file."
#     )


# # =========================================================
# # ML MODEL
# # =========================================================

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# MODEL_PATH = os.path.join(
#     BASE_DIR,
#     "ml",
#     "model.pkl",
# )

# if not os.path.exists(MODEL_PATH):
#     raise RuntimeError(
#         f"ML model not found at: {MODEL_PATH}"
#     )

# try:
#     model_package = joblib.load(MODEL_PATH)

#     readmission_model = model_package["model"]
#     READMISSION_THRESHOLD = model_package["threshold"]
#     MODEL_FEATURES = model_package["features"]

# except Exception as e:
#     raise RuntimeError(
#         f"Failed to load ML model: {str(e)}"
#     )


# # =========================================================
# # SCHEMAS
# # =========================================================


# class Patient(BaseModel):
#     name: str
#     age: int
#     disease: str
#     risk: str
#     status: str


# # =========================================================
# # ML INPUT SCHEMA
# # =========================================================
# #
# # These fields correspond to the 19 features used when
# # training the current Random Forest model.
# #
# # Dataset:
# # Diabetes 130-US Hospitals for Years 1999-2008
# #
# # Target:
# # 30-day readmission (<30)
# # =========================================================


# class ReadmissionInput(BaseModel):
#     """
#     Hospital/readmission workflow.

#     These are the hospital utilization, hospitalization history,
#     diagnosis, laboratory and diabetes-treatment fields collected
#     by the Readmission page.
#     """

#     number_inpatient: int
#     number_emergency: int
#     number_outpatient: int
#     time_in_hospital: int
#     num_procedures: int
#     num_lab_procedures: int
#     num_medications: int
#     number_diagnoses: int
#     diabetesmed: str
#     insulin: str
#     change: str
#     max_glu_serum: str
#     a1cresult: str


# class RiskPredictionInput(BaseModel):
#     """
#     Patient risk workflow.

#     This page focuses on the patient's current demographic,
#     diagnosis and diabetes-treatment/laboratory information.
#     """

#     age: str
#     gender: str
#     number_diagnoses: int
#     diabetesmed: str
#     insulin: str
#     max_glu_serum: str
#     a1cresult: str
#     change: str


# class RegisterUser(BaseModel):
#     name: str
#     email: EmailStr
#     password: str
#     role: str


# class LoginUser(BaseModel):
#     email: EmailStr
#     password: str


# class Report(BaseModel):
#     patient_id: str
#     patient_name: str
#     type: str
#     status: str


# class AssignPatient(BaseModel):
#     doctor_id: str


# class CreateAdminUser(BaseModel):
#     name: str
#     email: EmailStr
#     password: str
#     role: str


# class UpdateRole(BaseModel):
#     role: str


# class DatasetInfo(BaseModel):
#     name: str
#     description: str
#     source: str


# class SystemSetting(BaseModel):
#     key: str
#     value: str


# # =========================================================
# # HELPERS
# # =========================================================


# def create_audit_log(
#     user,
#     action,
#     resource=None,
#     details=None,
# ):
#     audit_logs_collection.insert_one(
#         {
#             "user_id": user.get("id"),
#             "user_name": user.get("name"),
#             "user_email": user.get("email"),
#             "role": user.get("role"),
#             "action": action,
#             "resource": resource,
#             "details": details,
#             "created_at": datetime.now(timezone.utc),
#         }
#     )


# def is_system_admin_email(email):
#     return email.lower() == SYSTEM_ADMIN_EMAIL.lower()


# def serialize_patient(patient):
#     """
#     Convert MongoDB patient document into the exact format
#     expected by the React frontend.
#     """

#     if "_id" in patient:
#         patient["id"] = str(patient["_id"])
#         del patient["_id"]

#     if patient.get("created_at"):
#         patient["created_at"] = patient["created_at"].isoformat()

#     return patient


# def serialize_report(report):

#     if "_id" in report:
#         report["id"] = str(report["_id"])
#         del report["_id"]

#     if report.get("created_at"):
#         report["created_at"] = report["created_at"].isoformat()

#     return report


# # =========================================================
# # HOME
# # =========================================================


# @app.get("/")
# def home():
#     return {
#         "message": "HealthForecast AI Backend is running!"
#     }


# # =========================================================
# # HEALTH CHECK
# # =========================================================


# @app.get("/api/health")
# def health_check():

#     try:

#         client.admin.command("ping")

#         return {
#             "status": "healthy",
#             "database": "connected",
#             "ml_model": "loaded",
#         }

#     except Exception as e:

#         return {
#             "status": "error",
#             "database": "disconnected",
#             "ml_model": "loaded",
#             "message": str(e),
#         }


# # =========================================================
# # CURRENT USER
# # =========================================================


# @app.get("/api/me")
# def get_me(
#     current_user: dict = Depends(get_current_user),
# ):
#     return current_user


# # =========================================================
# # ML DATAFRAME
# # =========================================================


# def create_prediction_dataframe(data):
#     """
#     Convert either the Risk Prediction or Readmission input into
#     the complete feature structure expected by the trained model.

#     The trained pipeline contains the same imputers used during
#     training, so fields not collected by a particular workflow
#     are passed as NaN instead of inventing fake patient values.
#     """

#     raw_data = data.model_dump()

#     patient_data = {}

#     for feature in MODEL_FEATURES:
#         patient_data[feature] = raw_data.get(feature, np.nan)

#     patient_data = pd.DataFrame([patient_data])

#     # Always preserve the exact feature order used during training.
#     patient_data = patient_data[MODEL_FEATURES]

#     return patient_data


# # =========================================================
# # ML PREDICTION
# # =========================================================


# def get_ml_prediction(data):
#     """
#     Run the saved Random Forest pipeline.

#     The model predicts the project's binary 30-day readmission
#     target. The probability is also used by the UI as the patient
#     risk score.
#     """

#     patient_data = create_prediction_dataframe(data)

#     probability = float(
#         readmission_model.predict_proba(patient_data)[0][1]
#     )

#     prediction = int(
#         probability >= READMISSION_THRESHOLD
#     )

#     # Project risk categories.
#     if probability >= 0.70:
#         risk = "HIGH"
#     elif probability >= 0.40:
#         risk = "MEDIUM"
#     else:
#         risk = "LOW"

#     return probability, prediction, risk


# # =========================================================
# # READMISSION PREDICTION
# # DOCTOR + SYSTEM ADMIN
# # =========================================================


# @app.post("/api/predict-readmission")
# def predict_readmission(
#     data: ReadmissionInput,
#     current_user: dict = Depends(
#         require_roles(
#             "Doctor",
#             "System Administrator",
#         )
#     ),
# ):

#     try:

#         probability, prediction, risk = get_ml_prediction(
#             data
#         )

#         create_audit_log(
#             current_user,
#             "READMISSION_PREDICTION",
#             details={
#                 "risk_level": risk,
#                 "probability": probability,
#             },
#         )

#         return {
#             "prediction": (
#                 "Readmitted"
#                 if prediction == 1
#                 else "Not Readmitted"
#             ),

#             "readmission_probability": round(
#                 probability * 100,
#                 2,
#             ),

#             "risk_level": risk,

#             "model_threshold": round(
#                 READMISSION_THRESHOLD,
#                 2,
#             ),

#             "message": (
#                 "Patient has a higher predicted risk of readmission within 30 days."
#                 if prediction == 1
#                 else
#                 "Patient has a lower predicted risk of readmission within 30 days."
#             ),
#         }

#     except Exception as e:

#         raise HTTPException(
#             status_code=500,
#             detail=f"Prediction failed: {str(e)}",
#         )


# # =========================================================
# # PATIENT RISK PREDICTION
# # DOCTOR + SYSTEM ADMIN
# # =========================================================


# @app.post("/api/predict-risk")
# def predict_risk(
#     data: RiskPredictionInput,
#     current_user: dict = Depends(
#         require_roles(
#             "Doctor",
#             "System Administrator",
#         )
#     ),
# ):

#     try:

#         probability, prediction, risk = get_ml_prediction(
#             data
#         )

#         create_audit_log(
#             current_user,
#             "RISK_PREDICTION",
#             details={
#                 "risk_level": risk,
#                 "probability": probability,
#             },
#         )

#         return {
#             "risk_score": round(
#                 probability * 100,
#                 2,
#             ),

#             "risk_level": risk,

#             "readmission_probability": round(
#                 probability * 100,
#                 2,
#             ),

#             "prediction": (
#                 "Higher Risk"
#                 if prediction == 1
#                 else "Lower Risk"
#             ),

#             "message": (
#                 "Patient has a higher predicted risk of hospital readmission within 30 days."
#                 if prediction == 1
#                 else
#                 "Patient has a lower predicted risk of hospital readmission within 30 days."
#             ),
#         }

#     except Exception as e:

#         raise HTTPException(
#             status_code=500,
#             detail=f"Risk prediction failed: {str(e)}",
#         )


# # =========================================================
# # REGISTER
# # =========================================================


# @app.post("/api/register")
# def register_user(
#     user: RegisterUser,
# ):

#     allowed_registration_roles = {
#         "Doctor",
#         "Hospital Administrator",
#         "Healthcare Researcher",
#     }

#     if user.role not in allowed_registration_roles:

#         raise HTTPException(
#             status_code=403,
#             detail=(
#                 "System Administrator accounts cannot be "
#                 "created through public registration."
#             ),
#         )

#     if is_system_admin_email(str(user.email)):

#         raise HTTPException(
#             status_code=403,
#             detail=(
#                 "This email is reserved for the "
#                 "System Administrator."
#             ),
#         )

#     existing_user = users_collection.find_one(
#         {
#             "email": str(user.email).lower()
#         }
#     )

#     if existing_user:

#         raise HTTPException(
#             status_code=400,
#             detail="An account with this email already exists.",
#         )

#     hashed_password = bcrypt.hashpw(
#         user.password.encode("utf-8"),
#         bcrypt.gensalt(),
#     )

#     user_data = {
#         "name": user.name,
#         "email": str(user.email).lower(),
#         "password": hashed_password.decode("utf-8"),
#         "role": user.role,
#         "created_at": datetime.now(timezone.utc),
#     }

#     result = users_collection.insert_one(
#         user_data
#     )

#     return {
#         "message": "User registered successfully",
#         "user_id": str(result.inserted_id),
#     }


# # =========================================================
# # LOGIN
# # =========================================================


# @app.post("/api/login")
# def login_user(
#     user: LoginUser,
# ):

#     email = str(user.email).lower()

#     # -----------------------------------------------------
#     # SYSTEM ADMIN
#     # -----------------------------------------------------

#     if email == SYSTEM_ADMIN_EMAIL.lower():

#         if user.password != SYSTEM_ADMIN_PASSWORD:

#             raise HTTPException(
#                 status_code=401,
#                 detail="Invalid email or password.",
#             )

#         token = jwt.encode(
#             {
#                 "user_id": "system-admin",
#                 "email": SYSTEM_ADMIN_EMAIL,
#                 "role": "System Administrator",
#                 "exp": (
#                     datetime.now(timezone.utc)
#                     + timedelta(hours=2)
#                 ),
#             },
#             JWT_SECRET,
#             algorithm=JWT_ALGORITHM,
#         )

#         return {
#             "message": "Login successful",
#             "token": token,
#             "user": {
#                 "id": "system-admin",
#                 "name": "System Administrator",
#                 "email": SYSTEM_ADMIN_EMAIL,
#                 "role": "System Administrator",
#             },
#         }

#     # -----------------------------------------------------
#     # NORMAL USER
#     # -----------------------------------------------------

#     existing_user = users_collection.find_one(
#         {
#             "email": email
#         }
#     )

#     if not existing_user:

#         raise HTTPException(
#             status_code=401,
#             detail="Invalid email or password.",
#         )

#     try:

#         password_correct = bcrypt.checkpw(
#             user.password.encode("utf-8"),
#             existing_user["password"].encode("utf-8"),
#         )

#     except Exception:

#         raise HTTPException(
#             status_code=401,
#             detail="Invalid email or password.",
#         )

#     if not password_correct:

#         raise HTTPException(
#             status_code=401,
#             detail="Invalid email or password.",
#         )

#     token = jwt.encode(
#         {
#             "user_id": str(existing_user["_id"]),
#             "email": existing_user["email"],
#             "role": existing_user["role"],
#             "exp": (
#                 datetime.now(timezone.utc)
#                 + timedelta(hours=2)
#             ),
#         },
#         JWT_SECRET,
#         algorithm=JWT_ALGORITHM,
#     )

#     return {
#         "message": "Login successful",
#         "token": token,
#         "user": {
#             "id": str(existing_user["_id"]),
#             "name": existing_user["name"],
#             "email": existing_user["email"],
#             "role": existing_user["role"],
#         },
#     }


# # =========================================================
# # CREATE PATIENT
# # DOCTOR + SYSTEM ADMIN
# # =========================================================


# @app.post("/api/patients")
# def create_patient(
#     patient: Patient,
#     current_user: dict = Depends(
#         require_roles(
#             "Doctor",
#             "System Administrator",
#         )
#     ),
# ):

#     patient_data = patient.model_dump()

#     if current_user["role"] == "Doctor":

#         patient_data["doctor_id"] = current_user["id"]

#     else:

#         patient_data["doctor_id"] = None

#     patient_data["created_at"] = datetime.now(
#         timezone.utc
#     )

#     result = patients_collection.insert_one(
#         patient_data
#     )

#     patient_id = str(result.inserted_id)

#     create_audit_log(
#         current_user,
#         "CREATE_PATIENT",
#         resource=patient_id,
#     )

#     return {
#         "message": "Patient created successfully",
#         "patient_id": patient_id,
#         "id": patient_id,
#     }


# # =========================================================
# # GET PATIENTS
# # =========================================================


# @app.get("/api/patients")
# def get_patients(
#     current_user: dict = Depends(get_current_user),
# ):

#     role = current_user["role"]

#     if role == "Doctor":

#         patients = list(
#             patients_collection.find(
#                 {
#                     "doctor_id": current_user["id"]
#                 }
#             )
#         )

#     elif role == "Hospital Administrator":

#         patients = list(
#             patients_collection.find()
#         )

#     elif role == "System Administrator":

#         patients = list(
#             patients_collection.find()
#         )

#     else:

#         raise HTTPException(
#             status_code=403,
#             detail=(
#                 "Researchers must use the anonymized "
#                 "research endpoints."
#             ),
#         )

#     return [
#         serialize_patient(patient)
#         for patient in patients
#     ]


# # =========================================================
# # GET SINGLE PATIENT
# # =========================================================


# @app.get("/api/patients/{patient_id}")
# def get_patient(
#     patient_id: str,
#     current_user: dict = Depends(get_current_user),
# ):

#     try:

#         object_id = ObjectId(patient_id)

#     except Exception:

#         raise HTTPException(
#             status_code=400,
#             detail="Invalid patient ID.",
#         )

#     patient = patients_collection.find_one(
#         {
#             "_id": object_id
#         }
#     )

#     if not patient:

#         raise HTTPException(
#             status_code=404,
#             detail="Patient not found.",
#         )

#     role = current_user["role"]

#     if role == "Doctor":

#         if patient.get("doctor_id") != current_user["id"]:

#             raise HTTPException(
#                 status_code=403,
#                 detail=(
#                     "You can only access your assigned patients."
#                 ),
#             )

#     elif role == "Healthcare Researcher":

#         raise HTTPException(
#             status_code=403,
#             detail=(
#                 "Researchers cannot access individual patient records."
#             ),
#         )

#     elif role not in {
#         "Hospital Administrator",
#         "System Administrator",
#     }:

#         raise HTTPException(
#             status_code=403,
#             detail="Access denied.",
#         )

#     return serialize_patient(patient)


# # =========================================================
# # DELETE PATIENT
# # SYSTEM ADMIN ONLY
# # =========================================================


# @app.delete("/api/patients/{patient_id}")
# def delete_patient(
#     patient_id: str,
#     current_user: dict = Depends(
#         require_roles(
#             "System Administrator"
#         )
#     ),
# ):

#     try:

#         object_id = ObjectId(patient_id)

#     except Exception:

#         raise HTTPException(
#             status_code=400,
#             detail="Invalid patient ID.",
#         )

#     result = patients_collection.delete_one(
#         {
#             "_id": object_id
#         }
#     )

#     if result.deleted_count == 0:

#         raise HTTPException(
#             status_code=404,
#             detail="Patient not found.",
#         )

#     create_audit_log(
#         current_user,
#         "DELETE_PATIENT",
#         resource=patient_id,
#     )

#     return {
#         "message": "Patient deleted successfully"
#     }


# # =========================================================
# # CREATE REPORT
# # DOCTOR + SYSTEM ADMIN
# # =========================================================


# @app.post("/api/reports")
# def create_report(
#     report: Report,
#     current_user: dict = Depends(
#         require_roles(
#             "Doctor",
#             "System Administrator",
#         )
#     ),
# ):

#     try:

#         patient = patients_collection.find_one(
#             {
#                 "_id": ObjectId(report.patient_id)
#             }
#         )

#     except Exception:

#         raise HTTPException(
#             status_code=400,
#             detail="Invalid patient ID.",
#         )

#     if not patient:

#         raise HTTPException(
#             status_code=404,
#             detail="Patient not found.",
#         )

#     if current_user["role"] == "Doctor":

#         if patient.get("doctor_id") != current_user["id"]:

#             raise HTTPException(
#                 status_code=403,
#                 detail=(
#                     "You can only create reports "
#                     "for assigned patients."
#                 ),
#             )

#     report_data = {
#         "patient_id": report.patient_id,
#         "patient_name": report.patient_name,
#         "type": report.type,
#         "status": report.status,
#         "created_at": datetime.now(timezone.utc),
#         "created_by": current_user["id"],
#     }

#     result = reports_collection.insert_one(
#         report_data
#     )

#     create_audit_log(
#         current_user,
#         "CREATE_REPORT",
#         resource=str(result.inserted_id),
#     )

#     return {
#         "message": "Report created successfully",
#         "report_id": str(result.inserted_id),
#     }


# # =========================================================
# # GET REPORTS
# # =========================================================


# @app.get("/api/reports")
# def get_reports(
#     current_user: dict = Depends(get_current_user),
# ):

#     role = current_user["role"]

#     if role == "Doctor":

#         assigned_patients = list(
#             patients_collection.find(
#                 {
#                     "doctor_id": current_user["id"]
#                 },
#                 {
#                     "_id": 1
#                 },
#             )
#         )

#         patient_ids = [
#             str(patient["_id"])
#             for patient in assigned_patients
#         ]

#         reports = list(
#             reports_collection.find(
#                 {
#                     "patient_id": {
#                         "$in": patient_ids
#                     }
#                 }
#             )
#         )

#     elif role in {
#         "Hospital Administrator",
#         "System Administrator",
#     }:

#         reports = list(
#             reports_collection.find()
#         )

#     elif role == "Healthcare Researcher":

#         reports = list(
#             reports_collection.find(
#                 {},
#                 {
#                     "patient_name": 0
#                 },
#             )
#         )

#     else:

#         raise HTTPException(
#             status_code=403,
#             detail="Access denied.",
#         )

#     return [
#         serialize_report(report)
#         for report in reports
#     ]


# # =========================================================
# # DELETE REPORT
# # DOCTOR + SYSTEM ADMIN
# # =========================================================


# @app.delete("/api/reports/{report_id}")
# def delete_report(
#     report_id: str,
#     current_user: dict = Depends(
#         require_roles(
#             "Doctor",
#             "System Administrator",
#         )
#     ),
# ):

#     try:

#         report = reports_collection.find_one(
#             {
#                 "_id": ObjectId(report_id)
#             }
#         )

#     except Exception:

#         raise HTTPException(
#             status_code=400,
#             detail="Invalid report ID.",
#         )

#     if not report:

#         raise HTTPException(
#             status_code=404,
#             detail="Report not found.",
#         )

#     if current_user["role"] == "Doctor":

#         try:

#             patient = patients_collection.find_one(
#                 {
#                     "_id": ObjectId(
#                         report["patient_id"]
#                     )
#                 }
#             )

#         except Exception:

#             raise HTTPException(
#                 status_code=400,
#                 detail="Invalid patient ID in report.",
#             )

#         if not patient:

#             raise HTTPException(
#                 status_code=404,
#                 detail="Patient not found.",
#             )

#         if patient.get("doctor_id") != current_user["id"]:

#             raise HTTPException(
#                 status_code=403,
#                 detail=(
#                     "You can only delete reports "
#                     "for assigned patients."
#                 ),
#             )

#     result = reports_collection.delete_one(
#         {
#             "_id": ObjectId(report_id)
#         }
#     )

#     if result.deleted_count == 0:

#         raise HTTPException(
#             status_code=404,
#             detail="Report not found.",
#         )

#     create_audit_log(
#         current_user,
#         "DELETE_REPORT",
#         resource=report_id,
#     )

#     return {
#         "message": "Report deleted successfully"
#     }


# # =========================================================
# # HOSPITAL ANALYTICS
# # =========================================================


# @app.get("/api/analytics/hospital")
# def hospital_analytics(
#     current_user: dict = Depends(
#         require_roles(
#             "Doctor",
#             "Hospital Administrator",
#             "System Administrator",
#         )
#     ),
# ):

#     role = current_user["role"]

#     if role == "Doctor":

#         patients = list(
#             patients_collection.find(
#                 {
#                     "doctor_id": current_user["id"]
#                 }
#             )
#         )

#     else:

#         patients = list(
#             patients_collection.find()
#         )

#     total_patients = len(patients)

#     high_risk = sum(
#         1
#         for patient in patients
#         if str(
#             patient.get("risk", "")
#         ).upper() == "HIGH"
#     )

#     medium_risk = sum(
#         1
#         for patient in patients
#         if str(
#             patient.get("risk", "")
#         ).upper() == "MEDIUM"
#     )

#     low_risk = sum(
#         1
#         for patient in patients
#         if str(
#             patient.get("risk", "")
#         ).upper() == "LOW"
#     )

#     status_counts = {}

#     for patient in patients:

#         status = patient.get(
#             "status",
#             "Unknown",
#         )

#         status_counts[status] = (
#             status_counts.get(status, 0) + 1
#         )

#     return {
#         "total_patients": total_patients,
#         "high_risk": high_risk,
#         "medium_risk": medium_risk,
#         "low_risk": low_risk,
#         "status_distribution": status_counts,
#     }


# # =========================================================
# # RESEARCH ANALYTICS
# # =========================================================


# @app.get("/api/research/analytics")
# def research_analytics(
#     current_user: dict = Depends(
#         require_roles(
#             "Healthcare Researcher",
#             "System Administrator",
#             "Hospital Administrator",
#         )
#     ),
# ):

#     patients = list(
#         patients_collection.find()
#     )

#     total_patients = len(patients)

#     age_groups = {
#         "0-18": 0,
#         "19-40": 0,
#         "41-60": 0,
#         "61+": 0,
#     }

#     risk_distribution = {
#         "LOW": 0,
#         "MEDIUM": 0,
#         "HIGH": 0,
#     }

#     for patient in patients:

#         age = patient.get("age")

#         if age is not None:

#             if age <= 18:
#                 age_groups["0-18"] += 1

#             elif age <= 40:
#                 age_groups["19-40"] += 1

#             elif age <= 60:
#                 age_groups["41-60"] += 1

#             else:
#                 age_groups["61+"] += 1

#         risk = str(
#             patient.get("risk", "")
#         ).upper()

#         if risk in risk_distribution:
#             risk_distribution[risk] += 1

#     return {
#         "total_records": total_patients,
#         "age_distribution": age_groups,
#         "risk_distribution": risk_distribution,
#     }


# # =========================================================
# # RESEARCH DATASET
# # =========================================================


# @app.get("/api/research/dataset")
# def research_dataset(
#     current_user: dict = Depends(
#         require_roles(
#             "Healthcare Researcher",
#             "System Administrator",
#         )
#     ),
# ):

#     patients = list(
#         patients_collection.find()
#     )

#     anonymized_data = []

#     for index, patient in enumerate(patients):

#         anonymized_data.append(
#             {
#                 "record_id": f"R-{index + 1:06d}",
#                 "age": patient.get("age"),
#                 "disease": patient.get("disease"),
#                 "risk": patient.get("risk"),
#                 "status": patient.get("status"),
#             }
#         )

#     return {
#         "records": anonymized_data
#     }


# # =========================================================
# # RESEARCH DATA EXPORT
# # =========================================================


# @app.get("/api/research/dataset/export")
# def export_research_dataset(
#     current_user: dict = Depends(
#         require_roles(
#             "Healthcare Researcher",
#             "System Administrator",
#         )
#     ),
# ):

#     patients = list(
#         patients_collection.find()
#     )

#     records = []

#     for index, patient in enumerate(patients):

#         records.append(
#             {
#                 "record_id": f"R-{index + 1:06d}",
#                 "age": patient.get("age"),
#                 "disease": patient.get("disease"),
#                 "risk": patient.get("risk"),
#                 "status": patient.get("status"),
#             }
#         )

#     create_audit_log(
#         current_user,
#         "RESEARCH_DATA_EXPORT",
#         details={
#             "records": len(records)
#         },
#     )

#     return {
#         "records": records
#     }


# # =========================================================
# # SYSTEM ADMIN - USERS
# # =========================================================


# @app.get("/api/admin/users")
# def admin_get_users(
#     current_user: dict = Depends(
#         require_roles(
#             "System Administrator"
#         )
#     ),
# ):

#     users = list(
#         users_collection.find(
#             {},
#             {
#                 "password": 0
#             },
#         )
#     )

#     users.append(
#         {
#             "_id": "system-admin",
#             "name": "System Administrator",
#             "email": SYSTEM_ADMIN_EMAIL,
#             "role": "System Administrator",
#             "protected": True,
#         }
#     )

#     for user in users:

#         if "_id" in user:
#             user["_id"] = str(user["_id"])

#         if user.get("created_at"):
#             user["created_at"] = user[
#                 "created_at"
#             ].isoformat()

#     return users


# # =========================================================
# # SYSTEM ADMIN - CREATE USER
# # =========================================================


# @app.post("/api/admin/users")
# def admin_create_user(
#     user: CreateAdminUser,
#     current_user: dict = Depends(
#         require_roles(
#             "System Administrator"
#         )
#     ),
# ):

#     allowed_roles = {
#         "Doctor",
#         "Hospital Administrator",
#         "Healthcare Researcher",
#     }

#     if user.role not in allowed_roles:

#         raise HTTPException(
#             status_code=400,
#             detail=(
#                 "The configured System Administrator "
#                 "cannot be created or replaced here."
#             ),
#         )

#     email = str(user.email).lower()

#     if email == SYSTEM_ADMIN_EMAIL.lower():

#         raise HTTPException(
#             status_code=400,
#             detail=(
#                 "This email belongs to the System Administrator."
#             ),
#         )

#     if users_collection.find_one(
#         {"email": email}
#     ):

#         raise HTTPException(
#             status_code=400,
#             detail="User already exists.",
#         )

#     hashed_password = bcrypt.hashpw(
#         user.password.encode("utf-8"),
#         bcrypt.gensalt(),
#     )

#     result = users_collection.insert_one(
#         {
#             "name": user.name,
#             "email": email,
#             "password": hashed_password.decode("utf-8"),
#             "role": user.role,
#             "created_at": datetime.now(timezone.utc),
#         }
#     )

#     create_audit_log(
#         current_user,
#         "CREATE_USER",
#         resource=str(result.inserted_id),
#         details={
#             "role": user.role
#         },
#     )

#     return {
#         "message": "User created successfully",
#         "user_id": str(result.inserted_id),
#     }


# # =========================================================
# # SYSTEM ADMIN - UPDATE ROLE
# # =========================================================


# @app.patch("/api/admin/users/{user_id}/role")
# def admin_update_role(
#     user_id: str,
#     role_data: UpdateRole,
#     current_user: dict = Depends(
#         require_roles(
#             "System Administrator"
#         )
#     ),
# ):

#     allowed_roles = {
#         "Doctor",
#         "Hospital Administrator",
#         "Healthcare Researcher",
#     }

#     if role_data.role not in allowed_roles:

#         raise HTTPException(
#             status_code=400,
#             detail=(
#                 "System Administrator is a protected "
#                 "backend-configured account."
#             ),
#         )

#     try:

#         object_id = ObjectId(user_id)

#     except Exception:

#         raise HTTPException(
#             status_code=400,
#             detail="Invalid user ID.",
#         )

#     user = users_collection.find_one(
#         {
#             "_id": object_id
#         }
#     )

#     if not user:

#         raise HTTPException(
#             status_code=404,
#             detail="User not found.",
#         )

#     users_collection.update_one(
#         {
#             "_id": object_id
#         },
#         {
#             "$set": {
#                 "role": role_data.role
#             }
#         },
#     )

#     create_audit_log(
#         current_user,
#         "UPDATE_USER_ROLE",
#         resource=user_id,
#         details={
#             "new_role": role_data.role
#         },
#     )

#     return {
#         "message": "User role updated successfully"
#     }


# # =========================================================
# # SYSTEM ADMIN - DELETE USER
# # =========================================================


# @app.delete("/api/admin/users/{user_id}")
# def admin_delete_user(
#     user_id: str,
#     current_user: dict = Depends(
#         require_roles(
#             "System Administrator"
#         )
#     ),
# ):

#     if user_id == "system-admin":

#         raise HTTPException(
#             status_code=400,
#             detail=(
#                 "The System Administrator account "
#                 "cannot be deleted."
#             ),
#         )

#     try:

#         object_id = ObjectId(user_id)

#     except Exception:

#         raise HTTPException(
#             status_code=400,
#             detail="Invalid user ID.",
#         )

#     result = users_collection.delete_one(
#         {
#             "_id": object_id
#         }
#     )

#     if result.deleted_count == 0:

#         raise HTTPException(
#             status_code=404,
#             detail="User not found.",
#         )

#     create_audit_log(
#         current_user,
#         "DELETE_USER",
#         resource=user_id,
#     )

#     return {
#         "message": "User deleted successfully"
#     }


# # =========================================================
# # SYSTEM ADMIN - ASSIGN PATIENT
# # =========================================================


# @app.patch("/api/admin/patients/{patient_id}/assign")
# def assign_patient(
#     patient_id: str,
#     assignment: AssignPatient,
#     current_user: dict = Depends(
#         require_roles(
#             "System Administrator"
#         )
#     ),
# ):

#     try:

#         patient_object_id = ObjectId(patient_id)

#         doctor_object_id = ObjectId(
#             assignment.doctor_id
#         )

#     except Exception:

#         raise HTTPException(
#             status_code=400,
#             detail="Invalid patient or doctor ID.",
#         )

#     doctor = users_collection.find_one(
#         {
#             "_id": doctor_object_id,
#             "role": "Doctor",
#         }
#     )

#     if not doctor:

#         raise HTTPException(
#             status_code=404,
#             detail="Doctor not found.",
#         )

#     patient = patients_collection.find_one(
#         {
#             "_id": patient_object_id
#         }
#     )

#     if not patient:

#         raise HTTPException(
#             status_code=404,
#             detail="Patient not found.",
#         )

#     patients_collection.update_one(
#         {
#             "_id": patient_object_id
#         },
#         {
#             "$set": {
#                 "doctor_id": assignment.doctor_id
#             }
#         },
#     )

#     create_audit_log(
#         current_user,
#         "ASSIGN_PATIENT",
#         resource=patient_id,
#         details={
#             "doctor_id": assignment.doctor_id
#         },
#     )

#     return {
#         "message": "Patient assigned successfully"
#     }


# # =========================================================
# # SYSTEM ADMIN - AUDIT LOGS
# # =========================================================


# @app.get("/api/admin/audit-logs")
# def get_audit_logs(
#     current_user: dict = Depends(
#         require_roles(
#             "System Administrator"
#         )
#     ),
# ):

#     logs = list(
#         audit_logs_collection.find()
#         .sort("created_at", -1)
#         .limit(500)
#     )

#     for log in logs:

#         if "_id" in log:
#             log["_id"] = str(log["_id"])

#         if log.get("created_at"):
#             log["created_at"] = log[
#                 "created_at"
#             ].isoformat()

#     return logs


# # =========================================================
# # SYSTEM ADMIN - MODEL INFORMATION
# # =========================================================


# @app.get("/api/admin/model")
# def admin_model_info(
#     current_user: dict = Depends(
#         require_roles(
#             "System Administrator"
#         )
#     ),
# ):

#     return {
#         "model_path": MODEL_PATH,
#         "model_loaded": True,
#         "threshold": READMISSION_THRESHOLD,
#         "features": MODEL_FEATURES,
#     }


# # =========================================================
# # SYSTEM ADMIN - MODEL RELOAD
# # =========================================================


# @app.post("/api/admin/model/reload")
# def admin_reload_model(
#     current_user: dict = Depends(
#         require_roles(
#             "System Administrator"
#         )
#     ),
# ):

#     global readmission_model
#     global READMISSION_THRESHOLD
#     global MODEL_FEATURES

#     try:

#         model_package = joblib.load(
#             MODEL_PATH
#         )

#         readmission_model = model_package["model"]

#         READMISSION_THRESHOLD = (
#             model_package["threshold"]
#         )

#         MODEL_FEATURES = (
#             model_package["features"]
#         )

#         create_audit_log(
#             current_user,
#             "MODEL_RELOAD",
#         )

#         return {
#             "message": "ML model reloaded successfully.",
#             "threshold": READMISSION_THRESHOLD,
#             "features": MODEL_FEATURES,
#         }

#     except Exception as e:

#         raise HTTPException(
#             status_code=500,
#             detail=f"Model reload failed: {str(e)}",
#         )


# # =========================================================
# # SYSTEM ADMIN - DATASETS
# # =========================================================


# @app.get("/api/admin/datasets")
# def admin_get_datasets(
#     current_user: dict = Depends(
#         require_roles(
#             "System Administrator"
#         )
#     ),
# ):

#     datasets = list(
#         datasets_collection.find()
#     )

#     for dataset in datasets:

#         if "_id" in dataset:
#             dataset["_id"] = str(dataset["_id"])

#         if dataset.get("created_at"):
#             dataset["created_at"] = dataset[
#                 "created_at"
#             ].isoformat()

#     return datasets


# @app.post("/api/admin/datasets")
# def admin_create_dataset(
#     dataset: DatasetInfo,
#     current_user: dict = Depends(
#         require_roles(
#             "System Administrator"
#         )
#     ),
# ):

#     result = datasets_collection.insert_one(
#         {
#             "name": dataset.name,
#             "description": dataset.description,
#             "source": dataset.source,
#             "created_at": datetime.now(timezone.utc),
#         }
#     )

#     create_audit_log(
#         current_user,
#         "CREATE_DATASET",
#         resource=str(result.inserted_id),
#     )

#     return {
#         "message": "Dataset information created successfully.",
#         "dataset_id": str(result.inserted_id),
#     }


# # =========================================================
# # SYSTEM ADMIN - SETTINGS
# # =========================================================


# @app.get("/api/admin/settings")
# def admin_get_settings(
#     current_user: dict = Depends(
#         require_roles(
#             "System Administrator"
#         )
#     ),
# ):

#     settings = list(
#         system_settings_collection.find()
#     )

#     for setting in settings:

#         if "_id" in setting:
#             setting["_id"] = str(setting["_id"])

#         if setting.get("updated_at"):
#             setting["updated_at"] = setting[
#                 "updated_at"
#             ].isoformat()

#     return settings


# @app.patch("/api/admin/settings")
# def admin_update_setting(
#     setting: SystemSetting,
#     current_user: dict = Depends(
#         require_roles(
#             "System Administrator"
#         )
#     ),
# ):

#     system_settings_collection.update_one(
#         {
#             "key": setting.key
#         },
#         {
#             "$set": {
#                 "key": setting.key,
#                 "value": setting.value,
#                 "updated_at": datetime.now(timezone.utc),
#             }
#         },
#         upsert=True,
#     )

#     create_audit_log(
#         current_user,
#         "UPDATE_SYSTEM_SETTING",
#         details={
#             "key": setting.key
#         },
#     )

#     return {
#         "message": "System setting updated successfully."
#     }


# # =========================================================
# # HOSPITAL ANALYTICS EXPORT
# # =========================================================


# @app.get("/api/analytics/hospital/export")
# def export_hospital_analytics(
#     current_user: dict = Depends(
#         require_roles(
#             "Hospital Administrator",
#             "System Administrator",
#         )
#     ),
# ):

#     patients = list(
#         patients_collection.find()
#     )

#     rows = []

#     for patient in patients:

#         rows.append(
#             {
#                 "patient_age": patient.get("age"),
#                 "disease": patient.get("disease"),
#                 "risk": patient.get("risk"),
#                 "status": patient.get("status"),
#             }
#         )

#     create_audit_log(
#         current_user,
#         "HOSPITAL_ANALYTICS_EXPORT",
#         details={
#             "records": len(rows)
#         },
#     )

#     return {
#         "records": rows
#     }
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth_routes import router as auth_router
from routes.patient_routes import router as patient_router
from routes.prediction_routes import router as prediction_router
from routes.treatment_routes import router as treatment_router
from routes.report_routes import router as report_router
from routes.analytics_routes import router as analytics_router
from routes.research_routes import router as research_router
from routes.admin_routes import router as admin_router

app = FastAPI(
    title="HealthForecast AI API",
    description="Hospital Readmission Prediction & Patient Risk Intelligence System",
    version="1.0.0",
)

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

app.include_router(auth_router)
app.include_router(patient_router)
app.include_router(prediction_router)
app.include_router(treatment_router)
app.include_router(report_router)
app.include_router(analytics_router)
app.include_router(research_router)
app.include_router(admin_router)


@app.get("/")
def home():
    return {
        "message": "HealthForecast AI Backend is running!"
    }


@app.get("/api/health")
def health_check():
    from database.connection import client

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