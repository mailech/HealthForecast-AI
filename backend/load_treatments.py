"""
load_treatments.py

Generates sample Treatment records tied to existing patients, so the
Treatment Effectiveness / Healthcare Analytics modules have real data to show.

Usage (from the backend/ folder, with venv activated):
    python load_treatments.py
"""

import random
from datetime import timedelta

from app.database import SessionLocal
from app import models

TREATMENT_NAMES = [
    "Insulin Therapy", "Metformin Regimen", "Dietary Management",
    "Physical Therapy", "Blood Pressure Management", "Wound Care",
    "Cardiac Monitoring", "Post-Surgical Recovery Plan",
]
MEDICATIONS = [
    "Metformin", "Insulin", "Glipizide", "Lisinopril", "Atorvastatin",
    "Aspirin", "Furosemide", None,
]
OUTCOMES = ["Improved", "Improved", "Improved", "No Change", "Worsened"]  # weighted toward Improved
NOTES_SAMPLES = [
    "Patient responded well to treatment.",
    "Continued monitoring recommended.",
    "Mild side effects noted, dosage adjusted.",
    "No significant change observed.",
    "Condition worsened, escalated to specialist.",
    "",
]


def main():
    db = SessionLocal()

    patients = db.query(models.Patient).all()
    if not patients:
        print("No patients found. Load patients first.")
        return

    inserted = 0
    for patient in patients:
        # 1 treatment per patient (some get 2, for variety)
        num_treatments = random.choice([1, 1, 1, 2])
        for _ in range(num_treatments):
            start = patient.admission_date or patient.discharge_date
            if start is None:
                continue
            end = start + timedelta(days=random.randint(1, 10))

            treatment = models.Treatment(
                patient_id=patient.id,
                treatment_name=random.choice(TREATMENT_NAMES),
                medication=random.choice(MEDICATIONS),
                start_date=start,
                end_date=end,
                outcome=random.choice(OUTCOMES),
                notes=random.choice(NOTES_SAMPLES),
            )
            db.add(treatment)
            inserted += 1

    db.commit()
    print(f"Inserted {inserted} treatment records for {len(patients)} patients.")


if __name__ == "__main__":
    main()