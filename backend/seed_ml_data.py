"""
Seed dataset script to initialize realistic patient data and risk predictions for HealthForecast AI demonstration.
"""
import sys
import os
from datetime import datetime, date, timedelta
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, SessionLocal
from app.models import user, role, patient, medical_history, admission, treatment, risk_prediction
from app.core.security import get_password_hash
from app.services.prediction_service import ClinicalRiskEngine
from app.schemas.prediction import PredictionRequest


def seed_ml_environment():
    print("Initializing Database & Tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Checking existing data...")
        # 1. Ensure Roles exist
        role_names = ['System Administrator', 'Doctor', 'Hospital Administrator', 'Healthcare Researcher']
        role_map = {}
        for r_name in role_names:
            r_obj = db.query(role.Role).filter(role.Role.name == r_name).first()
            if not r_obj:
                r_obj = role.Role(name=r_name, description=f"{r_name} role")
                db.add(r_obj)
                db.commit()
                db.refresh(r_obj)
            role_map[r_name] = r_obj.id

        # 2. Ensure Default Users exist
        pwd = get_password_hash("Admin@123")
        users_seed = [
            ("admin@healthforecast.ai", "admin", "System Administrator", "System Administrator"),
            ("doctor@healthforecast.ai", "doctor", "Dr. Sarah Johnson", "Doctor"),
            ("hospital_admin@healthforecast.ai", "hospital_admin", "Michael Chen", "Hospital Administrator"),
            ("researcher@healthforecast.ai", "researcher", "Dr. Emily Davis", "Healthcare Researcher"),
        ]
        for email, uname, fname, rname in users_seed:
            if not db.query(user.User).filter(user.User.email == email).first():
                u_obj = user.User(
                    email=email,
                    username=uname,
                    full_name=fname,
                    hashed_password=pwd,
                    role_id=role_map[rname],
                    is_active=True
                )
                db.add(u_obj)
        db.commit()

        # 3. Seed Sample Clinical Patients (if less than 10)
        patient_count = db.query(patient.Patient).count()
        if patient_count < 8:
            print("Seeding sample clinical patients...")
            sample_patients = [
                ("PAT001", "John", "Smith", date(1958, 4, 12), "Male", "555-0101", "john.smith@email.com", "Chicago", "IL", 68, 7, ">8", 2, 3),
                ("PAT002", "Mary", "Johnson", date(1964, 8, 22), "Female", "555-0201", "mary.j@email.com", "Springfield", "IL", 62, 4, ">7", 0, 1),
                ("PAT003", "Robert", "Williams", date(1951, 11, 30), "Male", "555-0301", "robert.w@email.com", "Peoria", "IL", 75, 11, ">8", 3, 4),
                ("PAT004", "Patricia", "Brown", date(1972, 2, 14), "Female", "555-0401", "patty.b@email.com", "Rockford", "IL", 54, 3, "Norm", 0, 0),
                ("PAT005", "Michael", "Jones", date(1949, 9, 5), "Male", "555-0501", "michael.j@email.com", "Naperville", "IL", 77, 9, ">8", 4, 2),
                ("PAT006", "Jennifer", "Garcia", date(1968, 6, 18), "Female", "555-0601", "jennifer.g@email.com", "Evanston", "IL", 58, 5, ">7", 1, 1),
                ("PAT007", "David", "Miller", date(1982, 1, 25), "Male", "555-0701", "david.m@email.com", "Aurora", "IL", 44, 2, "Norm", 0, 0),
                ("PAT008", "Elizabeth", "Davis", date(1955, 12, 10), "Female", "555-0801", "elizabeth.d@email.com", "Decatur", "IL", 71, 8, ">8", 2, 3)
            ]

            engine_risk = ClinicalRiskEngine(db)

            for pid, fname, lname, dob, gender, phone, email, city, state, age, stay, a1c, inpat, emerg in sample_patients:
                p_obj = db.query(patient.Patient).filter(patient.Patient.patient_id == pid).first()
                if not p_obj:
                    p_obj = patient.Patient(
                        patient_id=pid,
                        first_name=fname,
                        last_name=lname,
                        date_of_birth=dob,
                        gender=gender,
                        phone=phone,
                        email=email,
                        address="100 Hospital Way",
                        city=city,
                        state=state,
                        zip_code="60000",
                        is_active=True
                    )
                    db.add(p_obj)
                    db.commit()
                    db.refresh(p_obj)

                # Add Medical History
                if db.query(medical_history.MedicalHistory).filter(medical_history.MedicalHistory.patient_id == p_obj.id).count() == 0:
                    mh = medical_history.MedicalHistory(
                        patient_id=p_obj.id,
                        condition="Type 2 Diabetes Mellitus",
                        diagnosis_date=datetime(2021, 3, 15),
                        status="Active",
                        notes=f"HbA1c level: {a1c}, Insulin therapy"
                    )
                    db.add(mh)

                # Add Admission
                adm_num = f"ADM_{pid}"
                adm_obj = db.query(admission.Admission).filter(admission.Admission.admission_number == adm_num).first()
                if not adm_obj:
                    adm_obj = admission.Admission(
                        patient_id=p_obj.id,
                        admission_number=adm_num,
                        admission_date=date.today() - timedelta(days=stay + 2),
                        discharge_date=date.today() - timedelta(days=2),
                        admission_type="Emergency" if emerg > 0 else "Elective",
                        department="Endocrinology & Internal Medicine",
                        room_number=f"Room {100 + p_obj.id}",
                        attending_physician="Dr. Sarah Johnson",
                        diagnosis="Diabetes Mellitus with Hyperglycemia",
                        discharge_diagnosis="Stabilized on updated regimen",
                        length_of_stay=stay,
                        readmission_flag="Yes" if inpat > 0 else "No",
                        readmission_reason="Uncontrolled glucose spike" if inpat > 0 else None
                    )
                    db.add(adm_obj)
                    db.commit()
                    db.refresh(adm_obj)

                # Calculate & Store ML Risk Prediction
                req = PredictionRequest(
                    patient_id=p_obj.id,
                    age=age,
                    time_in_hospital=stay,
                    num_lab_procedures=55,
                    num_procedures=2,
                    num_medications=14,
                    number_inpatient=inpat,
                    number_emergency=emerg,
                    a1c_result=a1c
                )
                risk_res = engine_risk.calculate_risk(req)

                existing_pred = db.query(risk_prediction.PatientRiskPrediction).filter(
                    risk_prediction.PatientRiskPrediction.patient_id == p_obj.id
                ).first()
                if not existing_pred:
                    pred_obj = risk_prediction.PatientRiskPrediction(
                        patient_id=p_obj.id,
                        admission_id=adm_obj.id if adm_obj else None,
                        risk_score=risk_res["risk_score"],
                        risk_level=risk_res["risk_level"],
                        readmission_probability=risk_res["readmission_probability"],
                        model_name=risk_res["model_name"],
                        risk_factors=json.dumps(risk_res["risk_factors"]),
                        clinical_recommendations=json.dumps(risk_res["clinical_recommendations"])
                    )
                    db.add(pred_obj)

            db.commit()
            print("Patients, admissions, and ML predictions seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding ML environment: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_ml_environment()
