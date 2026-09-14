import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.admission import Admission
from app.models.medication import Medication
from app.utils.security import get_password_hash

def seed_database(force: bool = False):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if users already exist
        if not force and db.query(User).count() > 0:
            print("Database already seeded.")
            return

        if force:
            print("Clearing existing records for fresh reseed...")
            db.query(Medication).delete()
            db.query(Admission).delete()
            db.query(Patient).delete()
            db.query(User).delete()
            db.commit()


        print("Seeding demo users (2 per role)...")
        demo_users_data = [
            # Doctor 1 & 2
            {
                "email": "doctor1@healthforecast.ai",
                "full_name": "Dr. Sarah Jenkins",
                "role": UserRole.DOCTOR.value,
                "department": "Cardiology",
                "hospital_name": "City General Hospital"
            },
            {
                "email": "doctor2@healthforecast.ai",
                "full_name": "Dr. Marcus Vance",
                "role": UserRole.DOCTOR.value,
                "department": "Endocrinology",
                "hospital_name": "St. Jude Medical Center"
            },
            # Hospital Admin 1 & 2
            {
                "email": "admin1@healthforecast.ai",
                "full_name": "Elena Rostova",
                "role": UserRole.HOSPITAL_ADMIN.value,
                "department": "Hospital Operations",
                "hospital_name": "City General Hospital"
            },
            {
                "email": "admin2@healthforecast.ai",
                "full_name": "Robert Chen",
                "role": UserRole.HOSPITAL_ADMIN.value,
                "department": "Clinical Quality",
                "hospital_name": "St. Jude Medical Center"
            },
            # Healthcare Researcher 1 & 2
            {
                "email": "researcher1@healthforecast.ai",
                "full_name": "Dr. Aris Thorne",
                "role": UserRole.RESEARCHER.value,
                "department": "Population Health Research",
                "hospital_name": "Health Analytics Institute"
            },
            {
                "email": "researcher2@healthforecast.ai",
                "full_name": "Maya Lin",
                "role": UserRole.RESEARCHER.value,
                "department": "Clinical Outcomes Unit",
                "hospital_name": "Health Analytics Institute"
            },
            # System Admin 1 & 2
            {
                "email": "sysadmin1@healthforecast.ai",
                "full_name": "Alex Vance",
                "role": UserRole.SYSTEM_ADMIN.value,
                "department": "IT System Security",
                "hospital_name": "HealthForecast Cloud Services"
            },
            {
                "email": "sysadmin2@healthforecast.ai",
                "full_name": "David Miller",
                "role": UserRole.SYSTEM_ADMIN.value,
                "department": "Infrastructure & DevSecOps",
                "hospital_name": "HealthForecast Cloud Services"
            }
        ]

        created_doctors = []
        common_password = get_password_hash("Password123!")

        for u_data in demo_users_data:
            user = User(
                email=u_data["email"],
                full_name=u_data["full_name"],
                hashed_password=common_password,
                role=u_data["role"],
                department=u_data["department"],
                hospital_name=u_data["hospital_name"],
                is_active=True
            )
            db.add(user)
            db.flush()
            if u_data["role"] == UserRole.DOCTOR.value:
                created_doctors.append(user.id)

        db.commit()
        print(f"Seeded {len(demo_users_data)} users successfully.")

        # Seed sample Diabetes 130-US Hospitals patients across all Clinical Risk Strata
        print("Seeding diverse multi-risk patient records...")
        races = ["Caucasian", "AfricanAmerican", "Hispanic", "Asian", "Other"]
        specialties = ["InternalMedicine", "Cardiology", "Family/GeneralPractice", "Endocrinology", "Emergency/Trauma", "Nephrology", "Pulmonology"]

        # 36 Diverse Clinical Patients with authentic demographics and risk profiles
        sample_patients_pool = [
            # --- HIGH RISK COHORT (Critical Readmission Risk, Frequent Utilization, Complex Multimorbidity) ---
            {
                "first_name": "Eleanor", "last_name": "Vance", "age": "[70-80)", "gender": "Female", "race": "Caucasian",
                "pnbr": 84521901, "tier": "High", "weight": "[75-100kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Up"}, {"medication_name": "Metformin", "dosage_status": "Steady"}, {"medication_name": "Pioglitazone", "dosage_status": "Steady"}],
                    "a1c": ">8", "glu": ">300", "num_inpatient": 3, "num_emergency": 2, "num_meds": 22, "time_in_hosp": 9,
                    "diag_1": "428.00", "diag_2": "250.00", "diag_3": "585.90", "change": "Ch", "specialty": "Cardiology"
                }
            },
            {
                "first_name": "Marcus", "last_name": "Holloway", "age": "[80-90)", "gender": "Male", "race": "AfricanAmerican",
                "pnbr": 98310452, "tier": "High", "weight": "[75-100kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Up"}, {"medication_name": "Glimepiride", "dosage_status": "Steady"}],
                    "a1c": ">8", "glu": ">300", "num_inpatient": 4, "num_emergency": 3, "num_meds": 24, "time_in_hosp": 11,
                    "diag_1": "410.71", "diag_2": "428.00", "diag_3": "250.40", "change": "Ch", "specialty": "Cardiology"
                }
            },
            {
                "first_name": "Sofia", "last_name": "Rodriguez", "age": "[60-70)", "gender": "Female", "race": "Hispanic",
                "pnbr": 45210982, "tier": "High", "weight": "[50-75kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Up"}, {"medication_name": "Metformin", "dosage_status": "Down"}],
                    "a1c": ">8", "glu": ">200", "num_inpatient": 2, "num_emergency": 2, "num_meds": 19, "time_in_hosp": 8,
                    "diag_1": "250.13", "diag_2": "585.90", "diag_3": "401.90", "change": "Ch", "specialty": "Nephrology"
                }
            },
            {
                "first_name": "Arthur", "last_name": "Pendelton", "age": "[70-80)", "gender": "Male", "race": "Caucasian",
                "pnbr": 77310928, "tier": "High", "weight": "[100-125kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Steady"}, {"medication_name": "Glipizide", "dosage_status": "Up"}, {"medication_name": "Pioglitazone", "dosage_status": "Steady"}],
                    "a1c": ">8", "glu": ">300", "num_inpatient": 3, "num_emergency": 1, "num_meds": 21, "time_in_hosp": 10,
                    "diag_1": "428.00", "diag_2": "496.00", "diag_3": "250.00", "change": "Ch", "specialty": "Pulmonology"
                }
            },
            {
                "first_name": "Beatrice", "last_name": "Washington", "age": "[80-90)", "gender": "Female", "race": "AfricanAmerican",
                "pnbr": 55201938, "tier": "High", "weight": "[50-75kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Up"}, {"medication_name": "Glyburide", "dosage_status": "Steady"}],
                    "a1c": ">8", "glu": ">200", "num_inpatient": 3, "num_emergency": 2, "num_meds": 23, "time_in_hosp": 9,
                    "diag_1": "585.6", "diag_2": "428.00", "diag_3": "250.41", "change": "Ch", "specialty": "Nephrology"
                }
            },
            {
                "first_name": "Chen", "last_name": "Wei", "age": "[70-80)", "gender": "Male", "race": "Asian",
                "pnbr": 88301924, "tier": "High", "weight": "[50-75kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Up"}, {"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": ">8", "glu": ">300", "num_inpatient": 2, "num_emergency": 2, "num_meds": 18, "time_in_hosp": 8,
                    "diag_1": "414.01", "diag_2": "428.00", "diag_3": "250.00", "change": "Ch", "specialty": "Cardiology"
                }
            },
            {
                "first_name": "Josephine", "last_name": "Alvarez", "age": "[60-70)", "gender": "Female", "race": "Hispanic",
                "pnbr": 33102948, "tier": "High", "weight": "[75-100kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Up"}, {"medication_name": "Rosiglitazone", "dosage_status": "Steady"}],
                    "a1c": ">8", "glu": ">300", "num_inpatient": 3, "num_emergency": 1, "num_meds": 20, "time_in_hosp": 9,
                    "diag_1": "428.00", "diag_2": "250.60", "diag_3": "401.90", "change": "Ch", "specialty": "InternalMedicine"
                }
            },
            {
                "first_name": "Harold", "last_name": "Goldstein", "age": "[80-90)", "gender": "Male", "race": "Caucasian",
                "pnbr": 11029384, "tier": "High", "weight": "[75-100kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Up"}, {"medication_name": "Metformin", "dosage_status": "Steady"}, {"medication_name": "Glipizide", "dosage_status": "Steady"}],
                    "a1c": ">8", "glu": ">300", "num_inpatient": 4, "num_emergency": 2, "num_meds": 25, "time_in_hosp": 12,
                    "diag_1": "410.11", "diag_2": "428.00", "diag_3": "585.90", "change": "Ch", "specialty": "Emergency/Trauma"
                }
            },
            {
                "first_name": "Gloria", "last_name": "Jenkins", "age": "[70-80)", "gender": "Female", "race": "AfricanAmerican",
                "pnbr": 77401938, "tier": "High", "weight": "[75-100kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Up"}, {"medication_name": "Pioglitazone", "dosage_status": "Steady"}],
                    "a1c": ">8", "glu": ">300", "num_inpatient": 3, "num_emergency": 3, "num_meds": 22, "time_in_hosp": 10,
                    "diag_1": "428.00", "diag_2": "250.70", "diag_3": "443.90", "change": "Ch", "specialty": "Endocrinology"
                }
            },
            {
                "first_name": "Dmitri", "last_name": "Volkov", "age": "[70-80)", "gender": "Male", "race": "Other",
                "pnbr": 11701938, "tier": "High", "weight": "[75-100kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Up"}, {"medication_name": "Glimepiride", "dosage_status": "Steady"}],
                    "a1c": ">8", "glu": ">300", "num_inpatient": 2, "num_emergency": 2, "num_meds": 20, "time_in_hosp": 8,
                    "diag_1": "414.01", "diag_2": "250.40", "diag_3": "585.90", "change": "Ch", "specialty": "Cardiology"
                }
            },
            {
                "first_name": "Evelyn", "last_name": "Carter", "age": "[80-90)", "gender": "Female", "race": "Caucasian",
                "pnbr": 33901938, "tier": "High", "weight": "[50-75kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Up"}, {"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": ">8", "glu": ">200", "num_inpatient": 3, "num_emergency": 1, "num_meds": 21, "time_in_hosp": 9,
                    "diag_1": "428.00", "diag_2": "486.00", "diag_3": "250.00", "change": "Ch", "specialty": "InternalMedicine"
                }
            },
            {
                "first_name": "Raymond", "last_name": "Brooks", "age": "[70-80)", "gender": "Male", "race": "AfricanAmerican",
                "pnbr": 55123948, "tier": "High", "weight": "[75-100kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Up"}, {"medication_name": "Glyburide", "dosage_status": "Steady"}, {"medication_name": "Pioglitazone", "dosage_status": "Steady"}],
                    "a1c": ">8", "glu": ">300", "num_inpatient": 4, "num_emergency": 2, "num_meds": 26, "time_in_hosp": 11,
                    "diag_1": "410.91", "diag_2": "428.00", "diag_3": "250.00", "change": "Ch", "specialty": "Cardiology"
                }
            },

            # --- MEDIUM / MODERATE RISK COHORT (Elevated Risk, Suboptimal Glycemia, Dual Regimens) ---
            {
                "first_name": "Patricia", "last_name": "Smith", "age": "[50-60)", "gender": "Female", "race": "Caucasian",
                "pnbr": 12049831, "tier": "Medium", "weight": "[75-100kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Metformin", "dosage_status": "Up"}, {"medication_name": "Glipizide", "dosage_status": "Steady"}],
                    "a1c": ">7", "glu": ">200", "num_inpatient": 1, "num_emergency": 1, "num_meds": 14, "time_in_hosp": 5,
                    "diag_1": "414.01", "diag_2": "250.00", "diag_3": "401.90", "change": "Ch", "specialty": "InternalMedicine"
                }
            },
            {
                "first_name": "Linda", "last_name": "Taylor", "age": "[60-70)", "gender": "Female", "race": "AfricanAmerican",
                "pnbr": 34910283, "tier": "Medium", "weight": "[75-100kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Steady"}, {"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": ">7", "glu": "Norm", "num_inpatient": 1, "num_emergency": 0, "num_meds": 13, "time_in_hosp": 5,
                    "diag_1": "401.90", "diag_2": "250.00", "diag_3": "272.40", "change": "No", "specialty": "Family/GeneralPractice"
                }
            },
            {
                "first_name": "Elizabeth", "last_name": "White", "age": "[60-70)", "gender": "Female", "race": "Caucasian",
                "pnbr": 44102938, "tier": "Medium", "weight": "[50-75kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Metformin", "dosage_status": "Steady"}, {"medication_name": "Pioglitazone", "dosage_status": "Up"}],
                    "a1c": ">7", "glu": ">200", "num_inpatient": 1, "num_emergency": 1, "num_meds": 15, "time_in_hosp": 6,
                    "diag_1": "414.01", "diag_2": "250.00", "diag_3": "272.40", "change": "Ch", "specialty": "Cardiology"
                }
            },
            {
                "first_name": "Richard", "last_name": "Harris", "age": "[50-60)", "gender": "Male", "race": "Other",
                "pnbr": 99201947, "tier": "Medium", "weight": "[75-100kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Glimepiride", "dosage_status": "Down"}, {"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": ">7", "glu": "Norm", "num_inpatient": 1, "num_emergency": 1, "num_meds": 12, "time_in_hosp": 4,
                    "diag_1": "414.01", "diag_2": "250.00", "diag_3": "401.90", "change": "Ch", "specialty": "InternalMedicine"
                }
            },
            {
                "first_name": "Joseph", "last_name": "Thompson", "age": "[60-70)", "gender": "Male", "race": "Caucasian",
                "pnbr": 22019384, "tier": "Medium", "weight": "[75-100kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Steady"}],
                    "a1c": ">7", "glu": ">200", "num_inpatient": 1, "num_emergency": 0, "num_meds": 13, "time_in_hosp": 5,
                    "diag_1": "585.90", "diag_2": "250.00", "diag_3": "401.90", "change": "No", "specialty": "Nephrology"
                }
            },
            {
                "first_name": "Charles", "last_name": "Clark", "age": "[50-60)", "gender": "Male", "race": "Caucasian",
                "pnbr": 88501937, "tier": "Medium", "weight": "[75-100kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Metformin", "dosage_status": "Up"}, {"medication_name": "Glyburide", "dosage_status": "Steady"}],
                    "a1c": ">7", "glu": ">200", "num_inpatient": 1, "num_emergency": 1, "num_meds": 14, "time_in_hosp": 5,
                    "diag_1": "414.01", "diag_2": "250.00", "diag_3": "272.40", "change": "Ch", "specialty": "Family/GeneralPractice"
                }
            },
            {
                "first_name": "Dorothy", "last_name": "Rodriguez", "age": "[60-70)", "gender": "Female", "race": "Hispanic",
                "pnbr": 99601928, "tier": "Medium", "weight": "[50-75kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Glipizide", "dosage_status": "Up"}, {"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": ">7", "glu": "Norm", "num_inpatient": 1, "num_emergency": 0, "num_meds": 12, "time_in_hosp": 4,
                    "diag_1": "401.90", "diag_2": "250.00", "diag_3": "272.40", "change": "Ch", "specialty": "Endocrinology"
                }
            },
            {
                "first_name": "Nancy", "last_name": "Hall", "age": "[60-70)", "gender": "Female", "race": "AfricanAmerican",
                "pnbr": 44012938, "tier": "Medium", "weight": "[75-100kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Steady"}, {"medication_name": "Glipizide", "dosage_status": "Steady"}],
                    "a1c": ">7", "glu": ">200", "num_inpatient": 1, "num_emergency": 1, "num_meds": 15, "time_in_hosp": 6,
                    "diag_1": "496.00", "diag_2": "250.00", "diag_3": "401.90", "change": "No", "specialty": "Pulmonology"
                }
            },
            {
                "first_name": "Lisa", "last_name": "Young", "age": "[50-60)", "gender": "Female", "race": "Hispanic",
                "pnbr": 66234918, "tier": "Medium", "weight": "[75-100kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Metformin", "dosage_status": "Up"}, {"medication_name": "Pioglitazone", "dosage_status": "Steady"}],
                    "a1c": ">7", "glu": "Norm", "num_inpatient": 1, "num_emergency": 0, "num_meds": 11, "time_in_hosp": 4,
                    "diag_1": "250.00", "diag_2": "401.90", "diag_3": "272.40", "change": "Ch", "specialty": "Family/GeneralPractice"
                }
            },
            {
                "first_name": "Kenneth", "last_name": "Wright", "age": "[60-70)", "gender": "Male", "race": "Caucasian",
                "pnbr": 77123918, "tier": "Medium", "weight": "[75-100kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Steady"}, {"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": ">7", "glu": ">200", "num_inpatient": 1, "num_emergency": 1, "num_meds": 14, "time_in_hosp": 5,
                    "diag_1": "414.01", "diag_2": "250.00", "diag_3": "401.90", "change": "No", "specialty": "Cardiology"
                }
            },
            {
                "first_name": "Samuel", "last_name": "O'Connor", "age": "[50-60)", "gender": "Male", "race": "Caucasian",
                "pnbr": 88234918, "tier": "Medium", "weight": "[75-100kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Glipizide", "dosage_status": "Steady"}, {"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": ">7", "glu": ">200", "num_inpatient": 1, "num_emergency": 0, "num_meds": 12, "time_in_hosp": 4,
                    "diag_1": "250.00", "diag_2": "414.01", "diag_3": "272.40", "change": "No", "specialty": "InternalMedicine"
                }
            },
            {
                "first_name": "Angela", "last_name": "Foster", "age": "[60-70)", "gender": "Female", "race": "AfricanAmerican",
                "pnbr": 99345918, "tier": "Medium", "weight": "[50-75kg)", "payer_code": "MC",
                "archetype": {
                    "meds": [{"medication_name": "Insulin", "dosage_status": "Down"}, {"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": ">7", "glu": "Norm", "num_inpatient": 1, "num_emergency": 1, "num_meds": 13, "time_in_hosp": 5,
                    "diag_1": "401.90", "diag_2": "250.00", "diag_3": "496.00", "change": "Ch", "specialty": "Endocrinology"
                }
            },

            # --- LOW RISK COHORT (Stable Glycemic Control, Monotherapy / Lifestyle, Zero Prior Inpatient) ---
            {
                "first_name": "Michael", "last_name": "Anderson", "age": "[40-50)", "gender": "Male", "race": "Caucasian",
                "pnbr": 66201948, "tier": "Low", "weight": "[75-100kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": "Norm", "glu": "Norm", "num_inpatient": 0, "num_emergency": 0, "num_meds": 6, "time_in_hosp": 2,
                    "diag_1": "250.00", "diag_2": "401.90", "diag_3": "272.40", "change": "No", "specialty": "Family/GeneralPractice"
                }
            },
            {
                "first_name": "Thomas", "last_name": "Martinez", "age": "[40-50)", "gender": "Male", "race": "Hispanic",
                "pnbr": 66501948, "tier": "Low", "weight": "[75-100kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": "Norm", "glu": "Norm", "num_inpatient": 0, "num_emergency": 0, "num_meds": 7, "time_in_hosp": 3,
                    "diag_1": "250.00", "diag_2": "272.40", "diag_3": "401.90", "change": "No", "specialty": "InternalMedicine"
                }
            },
            {
                "first_name": "Karen", "last_name": "Lee", "age": "[40-50)", "gender": "Female", "race": "Asian",
                "pnbr": 22801947, "tier": "Low", "weight": "[50-75kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": "Norm", "glu": "Norm", "num_inpatient": 0, "num_emergency": 0, "num_meds": 5, "time_in_hosp": 2,
                    "diag_1": "250.00", "diag_2": "401.90", "diag_3": "272.40", "change": "No", "specialty": "Endocrinology"
                }
            },
            {
                "first_name": "Susan", "last_name": "Garcia", "age": "[50-60)", "gender": "Female", "race": "Caucasian",
                "pnbr": 11029385, "tier": "Low", "weight": "[50-75kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [],
                    "a1c": "None", "glu": "None", "num_inpatient": 0, "num_emergency": 0, "num_meds": 4, "time_in_hosp": 2,
                    "diag_1": "250.00", "diag_2": "272.40", "diag_3": "401.90", "change": "No", "specialty": "Family/GeneralPractice"
                }
            },
            {
                "first_name": "James", "last_name": "Wilson", "age": "[50-60)", "gender": "Male", "race": "Caucasian",
                "pnbr": 84521902, "tier": "Low", "weight": "[75-100kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": "Norm", "glu": "Norm", "num_inpatient": 0, "num_emergency": 0, "num_meds": 8, "time_in_hosp": 3,
                    "diag_1": "250.00", "diag_2": "401.90", "diag_3": "272.40", "change": "No", "specialty": "InternalMedicine"
                }
            },
            {
                "first_name": "Maria", "last_name": "Lopez", "age": "[40-50)", "gender": "Female", "race": "Hispanic",
                "pnbr": 45210983, "tier": "Low", "weight": "[50-75kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": "Norm", "glu": "Norm", "num_inpatient": 0, "num_emergency": 0, "num_meds": 6, "time_in_hosp": 2,
                    "diag_1": "250.00", "diag_2": "272.40", "diag_3": "401.90", "change": "No", "specialty": "Family/GeneralPractice"
                }
            },
            {
                "first_name": "Daniel", "last_name": "Kim", "age": "[50-60)", "gender": "Male", "race": "Asian",
                "pnbr": 33901939, "tier": "Low", "weight": "[75-100kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Glipizide", "dosage_status": "Steady"}],
                    "a1c": "Norm", "glu": "Norm", "num_inpatient": 0, "num_emergency": 0, "num_meds": 7, "time_in_hosp": 3,
                    "diag_1": "250.00", "diag_2": "401.90", "diag_3": "272.40", "change": "No", "specialty": "Endocrinology"
                }
            },
            {
                "first_name": "Jennifer", "last_name": "Morales", "age": "[40-50)", "gender": "Female", "race": "Hispanic",
                "pnbr": 33102949, "tier": "Low", "weight": "[50-75kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": "Norm", "glu": "Norm", "num_inpatient": 0, "num_emergency": 0, "num_meds": 5, "time_in_hosp": 2,
                    "diag_1": "250.00", "diag_2": "272.40", "diag_3": "401.90", "change": "No", "specialty": "InternalMedicine"
                }
            },
            {
                "first_name": "William", "last_name": "Taylor", "age": "[50-60)", "gender": "Male", "race": "Caucasian",
                "pnbr": 55201939, "tier": "Low", "weight": "[75-100kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": "Norm", "glu": "Norm", "num_inpatient": 0, "num_emergency": 0, "num_meds": 6, "time_in_hosp": 2,
                    "diag_1": "250.00", "diag_2": "401.90", "diag_3": "272.40", "change": "No", "specialty": "Family/GeneralPractice"
                }
            },
            {
                "first_name": "Rachel", "last_name": "Greenberg", "age": "[40-50)", "gender": "Female", "race": "Caucasian",
                "pnbr": 88301925, "tier": "Low", "weight": "[50-75kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [],
                    "a1c": "Norm", "glu": "Norm", "num_inpatient": 0, "num_emergency": 0, "num_meds": 4, "time_in_hosp": 1,
                    "diag_1": "250.00", "diag_2": "272.40", "diag_3": "401.90", "change": "No", "specialty": "Endocrinology"
                }
            },
            {
                "first_name": "Brian", "last_name": "Simmons", "age": "[50-60)", "gender": "Male", "race": "AfricanAmerican",
                "pnbr": 77401939, "tier": "Low", "weight": "[75-100kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": "Norm", "glu": "Norm", "num_inpatient": 0, "num_emergency": 0, "num_meds": 7, "time_in_hosp": 3,
                    "diag_1": "250.00", "diag_2": "401.90", "diag_3": "272.40", "change": "No", "specialty": "InternalMedicine"
                }
            },
            {
                "first_name": "Hannah", "last_name": "Zimmerman", "age": "[40-50)", "gender": "Female", "race": "Caucasian",
                "pnbr": 11701939, "tier": "Low", "weight": "[50-75kg)", "payer_code": "HM",
                "archetype": {
                    "meds": [{"medication_name": "Metformin", "dosage_status": "Steady"}],
                    "a1c": "Norm", "glu": "Norm", "num_inpatient": 0, "num_emergency": 0, "num_meds": 5, "time_in_hosp": 2,
                    "diag_1": "250.00", "diag_2": "272.40", "diag_3": "401.90", "change": "No", "specialty": "Family/GeneralPractice"
                }
            }
        ]

        from app.ml.predictor import predictor

        for idx, pdata in enumerate(sample_patients_pool):
            assigned_doc = created_doctors[idx % len(created_doctors)]
            arch = pdata["archetype"]
            patient_nbr = 10000000 + (idx * 2317) + pdata.get("pnbr", 100000) % 90000
            
            patient = Patient(
                patient_nbr=patient_nbr,
                first_name=pdata["first_name"],
                last_name=pdata["last_name"],
                race=pdata["race"],
                gender=pdata["gender"],
                age=pdata["age"],
                weight=pdata["weight"],
                payer_code=pdata["payer_code"],
                assigned_doctor_id=assigned_doc
            )
            db.add(patient)
            db.flush()

            # Create 1 to 3 admissions per patient based on clinical risk tier
            tier = pdata["tier"]
            if tier == "High":
                num_adm = 3 if idx % 2 == 0 else 2
            elif tier == "Medium":
                num_adm = 2 if idx % 2 == 0 else 1
            else:
                num_adm = 1

            for adm_idx in range(num_adm):
                encounter_id = 2000000 + (idx * 50) + adm_idx + 1
                days_ago = (idx * 3) + (adm_idx * 28) + 2
                adm_date = datetime.utcnow() - timedelta(days=days_ago)
                time_in_hosp = arch["time_in_hosp"] + (random.randint(-1, 1) if adm_idx > 0 else 0)
                time_in_hosp = max(1, time_in_hosp)
                disch_date = adm_date + timedelta(days=time_in_hosp)
                
                num_lab = random.randint(58, 88) if tier == "High" else (random.randint(40, 62) if tier == "Medium" else random.randint(25, 45))
                num_meds = max(4, arch["num_meds"] + random.randint(-1, 1))
                num_inpatient = arch["num_inpatient"]
                num_emergency = arch["num_emergency"]
                d1 = arch["diag_1"]
                d2 = arch["diag_2"]
                d3 = arch["diag_3"]

                # Use live ML Predictor with calibrated clinical inference
                encounter_payload = {
                    "age": pdata["age"],
                    "race": pdata["race"],
                    "gender": pdata["gender"],
                    "time_in_hospital": time_in_hosp,
                    "num_lab_procedures": num_lab,
                    "num_procedures": 2 if tier == "High" else (1 if tier == "Medium" else 0),
                    "num_medications": num_meds,
                    "number_outpatient": random.randint(0, 2),
                    "number_emergency": num_emergency,
                    "number_inpatient": num_inpatient,
                    "diag_1": d1,
                    "diag_2": d2,
                    "diag_3": d3,
                    "number_diagnoses": 9 if tier == "High" else (6 if tier == "Medium" else 3),
                    "max_glu_serum": arch["glu"],
                    "A1Cresult": arch["a1c"],
                    "change": arch["change"],
                    "diabetesMed": "Yes" if len(arch["meds"]) > 0 else "No",
                    "medications": arch["meds"]
                }
                
                risk_score, risk_category, readmitted, _ = predictor.predict(encounter_payload)

                admission = Admission(
                    encounter_id=encounter_id,
                    patient_id=patient.id,
                    admission_type="Emergency" if tier in ["High", "Medium"] else "Elective",
                    discharge_disposition="Discharged to home",
                    admission_source="Emergency Room" if tier in ["High", "Medium"] else "Physician Referral",
                    time_in_hospital=time_in_hosp,
                    medical_specialty=arch.get("specialty", random.choice(specialties)),
                    num_lab_procedures=num_lab,
                    num_procedures=encounter_payload["num_procedures"],
                    num_medications=num_meds,
                    number_outpatient=encounter_payload["number_outpatient"],
                    number_emergency=encounter_payload["number_emergency"],
                    number_inpatient=num_inpatient,
                    diag_1=d1,
                    diag_2=d2,
                    diag_3=d3,
                    number_diagnoses=encounter_payload["number_diagnoses"],
                    max_glu_serum=encounter_payload["max_glu_serum"],
                    A1Cresult=encounter_payload["A1Cresult"],
                    change=encounter_payload["change"],
                    diabetesMed=encounter_payload["diabetesMed"],
                    risk_score=risk_score,
                    risk_category=risk_category,
                    readmitted=readmitted,
                    admission_date=adm_date,
                    discharge_date=disch_date
                )
                db.add(admission)
                db.flush()

                # Add sample medications
                for med_item in encounter_payload["medications"]:
                    med = Medication(
                        admission_id=admission.id,
                        medication_name=med_item["medication_name"],
                        dosage_status=med_item["dosage_status"]
                    )
                    db.add(med)

        db.commit()
        print("Database seeded with diverse multi-risk patients & admissions successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
