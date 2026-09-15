"""
HealthForecast AI — Realistic Synthetic Hospital Demo Data Seeder for Viva Demonstration.

Safely populates the database with:
- Multiple unique Doctor accounts
- 20 unique realistic synthetic patient encounters
- Real XGBoost model inference for each patient (predict_proba)
- Dynamic risk classification & clinical insights
- Prediction history linked to responsible doctors
- In-app alerts/notifications for high-risk cases
- Audit log records

Idempotent: Safe to execute multiple times without duplicates or data loss.
"""

import os
import sys
import json
import joblib
import pandas as pd
from datetime import datetime, timezone

# Ensure backend directory is in path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from database import SessionLocal, engine, Base
import models
import auth

# -------------------------------------------------------------
# 1. LOAD ML MODEL ARTIFACTS
# -------------------------------------------------------------
MODEL_DIR = os.path.join(CURRENT_DIR, "ml_model")
model = joblib.load(os.path.join(MODEL_DIR, "xgboost_readmission_model.pkl"))
encoder = joblib.load(os.path.join(MODEL_DIR, "onehot_encoder.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "standard_scaler.pkl"))

with open(os.path.join(MODEL_DIR, "feature_columns.json")) as f:
    feature_info = json.load(f)

categorical_cols = feature_info["categorical_cols"]
numerical_cols = feature_info["numerical_cols"]
final_feature_names = feature_info["final_feature_names"]

def clean_column_name(name: str) -> str:
    return name.replace("[", "").replace("]", "").replace("<", "lt_")

def generate_clinical_insights(data: dict, probability: float, risk_class: str) -> list:
    insights = []
    if data.get("number_inpatient", 0) > 0:
        insights.append({
            "factor": f"Prior Inpatient Admissions: {data.get('number_inpatient')}",
            "impact": "high",
            "recommendation": "High prior hospital utilization is a primary risk driver. Schedule post-discharge follow-up within 7 days."
        })
    if data.get("time_in_hospital", 0) >= 5:
        insights.append({
            "factor": f"Length of Stay: {data.get('time_in_hospital')} days",
            "impact": "high" if data.get("time_in_hospital") >= 7 else "moderate",
            "recommendation": "Extended hospital stay indicates acute complexity. Ensure thorough care transition planning."
        })
    if data.get("num_medications", 0) >= 15:
        insights.append({
            "factor": f"High Medication Count: {data.get('num_medications')} active medications",
            "impact": "moderate",
            "recommendation": "Polypharmacy risk detected. Conduct clinical pharmacy medication reconciliation prior to discharge."
        })
    if data.get("number_emergency", 0) > 0:
        insights.append({
            "factor": f"Recent Emergency Room Visits: {data.get('number_emergency')}",
            "impact": "high",
            "recommendation": "Frequent ED utilization indicates unstable chronic symptoms. Coordinate outpatient chronic disease management."
        })
    if data.get("A1Cresult") in [">8", ">7"]:
        insights.append({
            "factor": f"Elevated HbA1c: {data.get('A1Cresult')}",
            "impact": "moderate",
            "recommendation": "Suboptimal glycemic control. Review outpatient diabetes management protocol and dietary guidance."
        })
    if data.get("insulin") in ["Up", "Steady"]:
        insights.append({
            "factor": f"Insulin Therapy Prescribed ({data.get('insulin')})",
            "impact": "moderate",
            "recommendation": "Verify patient adherence and blood glucose self-monitoring technique before discharge."
        })
    if not insights:
        insights.append({
            "factor": "Routine Clinical Indicators",
            "impact": "low",
            "recommendation": "Patient demonstrates low readmission indicators. Standard post-discharge primary care follow-up recommended."
        })
    return insights

# -------------------------------------------------------------
# 2. SEED STAFF USERS (DOCTORS, ADMIN, RESEARCHER, SYSADMIN)
# -------------------------------------------------------------
SEED_USERS = [
    # Primary Seeded Accounts
    {"username": "doctor@hospital.com", "email": "doctor@hospital.com", "full_name": "Dr. Sarah Chen", "role": "Doctor", "password": "doctor123"},
    {"username": "admin@hospital.com", "email": "admin@hospital.com", "full_name": "James Wilson", "role": "Hospital Administrator", "password": "admin123"},
    {"username": "researcher@hospital.com", "email": "researcher@hospital.com", "full_name": "Dr. Emily Rodriguez", "role": "Healthcare Researcher", "password": "researcher123"},
    {"username": "sysadmin@hospital.com", "email": "sysadmin@hospital.com", "full_name": "Alex Kumar", "role": "System Administrator", "password": "sysadmin123"},
    
    # Additional Clinical Doctors
    {"username": "arun.kumar@hospital.com", "email": "arun.kumar@hospital.com", "full_name": "Dr. Arun Kumar", "role": "Doctor", "password": "doctor123"},
    {"username": "priya.sharma@hospital.com", "email": "priya.sharma@hospital.com", "full_name": "Dr. Priya Sharma", "role": "Doctor", "password": "doctor123"},
    {"username": "karthik.rao@hospital.com", "email": "karthik.rao@hospital.com", "full_name": "Dr. Karthik Rao", "role": "Doctor", "password": "doctor123"},
    {"username": "meena.iyer@hospital.com", "email": "meena.iyer@hospital.com", "full_name": "Dr. Meena Iyer", "role": "Doctor", "password": "doctor123"},
    {"username": "rahul.menon@hospital.com", "email": "rahul.menon@hospital.com", "full_name": "Dr. Rahul Menon", "role": "Doctor", "password": "doctor123"},
    {"username": "ananya.reddy@hospital.com", "email": "ananya.reddy@hospital.com", "full_name": "Dr. Ananya Reddy", "role": "Doctor", "password": "doctor123"}
]

# -------------------------------------------------------------
# 3. 20 UNIQUE SYNTHETIC PATIENT ENCOUNTERS
# -------------------------------------------------------------
SYNTHETIC_PATIENTS = [
    # --- Dr. Arun Kumar (Internal Medicine & Chronic Care) ---
    {
        "doctor_username": "arun.kumar@hospital.com",
        "patient_name": "Rajesh Kumar",
        "race": "Asian", "gender": "Male", "age": "[60-70)",
        "admission_type_id": "1", "discharge_disposition_id": "1", "admission_source_id": "7",
        "time_in_hospital": 6, "payer_code": "MC", "medical_specialty": "InternalMedicine",
        "num_lab_procedures": 54, "num_procedures": 2, "num_medications": 18,
        "number_outpatient": 1, "number_emergency": 2, "number_inpatient": 2, "number_diagnoses": 9,
        "max_glu_serum": "None", "A1Cresult": ">8", "metformin": "Steady", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "Up", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "Up",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "Ch",
        "diabetesMed": "Yes", "diag_1_group": "Circulatory", "diag_2_group": "Diabetes", "diag_3_group": "Respiratory"
    },
    {
        "doctor_username": "arun.kumar@hospital.com",
        "patient_name": "Priya Nair",
        "race": "Asian", "gender": "Female", "age": "[40-50)",
        "admission_type_id": "2", "discharge_disposition_id": "1", "admission_source_id": "1",
        "time_in_hospital": 2, "payer_code": "HM", "medical_specialty": "InternalMedicine",
        "num_lab_procedures": 22, "num_procedures": 0, "num_medications": 6,
        "number_outpatient": 0, "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 3,
        "max_glu_serum": "None", "A1Cresult": "Norm", "metformin": "No", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "No",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "No",
        "diabetesMed": "No", "diag_1_group": "Digestive", "diag_2_group": "Other", "diag_3_group": "Other"
    },
    {
        "doctor_username": "arun.kumar@hospital.com",
        "patient_name": "Suresh Menon",
        "race": "Asian", "gender": "Male", "age": "[70-80)",
        "admission_type_id": "1", "discharge_disposition_id": "3", "admission_source_id": "7",
        "time_in_hospital": 8, "payer_code": "MC", "medical_specialty": "InternalMedicine",
        "num_lab_procedures": 68, "num_procedures": 1, "num_medications": 22,
        "number_outpatient": 2, "number_emergency": 1, "number_inpatient": 3, "number_diagnoses": 9,
        "max_glu_serum": ">200", "A1Cresult": ">7", "metformin": "No", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "Steady", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "Steady",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "Ch",
        "diabetesMed": "Yes", "diag_1_group": "Circulatory", "diag_2_group": "Diabetes", "diag_3_group": "Genitourinary"
    },
    {
        "doctor_username": "arun.kumar@hospital.com",
        "patient_name": "Kavya Iyer",
        "race": "Asian", "gender": "Female", "age": "[30-40)",
        "admission_type_id": "3", "discharge_disposition_id": "1", "admission_source_id": "1",
        "time_in_hospital": 1, "payer_code": "BC", "medical_specialty": "Family/GeneralPractice",
        "num_lab_procedures": 18, "num_procedures": 0, "num_medications": 4,
        "number_outpatient": 0, "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 2,
        "max_glu_serum": "None", "A1Cresult": "None", "metformin": "No", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "No",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "No",
        "diabetesMed": "No", "diag_1_group": "Other", "diag_2_group": "Other", "diag_3_group": "Other"
    },

    # --- Dr. Priya Sharma (Cardiology & Metabolic Care) ---
    {
        "doctor_username": "priya.sharma@hospital.com",
        "patient_name": "Arjun Patel",
        "race": "Asian", "gender": "Male", "age": "[50-60)",
        "admission_type_id": "1", "discharge_disposition_id": "1", "admission_source_id": "7",
        "time_in_hospital": 5, "payer_code": "MC", "medical_specialty": "Cardiology",
        "num_lab_procedures": 48, "num_procedures": 3, "num_medications": 16,
        "number_outpatient": 0, "number_emergency": 1, "number_inpatient": 1, "number_diagnoses": 8,
        "max_glu_serum": "None", "A1Cresult": ">7", "metformin": "Steady", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "Steady", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "No",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "No",
        "diabetesMed": "Yes", "diag_1_group": "Circulatory", "diag_2_group": "Circulatory", "diag_3_group": "Diabetes"
    },
    {
        "doctor_username": "priya.sharma@hospital.com",
        "patient_name": "Meena Krishnan",
        "race": "Asian", "gender": "Female", "age": "[60-70)",
        "admission_type_id": "2", "discharge_disposition_id": "1", "admission_source_id": "1",
        "time_in_hospital": 3, "payer_code": "MD", "medical_specialty": "Cardiology",
        "num_lab_procedures": 36, "num_procedures": 1, "num_medications": 12,
        "number_outpatient": 1, "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 5,
        "max_glu_serum": "None", "A1Cresult": "Norm", "metformin": "No", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "No",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "No",
        "diabetesMed": "No", "diag_1_group": "Circulatory", "diag_2_group": "Circulatory", "diag_3_group": "Other"
    },
    {
        "doctor_username": "priya.sharma@hospital.com",
        "patient_name": "Divya Sharma",
        "race": "Asian", "gender": "Female", "age": "[50-60)",
        "admission_type_id": "1", "discharge_disposition_id": "1", "admission_source_id": "7",
        "time_in_hospital": 4, "payer_code": "BC", "medical_specialty": "Cardiology",
        "num_lab_procedures": 42, "num_procedures": 2, "num_medications": 14,
        "number_outpatient": 0, "number_emergency": 0, "number_inpatient": 1, "number_diagnoses": 6,
        "max_glu_serum": "None", "A1Cresult": "Norm", "metformin": "Steady", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "No",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "No",
        "diabetesMed": "Yes", "diag_1_group": "Circulatory", "diag_2_group": "Diabetes", "diag_3_group": "Other"
    },
    {
        "doctor_username": "priya.sharma@hospital.com",
        "patient_name": "Neha Kapoor",
        "race": "Asian", "gender": "Female", "age": "[70-80)",
        "admission_type_id": "1", "discharge_disposition_id": "1", "admission_source_id": "7",
        "time_in_hospital": 7, "payer_code": "MC", "medical_specialty": "Cardiology",
        "num_lab_procedures": 62, "num_procedures": 2, "num_medications": 20,
        "number_outpatient": 1, "number_emergency": 1, "number_inpatient": 2, "number_diagnoses": 9,
        "max_glu_serum": ">300", "A1Cresult": ">8", "metformin": "No", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "Steady", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "Up",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "Ch",
        "diabetesMed": "Yes", "diag_1_group": "Circulatory", "diag_2_group": "Circulatory", "diag_3_group": "Diabetes"
    },

    # --- Dr. Karthik Rao (Emergency & Trauma Services) ---
    {
        "doctor_username": "karthik.rao@hospital.com",
        "patient_name": "Vikram Singh",
        "race": "Asian", "gender": "Male", "age": "[40-50)",
        "admission_type_id": "1", "discharge_disposition_id": "1", "admission_source_id": "7",
        "time_in_hospital": 3, "payer_code": "SP", "medical_specialty": "Emergency/Trauma",
        "num_lab_procedures": 38, "num_procedures": 2, "num_medications": 9,
        "number_outpatient": 0, "number_emergency": 1, "number_inpatient": 0, "number_diagnoses": 4,
        "max_glu_serum": "None", "A1Cresult": "None", "metformin": "No", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "No",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "No",
        "diabetesMed": "No", "diag_1_group": "Injury", "diag_2_group": "Musculoskeletal", "diag_3_group": "Other"
    },
    {
        "doctor_username": "karthik.rao@hospital.com",
        "patient_name": "Rohit Verma",
        "race": "Asian", "gender": "Male", "age": "[50-60)",
        "admission_type_id": "1", "discharge_disposition_id": "1", "admission_source_id": "7",
        "time_in_hospital": 4, "payer_code": "MC", "medical_specialty": "Emergency/Trauma",
        "num_lab_procedures": 44, "num_procedures": 1, "num_medications": 13,
        "number_outpatient": 0, "number_emergency": 2, "number_inpatient": 1, "number_diagnoses": 6,
        "max_glu_serum": "Norm", "A1Cresult": "Norm", "metformin": "Steady", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "Steady",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "Ch",
        "diabetesMed": "Yes", "diag_1_group": "Circulatory", "diag_2_group": "Diabetes", "diag_3_group": "Injury"
    },
    {
        "doctor_username": "karthik.rao@hospital.com",
        "patient_name": "Sanjay Rao",
        "race": "Asian", "gender": "Male", "age": "[60-70)",
        "admission_type_id": "1", "discharge_disposition_id": "1", "admission_source_id": "7",
        "time_in_hospital": 5, "payer_code": "MC", "medical_specialty": "Emergency/Trauma",
        "num_lab_procedures": 51, "num_procedures": 1, "num_medications": 15,
        "number_outpatient": 0, "number_emergency": 1, "number_inpatient": 2, "number_diagnoses": 7,
        "max_glu_serum": ">200", "A1Cresult": ">7", "metformin": "Steady", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "Steady", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "No",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "No",
        "diabetesMed": "Yes", "diag_1_group": "Respiratory", "diag_2_group": "Diabetes", "diag_3_group": "Circulatory"
    },
    {
        "doctor_username": "karthik.rao@hospital.com",
        "patient_name": "Amit Joshi",
        "race": "Asian", "gender": "Male", "age": "[30-40)",
        "admission_type_id": "1", "discharge_disposition_id": "1", "admission_source_id": "7",
        "time_in_hospital": 2, "payer_code": "BC", "medical_specialty": "Emergency/Trauma",
        "num_lab_procedures": 29, "num_procedures": 0, "num_medications": 7,
        "number_outpatient": 0, "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 3,
        "max_glu_serum": "None", "A1Cresult": "None", "metformin": "No", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "No",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "No",
        "diabetesMed": "No", "diag_1_group": "Digestive", "diag_2_group": "Other", "diag_3_group": "Other"
    },

    # --- Dr. Meena Iyer (Endocrinology & Complex Diabetes) ---
    {
        "doctor_username": "meena.iyer@hospital.com",
        "patient_name": "Ananya Reddy",
        "race": "Asian", "gender": "Female", "age": "[20-30)",
        "admission_type_id": "1", "discharge_disposition_id": "1", "admission_source_id": "7",
        "time_in_hospital": 3, "payer_code": "HM", "medical_specialty": "Endocrinology",
        "num_lab_procedures": 41, "num_procedures": 0, "num_medications": 8,
        "number_outpatient": 0, "number_emergency": 1, "number_inpatient": 0, "number_diagnoses": 4,
        "max_glu_serum": ">300", "A1Cresult": ">8", "metformin": "No", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "Up",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "Ch",
        "diabetesMed": "Yes", "diag_1_group": "Diabetes", "diag_2_group": "Diabetes", "diag_3_group": "Other"
    },
    {
        "doctor_username": "meena.iyer@hospital.com",
        "patient_name": "Pooja Desai",
        "race": "Asian", "gender": "Female", "age": "[50-60)",
        "admission_type_id": "2", "discharge_disposition_id": "1", "admission_source_id": "1",
        "time_in_hospital": 3, "payer_code": "MC", "medical_specialty": "Endocrinology",
        "num_lab_procedures": 35, "num_procedures": 0, "num_medications": 11,
        "number_outpatient": 1, "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 5,
        "max_glu_serum": "None", "A1Cresult": "Norm", "metformin": "Steady", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "Steady",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "No",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "No",
        "diabetesMed": "Yes", "diag_1_group": "Diabetes", "diag_2_group": "Circulatory", "diag_3_group": "Other"
    },
    {
        "doctor_username": "meena.iyer@hospital.com",
        "patient_name": "Lakshmi Narayanan",
        "race": "Asian", "gender": "Female", "age": "[60-70)",
        "admission_type_id": "1", "discharge_disposition_id": "1", "admission_source_id": "7",
        "time_in_hospital": 6, "payer_code": "MC", "medical_specialty": "Endocrinology",
        "num_lab_procedures": 58, "num_procedures": 1, "num_medications": 19,
        "number_outpatient": 1, "number_emergency": 1, "number_inpatient": 2, "number_diagnoses": 8,
        "max_glu_serum": ">200", "A1Cresult": ">8", "metformin": "Steady", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "Steady", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "Up",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "Ch",
        "diabetesMed": "Yes", "diag_1_group": "Diabetes", "diag_2_group": "Circulatory", "diag_3_group": "Respiratory"
    },
    {
        "doctor_username": "meena.iyer@hospital.com",
        "patient_name": "Aishwarya Kumar",
        "race": "Asian", "gender": "Female", "age": "[40-50)",
        "admission_type_id": "3", "discharge_disposition_id": "1", "admission_source_id": "1",
        "time_in_hospital": 2, "payer_code": "BC", "medical_specialty": "Endocrinology",
        "num_lab_procedures": 25, "num_procedures": 0, "num_medications": 5,
        "number_outpatient": 0, "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 3,
        "max_glu_serum": "None", "A1Cresult": "Norm", "metformin": "Steady", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "No",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "No",
        "diabetesMed": "Yes", "diag_1_group": "Diabetes", "diag_2_group": "Other", "diag_3_group": "Other"
    },

    # --- Dr. Rahul Menon (Pulmonology & Respiratory Medicine) ---
    {
        "doctor_username": "rahul.menon@hospital.com",
        "patient_name": "Rahul Mehta",
        "race": "Asian", "gender": "Male", "age": "[50-60)",
        "admission_type_id": "1", "discharge_disposition_id": "1", "admission_source_id": "7",
        "time_in_hospital": 5, "payer_code": "MC", "medical_specialty": "Pulmonology",
        "num_lab_procedures": 49, "num_procedures": 1, "num_medications": 14,
        "number_outpatient": 0, "number_emergency": 1, "number_inpatient": 1, "number_diagnoses": 7,
        "max_glu_serum": "None", "A1Cresult": "Norm", "metformin": "No", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "No",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "No",
        "diabetesMed": "No", "diag_1_group": "Respiratory", "diag_2_group": "Circulatory", "diag_3_group": "Other"
    },
    {
        "doctor_username": "rahul.menon@hospital.com",
        "patient_name": "Sneha Pillai",
        "race": "Asian", "gender": "Female", "age": "[60-70)",
        "admission_type_id": "1", "discharge_disposition_id": "1", "admission_source_id": "7",
        "time_in_hospital": 6, "payer_code": "MC", "medical_specialty": "Pulmonology",
        "num_lab_procedures": 52, "num_procedures": 1, "num_medications": 16,
        "number_outpatient": 1, "number_emergency": 1, "number_inpatient": 2, "number_diagnoses": 8,
        "max_glu_serum": "None", "A1Cresult": ">7", "metformin": "Steady", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "Steady",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "Ch",
        "diabetesMed": "Yes", "diag_1_group": "Respiratory", "diag_2_group": "Diabetes", "diag_3_group": "Circulatory"
    },

    # --- Dr. Ananya Reddy (Nephrology & Renal Medicine) ---
    {
        "doctor_username": "ananya.reddy@hospital.com",
        "patient_name": "Manoj Gupta",
        "race": "Asian", "gender": "Male", "age": "[60-70)",
        "admission_type_id": "1", "discharge_disposition_id": "1", "admission_source_id": "7",
        "time_in_hospital": 7, "payer_code": "MC", "medical_specialty": "Nephrology",
        "num_lab_procedures": 61, "num_procedures": 2, "num_medications": 21,
        "number_outpatient": 2, "number_emergency": 1, "number_inpatient": 2, "number_diagnoses": 9,
        "max_glu_serum": ">200", "A1Cresult": ">8", "metformin": "No", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "Up",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "Ch",
        "diabetesMed": "Yes", "diag_1_group": "Genitourinary", "diag_2_group": "Diabetes", "diag_3_group": "Circulatory"
    },
    {
        "doctor_username": "ananya.reddy@hospital.com",
        "patient_name": "Karthik Subramanian",
        "race": "Asian", "gender": "Male", "age": "[50-60)",
        "admission_type_id": "2", "discharge_disposition_id": "1", "admission_source_id": "1",
        "time_in_hospital": 3, "payer_code": "MC", "medical_specialty": "Nephrology",
        "num_lab_procedures": 34, "num_procedures": 1, "num_medications": 11,
        "number_outpatient": 1, "number_emergency": 0, "number_inpatient": 0, "number_diagnoses": 5,
        "max_glu_serum": "None", "A1Cresult": "Norm", "metformin": "Steady", "repaglinide": "No",
        "nateglinide": "No", "chlorpropamide": "No", "glimepiride": "No", "acetohexamide": "No",
        "glipizide": "No", "glyburide": "No", "tolbutamide": "No", "pioglitazone": "No",
        "rosiglitazone": "No", "acarbose": "No", "miglitol": "No", "troglitazone": "No",
        "tolazamide": "No", "examide": "No", "citoglipton": "No", "insulin": "No",
        "glyburide_metformin": "No", "glipizide_metformin": "No", "glimepiride_pioglitazone": "No",
        "metformin_rosiglitazone": "No", "metformin_pioglitazone": "No", "change": "No",
        "diabetesMed": "Yes", "diag_1_group": "Genitourinary", "diag_2_group": "Diabetes", "diag_3_group": "Other"
    }
]

def seed_hospital_demo_data():
    db = SessionLocal()
    print("=" * 70)
    print("SEEDING REALISTIC SYNTHETIC HOSPITAL DATA FOR VIVA DEMONSTRATION")
    print("=" * 70)

    # 1. Seed / Ensure Users
    user_map = {}
    for user_info in SEED_USERS:
        existing_user = db.query(models.User).filter(
            models.User.username == user_info["username"]
        ).first()

        if not existing_user:
            new_user = models.User(
                username=user_info["username"],
                email=user_info["email"],
                full_name=user_info["full_name"],
                role=user_info["role"],
                password_hash=auth.hash_password(user_info["password"]),
                is_active=True
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            user_map[user_info["username"]] = new_user
            print(f" [USER CREATED] {new_user.full_name} ({new_user.role}) - {new_user.username}")
        else:
            user_map[user_info["username"]] = existing_user
            print(f" [USER EXISTS] {existing_user.full_name} ({existing_user.role}) - ID: {existing_user.id}")

    # 2. Process Patients & Real XGBoost Inferences
    patient_results = []
    print("\n--- PROCESSING 20 SYNTHETIC PATIENTS & REAL XGBOOST INFERENCES ---")

    for idx, p_info in enumerate(SYNTHETIC_PATIENTS, 1):
        doc_username = p_info["doctor_username"]
        doctor = user_map.get(doc_username) or db.query(models.User).filter(models.User.username == doc_username).first()
        patient_name = p_info["patient_name"]

        # Check if patient exists
        patient = db.query(models.Patient).filter(models.Patient.patient_name == patient_name).first()
        
        patient_data_dict = {k: v for k, v in p_info.items() if k not in ["doctor_username", "patient_name"]}
        
        if not patient:
            patient = models.Patient(
                patient_name=patient_name,
                **patient_data_dict
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)
            print(f" [{idx:02d}/20 PATIENT CREATED] ID: {patient.id} - {patient_name} (Assigned: {doctor.full_name})")
        else:
            print(f" [{idx:02d}/20 PATIENT EXISTS]  ID: {patient.id} - {patient_name} (Assigned: {doctor.full_name})")

        # 3. Prepare Exact ML DataFrame & Inference
        ml_data = patient_data_dict.copy()
        ml_data["glyburide-metformin"] = ml_data.pop("glyburide_metformin")
        ml_data["glipizide-metformin"] = ml_data.pop("glipizide_metformin")
        ml_data["glimepiride-pioglitazone"] = ml_data.pop("glimepiride_pioglitazone")
        ml_data["metformin-rosiglitazone"] = ml_data.pop("metformin_rosiglitazone")
        ml_data["metformin-pioglitazone"] = ml_data.pop("metformin_pioglitazone")

        df = pd.DataFrame([ml_data])
        cat_data = encoder.transform(df[categorical_cols])
        cat_cols_out = encoder.get_feature_names_out(categorical_cols)
        cat_df = pd.DataFrame(cat_data, columns=cat_cols_out)

        num_data = scaler.transform(df[numerical_cols])
        num_df = pd.DataFrame(num_data, columns=numerical_cols)

        final_df = pd.concat([num_df, cat_df], axis=1)
        final_df.columns = [clean_column_name(c) for c in final_df.columns]
        final_df = final_df.reindex(columns=final_feature_names, fill_value=0)

        probability = float(model.predict_proba(final_df)[0][1])
        risk_percentage = round(probability * 100.0, 2)

        if probability >= 0.7:
            risk_class = "CRITICAL"
            prediction_label = "High Readmission Risk"
        elif probability >= 0.5:
            risk_class = "HIGH"
            prediction_label = "Elevated Readmission Risk"
        elif probability >= 0.3:
            risk_class = "MEDIUM"
            prediction_label = "Moderate Readmission Risk"
        else:
            risk_class = "LOW"
            prediction_label = "Low Readmission Risk"

        # Check existing prediction
        existing_pred = db.query(models.Prediction).filter(
            models.Prediction.patient_id == patient.id,
            models.Prediction.created_by == doctor.id
        ).first()

        if not existing_pred:
            pred = models.Prediction(
                patient_id=patient.id,
                probability=round(probability, 4),
                risk_class=risk_class,
                prediction=prediction_label,
                created_by=doctor.id
            )
            db.add(pred)
            db.commit()
            db.refresh(pred)

            # High/Critical notification
            if risk_class in ["HIGH", "CRITICAL"]:
                # Notify Doctor
                notif_doc = models.Notification(
                    user_id=doctor.id,
                    title=f"⚠️ {risk_class} Risk: {patient_name}",
                    message=f"Patient {patient_name} evaluated with {risk_percentage}% readmission risk. Clinical review recommended.",
                    category="critical" if risk_class == "CRITICAL" else "warning"
                )
                db.add(notif_doc)

                # Notify Hospital Admin
                admin_users = db.query(models.User).filter(models.User.role == "Hospital Administrator").all()
                for adm in admin_users:
                    notif_adm = models.Notification(
                        user_id=adm.id,
                        title=f"🏥 {risk_class} Risk Alert: {patient_name}",
                        message=f"{doctor.full_name} identified {patient_name} with {risk_percentage}% readmission risk.",
                        category="warning"
                    )
                    db.add(notif_adm)

            # Audit log
            audit = models.AuditLog(
                user_id=doctor.id,
                action="PREDICTION_GENERATED",
                detail=f"Evaluated {patient_name} (ID: {patient.id}): {risk_class} ({risk_percentage}%)",
                ip_address="127.0.0.1"
            )
            db.add(audit)
            db.commit()
            pred_id = pred.id
        else:
            pred_id = existing_pred.id

        insights = generate_clinical_insights(patient_data_dict, probability, risk_class)

        patient_results.append({
            "idx": idx,
            "patient_id": patient.id,
            "patient_name": patient_name,
            "doctor": doctor.full_name,
            "doctor_username": doctor.username,
            "probability": round(probability, 4),
            "risk_percentage": risk_percentage,
            "risk_class": risk_class,
            "primary_dx": p_info.get("diag_1_group"),
            "insights_count": len(insights),
            "top_insight": insights[0]["factor"] if insights else "None"
        })

    # Summary Counts
    total_users = db.query(models.User).count()
    total_doctors = db.query(models.User).filter(models.User.role == "Doctor").count()
    total_admins = db.query(models.User).filter(models.User.role == "Hospital Administrator").count()
    total_researchers = db.query(models.User).filter(models.User.role == "Healthcare Researcher").count()
    total_sysadmins = db.query(models.User).filter(models.User.role == "System Administrator").count()
    total_patients = db.query(models.Patient).count()
    total_predictions = db.query(models.Prediction).count()
    total_notifications = db.query(models.Notification).count()
    total_audit_logs = db.query(models.AuditLog).count()

    print("\n" + "=" * 70)
    print("VIVA DATASET SUMMARY")
    print("=" * 70)
    print(f"Total Users:              {total_users} (Doctors: {total_doctors}, Admins: {total_admins}, Researchers: {total_researchers}, SysAdmins: {total_sysadmins})")
    print(f"Total Patients:           {total_patients}")
    print(f"Total Predictions:        {total_predictions}")
    print(f"Total Notifications:      {total_notifications}")
    print(f"Total Audit Logs:         {total_audit_logs}")
    print("=" * 70)

    print("\n--- 20 SYNTHETIC PATIENTS & PREDICTION OUTCOMES ---")
    print(f"{'#':<3} | {'Patient Name':<20} | {'Doctor':<18} | {'Prob':<7} | {'Risk Class':<9} | {'Primary Diagnosis':<15}")
    print("-" * 85)
    for res in patient_results:
        print(f"{res['idx']:<3} | {res['patient_name']:<20} | {res['doctor']:<18} | {res['probability']:<7} | {res['risk_class']:<9} | {res['primary_dx']:<15}")

    db.close()
    return patient_results

if __name__ == "__main__":
    seed_hospital_demo_data()
