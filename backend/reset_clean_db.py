"""
Reset database and seed clean, original clinical dataset for HealthForecast AI.
Purges temporary/dummy test records and initializes official system users and clinical patients.
"""
import sys
import os
from datetime import datetime, date, timedelta
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import engine, Base, SessionLocal
from app.models import user, role, patient, medical_history, admission, treatment, risk_prediction, audit_log
from app.core.security import get_password_hash
from app.services.prediction_service import ClinicalRiskEngine
from app.schemas.prediction import PredictionRequest


def reset_and_seed_original_data():
    print("Purging existing database records...")
    db = SessionLocal()
    try:
        db.query(risk_prediction.PatientRiskPrediction).delete()
        db.query(treatment.Treatment).delete()
        db.query(admission.Admission).delete()
        db.query(medical_history.MedicalHistory).delete()
        db.query(patient.Patient).delete()
        db.query(audit_log.AuditLog).delete()
        db.query(user.User).delete()
        db.query(role.Role).delete()
        db.commit()
        print("All old dummy/test records purged successfully.")

        # 1. Create Roles
        print("Seeding official system roles...")
        roles_seed = [
            {'name': 'System Administrator', 'description': 'Full system access including user and role management'},
            {'name': 'Doctor', 'description': 'Access to patient records, medical history, and risk reports'},
            {'name': 'Hospital Administrator', 'description': 'Access to hospital dashboards, analytics, and reports'},
            {'name': 'Healthcare Researcher', 'description': 'Access to anonymized datasets and research reports'}
        ]
        role_map = {}
        for r_data in roles_seed:
            r_obj = role.Role(**r_data)
            db.add(r_obj)
            db.commit()
            db.refresh(r_obj)
            role_map[r_obj.name] = r_obj.id

        # 2. Create System Users
        print("Seeding official system users...")
        pwd = get_password_hash("Admin@123")
        users_seed = [
            ("admin@healthforecast.ai", "admin", "System Administrator", "System Administrator"),
            ("doctor@healthforecast.ai", "doctor", "Dr. Sarah Johnson", "Doctor"),
            ("hospital_admin@healthforecast.ai", "hospital_admin", "Michael Chen", "Hospital Administrator"),
            ("researcher@healthforecast.ai", "researcher", "Dr. Emily Davis", "Healthcare Researcher"),
        ]
        for email, uname, fname, rname in users_seed:
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
        print("Official system users created.")

        # 3. Seed Original Clinical Patients (PAT001 - PAT008)
        print("Seeding original clinical patients, medical history, admissions, treatments & ML risk predictions...")
        sample_patients = [
            ("PAT001", "John", "Smith", date(1958, 4, 12), "Male", "555-0101", "john.smith@email.com", "Chicago", "IL", 68, 7, ">8", 2, 3, "Type 2 Diabetes Mellitus with Hyperglycemia", "Insulin Glargine 20 Units SubQ daily", "Medication", "20 Units", "Daily"),
            ("PAT002", "Mary", "Johnson", date(1964, 8, 22), "Female", "555-0201", "mary.j@email.com", "Springfield", "IL", 62, 4, ">7", 0, 1, "Hypertension & Stage 2 Chronic Kidney Disease", "Lisinopril 10mg Tablets", "Medication", "10mg", "Once daily"),
            ("PAT003", "Robert", "Williams", date(1951, 11, 30), "Male", "555-0301", "robert.w@email.com", "Peoria", "IL", 75, 11, ">8", 3, 4, "Congestive Heart Failure & Uncontrolled Diabetes", "Furosemide 40mg IV", "Medication", "40mg", "Twice daily"),
            ("PAT004", "Patricia", "Brown", date(1972, 2, 14), "Female", "555-0401", "patty.b@email.com", "Rockford", "IL", 54, 3, "Norm", 0, 0, "Acute Asthma Exacerbation", "Fluticasone Inhaler 110mcg", "Inhaler", "110mcg", "Twice daily"),
            ("PAT005", "Michael", "Jones", date(1949, 9, 5), "Male", "555-0501", "michael.j@email.com", "Naperville", "IL", 77, 9, ">8", 4, 2, "COPD Exacerbation & Recurrent Pneumonia", "Spiriva HandiHaler 18mcg", "Inhaler", "18mcg", "Once daily"),
            ("PAT006", "Jennifer", "Garcia", date(1968, 6, 18), "Female", "555-0601", "jennifer.g@email.com", "Evanston", "IL", 58, 5, ">7", 1, 1, "Diabetic Ketoacidosis & Peripheral Neuropathy", "Regular Insulin IV Drip", "Infusion", "0.1 U/kg/hr", "Continuous"),
            ("PAT007", "David", "Miller", date(1982, 1, 25), "Male", "555-0701", "david.m@email.com", "Aurora", "IL", 44, 2, "Norm", 0, 0, "Mild Hyperlipidemia", "Atorvastatin 20mg", "Medication", "20mg", "Once daily at bedtime"),
            ("PAT008", "Elizabeth", "Davis", date(1955, 12, 10), "Female", "555-0801", "elizabeth.d@email.com", "Decatur", "IL", 71, 8, ">8", 2, 3, "Acute Coronary Syndrome & Type 2 Diabetes", "Clopidogrel 75mg Tablets", "Medication", "75mg", "Once daily")
        ]

        engine_risk = ClinicalRiskEngine(db)

        for pid, fname, lname, dob, gender, phone, email, city, state, age, stay, a1c, inpat, emerg, condition, trt_name, trt_type, dosage, freq in sample_patients:
            # Patient
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
                emergency_contact_name="Family Contact",
                emergency_contact_phone="555-0999",
                is_active=True
            )
            db.add(p_obj)
            db.commit()
            db.refresh(p_obj)

            # Medical History
            mh = medical_history.MedicalHistory(
                patient_id=p_obj.id,
                condition=condition,
                diagnosis_date=datetime(2022, 1, 15),
                status="Active",
                notes=f"HbA1c level: {a1c}, Active clinical management"
            )
            db.add(mh)

            # Admission
            adm_num = f"ADM_{pid}"
            adm_obj = admission.Admission(
                patient_id=p_obj.id,
                admission_number=adm_num,
                admission_date=date.today() - timedelta(days=stay + 2),
                discharge_date=date.today() - timedelta(days=2),
                admission_type="Emergency" if emerg > 0 else "Elective",
                department="Endocrinology & Internal Medicine",
                room_number=f"Room {100 + p_obj.id}",
                attending_physician="Dr. Sarah Johnson",
                diagnosis=condition,
                discharge_diagnosis="Stabilized on updated regimen",
                length_of_stay=stay,
                readmission_flag="Yes" if inpat > 0 else "No",
                readmission_reason="Uncontrolled symptoms spike" if inpat > 0 else None
            )
            db.add(adm_obj)
            db.commit()
            db.refresh(adm_obj)

            # Treatment
            trt = treatment.Treatment(
                patient_id=p_obj.id,
                admission_id=adm_obj.id,
                treatment_name=trt_name,
                treatment_type=trt_type,
                start_date=datetime.now() - timedelta(days=stay),
                end_date=datetime.now() + timedelta(days=14),
                dosage=dosage,
                frequency=freq,
                prescribed_by="Dr. Sarah Johnson",
                notes="Patient prescribed per clinical protocol.",
                outcome="Improving"
            )
            db.add(trt)

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

            pred_obj = risk_prediction.PatientRiskPrediction(
                patient_id=p_obj.id,
                admission_id=adm_obj.id,
                risk_score=risk_res["risk_score"],
                risk_level=risk_res["risk_level"],
                readmission_probability=risk_res["readmission_probability"],
                model_name=risk_res["model_name"],
                risk_factors=json.dumps(risk_res["risk_factors"]),
                clinical_recommendations=json.dumps(risk_res["clinical_recommendations"])
            )
            db.add(pred_obj)

        db.commit()
        print("Database successfully reset and seeded with original clinical details!")

    except Exception as e:
        db.rollback()
        print(f"Error resetting database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset_and_seed_original_data()
