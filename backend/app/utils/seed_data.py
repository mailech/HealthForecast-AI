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

        # Clinically realistic archetypes for diabetic patient diversity
        regimen_archetypes = [
            # 0: Metformin Monotherapy (Optimal first line, well-controlled)
            {
                "meds": [{"medication_name": "Metformin", "dosage_status": "Steady"}],
                "a1c": "Norm",
                "glu": "Norm",
                "num_inpatient": 0,
                "num_emergency": 0,
                "num_meds": 8,
                "diag_1": "250.00",
                "diag_2": "401.90",
                "diag_3": "272.40",
                "change": "No"
            },
            # 1: Dual Oral Therapy (Suboptimal control, oral intensification)
            {
                "meds": [
                    {"medication_name": "Metformin", "dosage_status": "Up"},
                    {"medication_name": "Glipizide", "dosage_status": "Steady"}
                ],
                "a1c": ">7",
                "glu": ">200",
                "num_inpatient": 0,
                "num_emergency": 1,
                "num_meds": 11,
                "diag_1": "414.01",
                "diag_2": "250.00",
                "diag_3": "401.90",
                "change": "Ch"
            },
            # 2: High Complexity Insulin + Oral Combo + Polypharmacy (Critical risk)
            {
                "meds": [
                    {"medication_name": "Insulin", "dosage_status": "Up"},
                    {"medication_name": "Metformin", "dosage_status": "Steady"},
                    {"medication_name": "Pioglitazone", "dosage_status": "Steady"}
                ],
                "a1c": ">8",
                "glu": ">300",
                "num_inpatient": 2,
                "num_emergency": 2,
                "num_meds": 17,
                "diag_1": "428.00",
                "diag_2": "250.00",
                "diag_3": "496.00",
                "change": "Ch"
            },
            # 3: Insulin Monotherapy + Renal Complication
            {
                "meds": [{"medication_name": "Insulin", "dosage_status": "Steady"}],
                "a1c": ">8",
                "glu": ">200",
                "num_inpatient": 1,
                "num_emergency": 0,
                "num_meds": 13,
                "diag_1": "585.90",
                "diag_2": "250.00",
                "diag_3": "401.90",
                "change": "No"
            },
            # 4: Dietary Management / Guideline Missing Lab Check
            {
                "meds": [],
                "a1c": "None",
                "glu": "None",
                "num_inpatient": 0,
                "num_emergency": 0,
                "num_meds": 6,
                "diag_1": "250.00",
                "diag_2": "272.40",
                "diag_3": "401.90",
                "change": "No"
            },
            # 5: Dosage Reduction / Taper Rebound Risk
            {
                "meds": [{"medication_name": "Glimepiride", "dosage_status": "Down"}],
                "a1c": ">7",
                "glu": "Norm",
                "num_inpatient": 1,
                "num_emergency": 1,
                "num_meds": 10,
                "diag_1": "414.01",
                "diag_2": "250.00",
                "diag_3": "272.40",
                "change": "Ch"
            }
        ]

        for idx, (fname, lname, age, gender, race, pnbr) in enumerate(sample_patients_data):
            assigned_doc = created_doctors[idx % len(created_doctors)]
            archetype = regimen_archetypes[idx % len(regimen_archetypes)]
            
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
            num_adm = 2 if (idx % 3 == 0 or archetype["num_inpatient"] > 1) else 1
            for adm_idx in range(num_adm):
                encounter_id = pnbr + 1000 + adm_idx
                days_ago = (idx * 5) + (adm_idx * 20) + 2
                adm_date = datetime.utcnow() - timedelta(days=days_ago)
                time_in_hosp = random.randint(2, 4) if archetype["num_inpatient"] == 0 else random.randint(5, 9)
                disch_date = adm_date + timedelta(days=time_in_hosp)
                num_lab = random.randint(30, 50) if archetype["a1c"] == "Norm" else random.randint(55, 88)
                num_meds = archetype["num_meds"] + random.randint(-1, 2)
                num_inpatient = archetype["num_inpatient"]
                num_emergency = archetype["num_emergency"]
                d1 = archetype["diag_1"]
                d2 = archetype["diag_2"]
                d3 = archetype["diag_3"]

                # Use live ML Predictor with calibrated clinical inference
                encounter_payload = {
                    "age": age,
                    "race": race,
                    "gender": gender,
                    "time_in_hospital": time_in_hosp,
                    "num_lab_procedures": num_lab,
                    "num_procedures": random.randint(0, 3),
                    "num_medications": num_meds,
                    "number_outpatient": random.randint(0, 2),
                    "number_emergency": num_emergency,
                    "number_inpatient": num_inpatient,
                    "diag_1": d1,
                    "diag_2": d2,
                    "diag_3": d3,
                    "number_diagnoses": 3,
                    "max_glu_serum": archetype["glu"],
                    "A1Cresult": archetype["a1c"],
                    "change": archetype["change"],
                    "diabetesMed": "Yes" if len(archetype["meds"]) > 0 else "No",
                    "medications": archetype["meds"]
                }
                
                from app.ml.predictor import predictor
                risk_score, risk_category, readmitted, _ = predictor.predict(encounter_payload)


                admission = Admission(
                    encounter_id=encounter_id,
                    patient_id=patient.id,
                    admission_type="Emergency" if idx % 2 == 0 else "Elective",
                    discharge_disposition="Discharged to home",
                    admission_source="Emergency Room" if idx % 2 == 0 else "Physician Referral",
                    time_in_hospital=time_in_hosp,
                    medical_specialty=random.choice(specialties),
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
                for med_item in encounter_payload["medications"]:
                    med = Medication(
                        admission_id=admission.id,
                        medication_name=med_item["medication_name"],
                        dosage_status=med_item["dosage_status"]
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
