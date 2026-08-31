import os
import sys
from datetime import datetime, timedelta

# Adjust path to import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import (
    users_collection,
    patients_collection,
    medical_histories_collection,
    predictions_collection,
    treatments_collection,
    init_db
)
from app.utils.security import get_password_hash
from app.ai.predictor import predictor_instance

def seed():
    print("Initializing Database connection and warming model...")
    init_db()
    predictor_instance.load_model()
    
    print("Clearing existing collections...")
    # Only clear users — preserve patients, histories, predictions, treatments
    users_collection.delete_many({})
    
    print("Seeding Users...")
    users = [
        {
            "email": "doctor@hospital.com",
            "full_name": "Dr. Sarah Connor",
            "role": "Doctor",
            "hospital": "General Hospital",
            "hashed_password": get_password_hash("Password123"),
            "created_at": datetime.utcnow(),
            "is_active": True
        },
        {
            "email": "admin@hospital.com",
            "full_name": "Admin Officer John Connor",
            "role": "Hospital Administrator",
            "hospital": "General Hospital",
            "hashed_password": get_password_hash("Password123"),
            "created_at": datetime.utcnow(),
            "is_active": True
        },
        {
            "email": "researcher@hospital.com",
            "full_name": "Dr. Miles Dyson",
            "role": "Healthcare Researcher",
            "hospital": "Cyberdyne Lab",
            "hashed_password": get_password_hash("Password123"),
            "created_at": datetime.utcnow(),
            "is_active": True
        },
        {
            "email": "sysadmin@hospital.com",
            "full_name": "System Administrator",
            "role": "System Administrator",
            "hospital": "IT Headquarters",
            "hashed_password": get_password_hash("Password123"),
            "created_at": datetime.utcnow(),
            "is_active": True
        }
    ]
    users_collection.insert_many(users)
    
    print("Seeding Patients...")
    patients = [
        {
            "patient_id": "PAT-10001",
            "first_name": "John",
            "last_name": "Doe",
            "date_of_birth": "1980-05-15",
            "gender": "Male",
            "email": "johndoe@email.com",
            "phone": "+1-555-0199",
            "hospital": "General Hospital",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "patient_id": "PAT-10002",
            "first_name": "Jane",
            "last_name": "Smith",
            "date_of_birth": "1975-10-22",
            "gender": "Female",
            "email": "janesmith@email.com",
            "phone": "+1-555-0244",
            "hospital": "General Hospital",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "patient_id": "PAT-10003",
            "first_name": "Bob",
            "last_name": "Johnson",
            "date_of_birth": "1962-03-08",
            "gender": "Male",
            "email": "bjohnson@email.com",
            "phone": "+1-555-0377",
            "hospital": "City Clinic",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "patient_id": "PAT-10004",
            "first_name": "Riya",
            "last_name": "M",
            "date_of_birth": "1992-07-12",
            "gender": "Female",
            "email": "riyam@email.com",
            "phone": "+1-555-0488",
            "hospital": "General Hospital",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    for p in patients:
        if not patients_collection.find_one({"patient_id": p["patient_id"]}):
            patients_collection.insert_one(p)
    
    print("Seeding Medical Histories...")
    histories = [
        {
            "patient_id": "PAT-10001",
            "admission_date": datetime.utcnow() - timedelta(days=30),
            "discharge_date": datetime.utcnow() - timedelta(days=23),
            "primary_diagnosis": "Type 2 Diabetes Mellitus",
            "comorbidities": ["Hypertension"],
            "length_of_stay": 7,
            "num_previous_admissions": 1,
            "num_medications": 5,
            "systolic_bp": 130,
            "diastolic_bp": 85,
            "blood_sugar": 140.0,
            "notes": "Admitted for glycemic control setup.",
            "created_at": datetime.utcnow()
        },
        {
            "patient_id": "PAT-10002",
            "admission_date": datetime.utcnow() - timedelta(days=60),
            "discharge_date": datetime.utcnow() - timedelta(days=58),
            "primary_diagnosis": "Acute Appendicitis",
            "comorbidities": [],
            "length_of_stay": 2,
            "num_previous_admissions": 0,
            "num_medications": 2,
            "systolic_bp": 115,
            "diastolic_bp": 75,
            "blood_sugar": 98.0,
            "notes": "Routine appendectomy. Patient recovered fully.",
            "created_at": datetime.utcnow()
        },
        {
            "patient_id": "PAT-10003",
            "admission_date": datetime.utcnow() - timedelta(days=15),
            "discharge_date": datetime.utcnow() - timedelta(days=3),
            "primary_diagnosis": "Congestive Heart Failure",
            "comorbidities": ["Chronic Kidney Disease", "Hypertension", "Atrial Fibrillation"],
            "length_of_stay": 12,
            "num_previous_admissions": 3,
            "num_medications": 14,
            "systolic_bp": 155,
            "diastolic_bp": 92,
            "blood_sugar": 180.0,
            "notes": "Severe exacerbation of heart failure. High diuretic dose needed.",
            "created_at": datetime.utcnow()
        },
        {
            "patient_id": "PAT-10004",
            "admission_date": datetime.utcnow() - timedelta(days=10),
            "discharge_date": datetime.utcnow() - timedelta(days=5),
            "primary_diagnosis": "Essential Hypertension",
            "comorbidities": ["Migraine"],
            "length_of_stay": 5,
            "num_previous_admissions": 0,
            "num_medications": 3,
            "systolic_bp": 145,
            "diastolic_bp": 90,
            "blood_sugar": 110.0,
            "notes": "Hypertension monitoring and medication titration.",
            "created_at": datetime.utcnow()
        }
    ]
    for h in histories:
        if not medical_histories_collection.find_one({"patient_id": h["patient_id"]}):
            medical_histories_collection.insert_one(h)
    
    print("Generating AI Predictions...")
    pred_inputs = [
        {
            "patient_id": "PAT-10001",
            "age": 46,
            "gender": "Male",
            "length_of_stay": 7,
            "num_previous_admissions": 1,
            "num_medications": 5,
            "systolic_bp": 130,
            "diastolic_bp": 85,
            "blood_sugar": 140.0,
            "comorbidity_count": 1
        },
        {
            "patient_id": "PAT-10002",
            "age": 51,
            "gender": "Female",
            "length_of_stay": 2,
            "num_previous_admissions": 0,
            "num_medications": 2,
            "systolic_bp": 115,
            "diastolic_bp": 75,
            "blood_sugar": 98.0,
            "comorbidity_count": 0
        },
        {
            "patient_id": "PAT-10003",
            "age": 64,
            "gender": "Male",
            "length_of_stay": 12,
            "num_previous_admissions": 3,
            "num_medications": 14,
            "systolic_bp": 155,
            "diastolic_bp": 92,
            "blood_sugar": 180.0,
            "comorbidity_count": 3
        },
        {
            "patient_id": "PAT-10004",
            "age": 34,
            "gender": "Female",
            "length_of_stay": 5,
            "num_previous_admissions": 0,
            "num_medications": 3,
            "systolic_bp": 145,
            "diastolic_bp": 90,
            "blood_sugar": 110.0,
            "comorbidity_count": 1
        }
    ]
    
    predictions = []
    for pi in pred_inputs:
        if not predictions_collection.find_one({"patient_id": pi["patient_id"]}):
            result = predictor_instance.predict(pi)
            predictions.append({
                "patient_id": pi["patient_id"],
                "readmission_risk_score": result["readmission_risk_score"],
                "risk_level": result["risk_level"],
                "prediction_date": datetime.utcnow(),
                "predicted_by": "doctor@hospital.com",
                "features_used": pi,
                "notes": f"Initial seeding run. Risk assessed as {result['risk_level']}."
            })
    if predictions:
        predictions_collection.insert_many(predictions)
    
    print("Seeding Treatments...")
    treatments = [
        {
            "patient_id": "PAT-10001",
            "doctor_id": "doctor@hospital.com",
            "treatment_plan": "Glycemic control and monitoring",
            "medications": [
                {"name": "Metformin", "dosage": "500mg", "frequency": "twice daily"},
                {"name": "Lisinopril", "dosage": "5mg", "frequency": "once daily"}
            ],
            "start_date": datetime.utcnow() - timedelta(days=23),
            "end_date": datetime.utcnow() + timedelta(days=90),
            "follow_up_date": datetime.utcnow() + timedelta(days=14),
            "status": "Active",
            "recovery_percentage": 20,
            "created_at": datetime.utcnow()
        },
        {
            "patient_id": "PAT-10002",
            "doctor_id": "doctor@hospital.com",
            "treatment_plan": "Post-appendectomy wound care",
            "medications": [
                {"name": "Ibuprofen", "dosage": "400mg", "frequency": "as needed for pain"}
            ],
            "start_date": datetime.utcnow() - timedelta(days=58),
            "end_date": datetime.utcnow() - timedelta(days=51),
            "follow_up_date": datetime.utcnow() - timedelta(days=51),
            "status": "Completed",
            "recovery_percentage": 100,
            "created_at": datetime.utcnow()
        },
        {
            "patient_id": "PAT-10003",
            "doctor_id": "doctor@hospital.com",
            "treatment_plan": "Diuretic therapy and BP maintenance",
            "medications": [
                {"name": "Furosemide", "dosage": "40mg", "frequency": "once daily"},
                {"name": "Carvedilol", "dosage": "6.25mg", "frequency": "twice daily"},
                {"name": "Spironolactone", "dosage": "25mg", "frequency": "once daily"}
            ],
            "start_date": datetime.utcnow() - timedelta(days=3),
            "end_date": datetime.utcnow() + timedelta(days=180),
            "follow_up_date": datetime.utcnow() + timedelta(days=7),
            "status": "Active",
            "recovery_percentage": 65,
            "created_at": datetime.utcnow()
        },
        {
            "patient_id": "PAT-10004",
            "doctor_id": "doctor@hospital.com",
            "treatment_plan": "Close monitoring with scheduled follow-ups and medication review.",
            "medications": [
                {"name": "Amlodipine", "dosage": "5mg", "frequency": "once daily"}
            ],
            "start_date": datetime.utcnow() - timedelta(days=10),
            "end_date": datetime.utcnow() + timedelta(days=50),
            "follow_up_date": datetime.utcnow() + timedelta(days=14),
            "status": "Active",
            "recovery_percentage": 35,
            "created_at": datetime.utcnow()
        }
    ]
    for t in treatments:
        if not treatments_collection.find_one({"patient_id": t["patient_id"], "treatment_plan": t["treatment_plan"]}):
            treatments_collection.insert_one(t)
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed()
