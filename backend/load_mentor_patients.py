"""
load_mentor_patients.py

Loads a sample of rows from the mentor-provided diabetic_data.csv into the
`patients` table as synthetic patient records (since the source dataset is
anonymized and has no real names, MRNs, or dates).

Usage (from the backend/ folder, with venv activated):
    python load_mentor_patients.py
"""

import csv
import random
from datetime import date, timedelta

from app.database import SessionLocal
from app import models

# ---- Configuration ----
CSV_PATH = r"D:\downloads\diabetic_data.csv"
ROWS_TO_LOAD = 300
ASSIGNED_DOCTOR_ID = 8  # doctor@example.com

# Age bucket -> approximate birth year range (dataset uses buckets like "[70-80)")
AGE_BUCKET_MIDPOINTS = {
    "[0-10)": 5, "[10-20)": 15, "[20-30)": 25, "[30-40)": 35,
    "[40-50)": 45, "[50-60)": 55, "[60-70)": 65, "[70-80)": 75,
    "[80-90)": 85, "[90-100)": 95,
}

MALE_FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan",
    "Krishna", "Ishaan", "James", "John", "Robert", "Michael", "David",
]
FEMALE_FIRST_NAMES = [
    "Ananya", "Diya", "Saanvi", "Aadhya", "Kiara", "Myra", "Anika", "Navya",
    "Riya", "Ira", "Mary", "Patricia", "Linda", "Susan", "Karen",
]
LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Reddy", "Rao", "Kumar", "Singh", "Iyer",
    "Nair", "Patel", "Smith", "Johnson", "Williams", "Brown", "Jones",
    "Miller", "Davis", "Garcia", "Wilson", "Anderson",
]


def random_name(gender: str):
    if gender == "female":
        first = random.choice(FEMALE_FIRST_NAMES)
    elif gender == "male":
        first = random.choice(MALE_FIRST_NAMES)
    else:
        first = random.choice(MALE_FIRST_NAMES + FEMALE_FIRST_NAMES)
    return f"{first} {random.choice(LAST_NAMES)}"


def birth_date_from_age_bucket(bucket: str) -> date:
    midpoint_age = AGE_BUCKET_MIDPOINTS.get(bucket, 50)
    # Add some random spread within the bucket (+/- 4 years) for variety
    age = midpoint_age + random.randint(-4, 4)
    today = date.today()
    birth_year = today.year - age
    birth_month = random.randint(1, 12)
    birth_day = random.randint(1, 28)
    return date(birth_year, birth_month, birth_day)


def random_admission_discharge(time_in_hospital: int):
    # Random admission date within the last 2 years
    days_ago = random.randint(1, 730)
    admission = date.today() - timedelta(days=days_ago)
    discharge = admission + timedelta(days=max(time_in_hospital, 1))
    return admission, discharge


def normalize_gender(raw: str) -> str:
    raw = (raw or "").strip().lower()
    if raw.startswith("male"):
        return "male"
    if raw.startswith("female"):
        return "female"
    return "unknown"


def build_diagnosis_text(row: dict) -> str:
    diag1 = row.get("diag_1", "").strip()
    diag2 = row.get("diag_2", "").strip()
    diag3 = row.get("diag_3", "").strip()
    codes = [c for c in [diag1, diag2, diag3] if c and c != "?"]
    if not codes:
        return "Diabetes-related admission (ICD-9 codes not recorded)"
    return f"Diabetes-related admission (ICD-9 codes: {', '.join(codes)})"


def main():
    db = SessionLocal()

    # Sanity check: does the assigned doctor exist?
    doctor = db.query(models.User).filter(models.User.id == ASSIGNED_DOCTOR_ID).first()
    if not doctor:
        print(f"ERROR: No user found with id={ASSIGNED_DOCTOR_ID}. Aborting.")
        return
    print(f"Assigning all patients to doctor: {doctor.full_name} <{doctor.email}> (id={doctor.id})")

    inserted = 0
    used_mrns = set()

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if i >= ROWS_TO_LOAD:
                break

            gender = normalize_gender(row.get("gender", ""))
            dob = birth_date_from_age_bucket(row.get("age", ""))

            try:
                time_in_hospital = int(row.get("time_in_hospital", 1))
            except ValueError:
                time_in_hospital = 1

            admission_date, discharge_date = random_admission_discharge(time_in_hospital)

            # Build a unique synthetic MRN
            mrn = f"MRN-{row.get('patient_nbr', i)}"
            while mrn in used_mrns:
                mrn = f"{mrn}-{random.randint(1000,9999)}"
            used_mrns.add(mrn)

            patient = models.Patient(
                full_name=random_name(gender),
                date_of_birth=dob,
                gender=gender,
                medical_record_number=mrn,
                diagnosis=build_diagnosis_text(row),
                admission_date=admission_date,
                discharge_date=discharge_date,
                assigned_doctor_id=ASSIGNED_DOCTOR_ID,
            )
            db.add(patient)
            inserted += 1

    db.commit()
    print(f"Inserted {inserted} synthetic patient records.")


if __name__ == "__main__":
    main()