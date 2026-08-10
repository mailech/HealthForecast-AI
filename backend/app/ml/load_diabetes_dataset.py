"""
Loads the UCI "Diabetes 130-US Hospitals" dataset (1999-2008) into the
`patients` and `admissions` tables so it can back both model training and
the live dashboards with realistic data.

Dataset: https://archive.ics.uci.edu/dataset/296/diabetes+130-us+hospitals+for+years+1999-2008
Also mirrored on Kaggle as "diabetic_data.csv".

Usage:
    python -m app.ml.load_diabetes_dataset --csv path/to/diabetic_data.csv [--limit 5000]

The raw CSV has no patient names/DOB (it's already de-identified), so this
loader synthesizes a stable placeholder identity per unique patient_nbr —
replace with real intake data in production; this is purely to populate a
realistic-looking demo/training dataset.
"""
import argparse
import uuid
from datetime import date, timedelta

import pandas as pd
from sqlalchemy.orm import Session

from app.db.session import Base, SessionLocal, engine
from app.models.patient import Admission, Patient

# Maps the dataset's 3-way label to our boolean 30-day flag.
READMIT_MAP = {"<30": True, ">30": False, "NO": False}


def _synth_dob(age_range: str) -> date:
    """Dataset gives age as a bracket like '[70-80)'. Pick the bracket midpoint
    and back-calculate an approximate date of birth."""
    try:
        low = int(age_range.strip("[)").split("-")[0])
    except (ValueError, IndexError):
        low = 50
    approx_age = low + 5
    return date.today() - timedelta(days=approx_age * 365)


def load(csv_path: str, limit: int | None = None):
    Base.metadata.create_all(bind=engine)
    df = pd.read_csv(csv_path)
    if limit:
        df = df.head(limit)

    db: Session = SessionLocal()
    patient_cache: dict[str, uuid.UUID] = {}

    try:
        created_patients, created_admissions = 0, 0

        for _, row in df.iterrows():
            patient_nbr = str(row.get("patient_nbr", uuid.uuid4()))

            if patient_nbr not in patient_cache:
                patient = Patient(
                    mrn=f"DS-{patient_nbr}",
                    full_name=f"Patient {patient_nbr}",  # de-identified source data
                    date_of_birth=_synth_dob(str(row.get("age", "[50-60)"))),
                    gender=str(row.get("gender", "Unknown")),
                    race=str(row.get("race", None)) or None,
                )
                db.add(patient)
                db.flush()
                patient_cache[patient_nbr] = patient.id
                created_patients += 1

            readmit_raw = str(row.get("readmitted", "NO"))
            admission = Admission(
                patient_id=patient_cache[patient_nbr],
                admitted_on=date.today(),  # dataset has no real admission date
                admission_type=str(row.get("admission_type_id", "")) or None,
                discharge_disposition=str(row.get("discharge_disposition_id", "")) or None,
                primary_diagnosis=str(row.get("diag_1", "")) or None,
                time_in_hospital=int(row.get("time_in_hospital", 0) or 0),
                num_lab_procedures=int(row.get("num_lab_procedures", 0) or 0),
                num_procedures=int(row.get("num_procedures", 0) or 0),
                num_medications=int(row.get("num_medications", 0) or 0),
                number_outpatient=int(row.get("number_outpatient", 0) or 0),
                number_emergency=int(row.get("number_emergency", 0) or 0),
                number_inpatient=int(row.get("number_inpatient", 0) or 0),
                number_diagnoses=int(row.get("number_diagnoses", 0) or 0),
                was_readmitted_30d=READMIT_MAP.get(readmit_raw, False),
            )
            db.add(admission)
            created_admissions += 1

        db.commit()
        print(f"Loaded {created_patients} patients and {created_admissions} admissions.")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, help="Path to diabetic_data.csv")
    parser.add_argument("--limit", type=int, default=None, help="Optional row limit for a quick demo load")
    args = parser.parse_args()
    load(args.csv, args.limit)
