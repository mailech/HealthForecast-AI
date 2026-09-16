import sys
import json
import logging
from datetime import datetime

# Setup paths
sys.path.insert(0, '.')

from app.database import patients_collection
from app.routes.prediction import simple_predict, SimplePredictionInput
from app.ai.predictor import predictor_instance

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pipeline_test")

# Ensure models are loaded
predictor_instance.load_model()

# Fetch test patient from DB
patient = patients_collection.find_one()
patient_id = patient["patient_id"] if patient else "PAT-10002"

print("================================================================================")
print("             COMPLETE AI PREDICTION PIPELINE VERIFICATION TEST")
print("================================================================================\n")

# ------------------------------------------------------------------------------
# TEST A: Normal / Low-Risk Values
# ------------------------------------------------------------------------------
print("--------------------------------------------------------------------------------")
print("                          TEST A: NORMAL / LOW-RISK")
print("--------------------------------------------------------------------------------")

frontend_payload_a = {
    "patient_id": patient_id,
    "blood_pressure_systolic": 118,
    "blood_pressure_diastolic": 78,
    "blood_glucose": 95.0,
    "hba1c": 5.4,
    "heart_rate": 72,
    "spo2": 98.0,
    "body_temperature": 36.8,
    "bmi": 22.5,
    "cholesterol": 170.0,
    "has_diabetes": False,
    "has_hypertension": False,
    "has_heart_disease": False,
    "other_conditions": None,
    "symptoms_notes": "Routine checkup, patient feels well, no complaints."
}

print("\n1. FRONTEND PAYLOAD (sent to FastAPI /simple-predict):")
print(json.dumps(frontend_payload_a, indent=2))

inp_a = SimplePredictionInput(**frontend_payload_a)
print("\n2. BACKEND RECEIVED PAYLOAD (parsed Pydantic model):")
print(json.dumps(inp_a.model_dump(), indent=2))

user_context = {"email": "dr.doctor@test.com", "role": "Doctor"}

# Call simple_predict
result_a = simple_predict(inp_a, current_user=user_context)

print("\n3. PROCESSED MODEL INPUT (derived feature vector):")
print(json.dumps(result_a["features_used"], indent=2))

print("\n4. RAW MODEL PROBABILITIES & PREDICTIONS:")
print(f"   Model 1 (Risk) Probability        : {result_a['model1_probability']:.4f} ({result_a['model1_probability']*100:.2f}%)")
print(f"   Model 1 Prediction                : {result_a['model1_prediction']}")
print(f"   Model 2 (Readmission) Probability : {result_a['model2_probability']:.4f} ({result_a['model2_probability']*100:.2f}%)")
print(f"   Model 2 Prediction                : {result_a['model2_prediction']}")
print(f"   Combined Readmission Risk Score   : {result_a['readmission_risk_score']:.4f} ({result_a['readmission_risk_score']*100:.2f}%)")

print("\n5. FINAL RISK CLASSIFICATION:")
print(f"   Risk Level              : {result_a['risk_level']}")
print(f"   Clinical Interpretation : {result_a['clinical_interpretation']}")
print("--------------------------------------------------------------------------------\n")


# ------------------------------------------------------------------------------
# TEST B: Severe / High-Risk Values
# ------------------------------------------------------------------------------
print("--------------------------------------------------------------------------------")
print("                         TEST B: SEVERE / HIGH-RISK")
print("--------------------------------------------------------------------------------")

frontend_payload_b = {
    "patient_id": patient_id,
    "blood_pressure_systolic": 180,
    "blood_pressure_diastolic": 110,
    "blood_glucose": 300.0,
    "hba1c": 10.0,
    "heart_rate": 120,
    "spo2": 89.0,
    "body_temperature": 39.0,
    "bmi": 35.0,
    "cholesterol": 280.0,
    "has_diabetes": True,
    "has_hypertension": True,
    "has_heart_disease": True,
    "other_conditions": "uncontrolled diabetes, hypertension",
    "symptoms_notes": "uncontrolled diabetes, hypertension, fever, tachycardia, low oxygen, shortness of breath and chest discomfort."
}

print("\n1. FRONTEND PAYLOAD (sent to FastAPI /simple-predict):")
print(json.dumps(frontend_payload_b, indent=2))

inp_b = SimplePredictionInput(**frontend_payload_b)
print("\n2. BACKEND RECEIVED PAYLOAD (parsed Pydantic model):")
print(json.dumps(inp_b.model_dump(), indent=2))

# Call simple_predict
result_b = simple_predict(inp_b, current_user=user_context)

print("\n3. PROCESSED MODEL INPUT (derived feature vector):")
print(json.dumps(result_b["features_used"], indent=2))

print("\n4. RAW MODEL PROBABILITIES & PREDICTIONS:")
print(f"   Model 1 (Risk) Probability        : {result_b['model1_probability']:.4f} ({result_b['model1_probability']*100:.2f}%)")
print(f"   Model 1 Prediction                : {result_b['model1_prediction']}")
print(f"   Model 2 (Readmission) Probability : {result_b['model2_probability']:.4f} ({result_b['model2_probability']*100:.2f}%)")
print(f"   Model 2 Prediction                : {result_b['model2_prediction']}")
print(f"   Combined Readmission Risk Score   : {result_b['readmission_risk_score']:.4f} ({result_b['readmission_risk_score']*100:.2f}%)")

print("\n5. FINAL RISK CLASSIFICATION:")
print(f"   Risk Level              : {result_b['risk_level']}")
print(f"   Clinical Interpretation : {result_b['clinical_interpretation']}")
print("================================================================================\n")
