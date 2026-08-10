"""
Populates the database with realistic demo patients — including some
flagged critical/high-risk — plus admissions, risk scores, and bills, so
the dashboard has something meaningful to show without needing the full
Diabetes 130-US dataset loaded first.

Run with:  python -m app.db.seed_demo
Safe to re-run — skips patients that already exist (matched by MRN).
"""
import random
from datetime import date, timedelta

from app.db.session import Base, SessionLocal, engine
from app.models.patient import Admission, Bill, Patient, RiskScore
from app.services.risk_prediction import predict_readmission_risk

random.seed(7)

# (name, mrn, dob, gender, is_critical)
DEMO_PATIENTS = [
    ("Priya Sharma", "MRN-1001", date(1958, 3, 12), "F", True),
    ("Rajesh Kumar", "MRN-1002", date(1971, 7, 4), "M", True),
    ("Ananya Reddy", "MRN-1003", date(1990, 11, 2), "F", False),
    ("Vikram Singh", "MRN-1004", date(1965, 1, 22), "M", True),
    ("Meera Nair", "MRN-1005", date(1983, 5, 30), "F", False),
    ("Arjun Iyer", "MRN-1006", date(1996, 9, 15), "M", False),
    ("Lakshmi Pillai", "MRN-1007", date(1949, 12, 8), "F", True),
    ("Rohan Mehta", "MRN-1008", date(1977, 4, 19), "M", False),
]

CRITICAL_DIAGNOSES = ["Congestive heart failure", "Sepsis", "COPD exacerbation", "Diabetic ketoacidosis"]
ROUTINE_DIAGNOSES = ["Type 2 diabetes management", "Hypertension follow-up", "Minor fracture", "Elective procedure"]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        created = 0
        for full_name, mrn, dob, gender, is_critical in DEMO_PATIENTS:
            if db.query(Patient).filter(Patient.mrn == mrn).first():
                continue

            patient = Patient(mrn=mrn, full_name=full_name, date_of_birth=dob, gender=gender)
            db.add(patient)
            db.flush()

            admitted_on = date.today() - timedelta(days=random.randint(1, 20))

            if is_critical:
                admission = Admission(
                    patient_id=patient.id,
                    admitted_on=admitted_on,
                    primary_diagnosis=random.choice(CRITICAL_DIAGNOSES),
                    time_in_hospital=random.randint(7, 14),
                    num_lab_procedures=random.randint(30, 60),
                    num_procedures=random.randint(3, 6),
                    num_medications=random.randint(15, 25),
                    number_outpatient=random.randint(1, 4),
                    number_emergency=random.randint(2, 5),
                    number_inpatient=random.randint(2, 4),
                    number_diagnoses=random.randint(6, 9),
                )
            else:
                admission = Admission(
                    patient_id=patient.id,
                    admitted_on=admitted_on,
                    primary_diagnosis=random.choice(ROUTINE_DIAGNOSES),
                    time_in_hospital=random.randint(1, 4),
                    num_lab_procedures=random.randint(5, 20),
                    num_procedures=random.randint(0, 2),
                    num_medications=random.randint(3, 10),
                    number_outpatient=random.randint(0, 1),
                    number_emergency=0,
                    number_inpatient=0,
                    number_diagnoses=random.randint(1, 3),
                )

            db.add(admission)
            db.flush()

            probability, category, model_version, confidence = predict_readmission_risk(admission)
            db.add(RiskScore(
                patient_id=patient.id,
                admission_id=admission.id,
                readmission_probability=probability,
                risk_category=category,
                model_version=model_version,
                confidence_score=confidence,
            ))

            room = admission.time_in_hospital * random.randint(3500, 6000)
            procedures = (admission.num_procedures or 0) * random.randint(8000, 20000)
            meds = (admission.num_medications or 0) * random.randint(200, 600)
            labs = (admission.num_lab_procedures or 0) * random.randint(150, 400)
            other = random.randint(500, 3000)
            total = room + procedures + meds + labs + other
            insurance = round(total * random.uniform(0.4, 0.75))

            db.add(Bill(
                patient_id=patient.id,
                admission_id=admission.id,
                room_charges=room,
                procedure_charges=procedures,
                medication_charges=meds,
                lab_charges=labs,
                other_charges=other,
                insurance_covered=insurance,
                status=random.choice(["pending", "pending", "paid", "overdue"]),
                issued_on=admitted_on + timedelta(days=admission.time_in_hospital or 1),
            ))

            created += 1

        db.commit()
        print(f"Seeded {created} demo patients (skipped any that already existed).")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
