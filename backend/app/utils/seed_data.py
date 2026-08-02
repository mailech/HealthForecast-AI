import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.admission import Admission
from app.models.medication import Medication
from app.utils.security import get_password_hash

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if users already exist
        if db.query(User).count() > 0:
            print("Database already seeded.")
            return

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

        # Seed sample Diabetes 130-US Hospitals patients
        print("Seeding patient records...")
        races = ["Caucasian", "AfricanAmerican", "Hispanic", "Asian", "Other"]
        genders = ["Male", "Female"]
        age_brackets = ["[40-50)", "[50-60)", "[60-70)", "[70-80)", "[80-90)"]
        specialties = ["InternalMedicine", "Cardiology", "Family/GeneralPractice", "Endocrinology", "Emergency/Trauma"]
        
        sample_patients_data = [
            ("James", "Wilson", "[70-80)", "Male", "Caucasian", 84521901),
            ("Maria", "Garcia", "[60-70)", "Female", "Hispanic", 45210982),
            ("David", "Johnson", "[80-90)", "Male", "AfricanAmerican", 98310452),
            ("Patricia", "Smith", "[50-60)", "Female", "Caucasian", 12049831),
            ("Robert", "Martinez", "[70-80)", "Male", "Hispanic", 77310928),
            ("Linda", "Taylor", "[60-70)", "Female", "AfricanAmerican", 34910283),
            ("Michael", "Anderson", "[40-50)", "Male", "Caucasian", 66201948),
            ("Barbara", "Thomas", "[70-80)", "Female", "Asian", 88301924),
            ("William", "Jackson", "[80-90)", "Male", "AfricanAmerican", 55201938),
            ("Elizabeth", "White", "[60-70)", "Female", "Caucasian", 44102938),
            ("Richard", "Harris", "[50-60)", "Male", "Other", 99201947),
            ("Jennifer", "Martin", "[70-80)", "Female", "Hispanic", 33102948),
            ("Joseph", "Thompson", "[60-70)", "Male", "Caucasian", 22019384),
            ("Susan", "Garcia", "[80-90)", "Female", "Caucasian", 11029384),
            ("Thomas", "Martinez", "[40-50)", "Male", "Hispanic", 66501948),
            ("Margaret", "Robinson", "[70-80)", "Female", "AfricanAmerican", 77401938),
            ("Charles", "Clark", "[50-60)", "Male", "Caucasian", 88501937),
            ("Dorothy", "Rodriguez", "[60-70)", "Female", "Hispanic", 99601928),
            ("Christopher", "Lewis", "[70-80)", "Male", "Asian", 11701938),
            ("Karen", "Lee", "[40-50)", "Female", "Asian", 22801947),
            ("Daniel", "Walker", "[80-90)", "Male", "Caucasian", 33901938),
            ("Nancy", "Hall", "[60-70)", "Female", "AfricanAmerican", 44012938),
            ("Matthew", "Allen", "[70-80)", "Male", "Caucasian", 55123948),
            ("Lisa", "Young", "[50-60)", "Female", "Hispanic", 66234918),
        ]

        diagnoses_list = [
            ("250.00", "Diabetes mellitus without mention of complication"),
            ("414.01", "Coronary atherosclerosis of native coronary artery"),
            ("428.00", "Congestive heart failure, unspecified"),
            ("401.90", "Unspecified essential hypertension"),
            ("496.00", "Chronic airway obstruction, not elsewhere classified"),
            ("585.90", "Chronic kidney disease, unspecified"),
            ("272.40", "Other and unspecified hyperlipidemia")
        ]

        medications_pool = ["Metformin", "Insulin", "Glipizide", "Glyburide", "Pioglitazone", "Rosiglitazone", "Glimepiride"]

        for idx, (fname, lname, age, gender, race, pnbr) in enumerate(sample_patients_data):
            assigned_doc = created_doctors[idx % len(created_doctors)]
            
            patient = Patient(
                patient_nbr=pnbr,
                first_name=fname,
                last_name=lname,
                race=race,
                gender=gender,
                age=age,
                weight="[75-100kg)" if idx % 2 == 0 else "[50-75kg)",
                payer_code="MC" if idx % 3 == 0 else "HM",
                assigned_doctor_id=assigned_doc
            )
            db.add(patient)
            db.flush()

            # Create 1-2 admissions per patient
            num_adm = 2 if idx % 3 == 0 else 1
            for adm_idx in range(num_adm):
                encounter_id = pnbr + 1000 + adm_idx
                days_ago = (idx * 5) + (adm_idx * 20) + 2
                adm_date = datetime.utcnow() - timedelta(days=days_ago)
                time_in_hosp = random.randint(2, 9)
                disch_date = adm_date + timedelta(days=time_in_hosp)

                # Determine realistic risk score & readmission flag
                num_lab = random.randint(30, 85)
                num_meds = random.randint(8, 26)
                num_inpatient = random.randint(0, 3)
                
                # Formula to generate synthetic realistic risk score based on features
                risk_score = round(min(98.5, max(12.0, (num_inpatient * 18.0) + (num_lab * 0.4) + (num_meds * 1.5) + random.uniform(-5, 10))), 1)
                
                if risk_score >= 65:
                    risk_category = "High"
                    readmitted = "<30" if random.random() < 0.7 else ">30"
                elif risk_score >= 40:
                    risk_category = "Medium"
                    readmitted = ">30" if random.random() < 0.6 else "NO"
                else:
                    risk_category = "Low"
                    readmitted = "NO"

                d1 = random.choice(diagnoses_list)[0]
                d2 = random.choice(diagnoses_list)[0]
                d3 = random.choice(diagnoses_list)[0]

                admission = Admission(
                    encounter_id=encounter_id,
                    patient_id=patient.id,
                    admission_type="Emergency" if idx % 2 == 0 else "Elective",
                    discharge_disposition="Discharged to home",
                    admission_source="Emergency Room" if idx % 2 == 0 else "Physician Referral",
                    time_in_hospital=time_in_hosp,
                    medical_specialty=random.choice(specialties),
                    num_lab_procedures=num_lab,
                    num_procedures=random.randint(0, 4),
                    num_medications=num_meds,
                    number_outpatient=random.randint(0, 2),
                    number_emergency=random.randint(0, 2),
                    number_inpatient=num_inpatient,
                    diag_1=d1,
                    diag_2=d2,
                    diag_3=d3,
                    number_diagnoses=random.randint(3, 9),
                    max_glu_serum=">200" if risk_score > 60 else "Norm",
                    A1Cresult=">8" if risk_score > 55 else "Norm",
                    change="Ch" if idx % 2 == 0 else "No",
                    diabetesMed="Yes",
                    risk_score=risk_score,
                    risk_category=risk_category,
                    readmitted=readmitted,
                    admission_date=adm_date,
                    discharge_date=disch_date
                )
                db.add(admission)
                db.flush()

                # Add sample medications
                for med_name in random.sample(medications_pool, random.randint(2, 4)):
                    status = random.choice(["Up", "Down", "Steady"])
                    med = Medication(
                        admission_id=admission.id,
                        medication_name=med_name,
                        dosage_status=status
                    )
                    db.add(med)

        db.commit()
        print("Database seeded with patients & admissions successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
