"""
One-off helper: assign a phone number to a demo patient so patient
self-signup has something to match against.

Run with:  python scripts/set_demo_phone.py
"""
from app.db.session import SessionLocal
from app.models.patient import Patient

db = SessionLocal()
try:
    patient = db.query(Patient).filter(Patient.mrn == "MRN-1001").first()
    if not patient:
        print("Patient MRN-1001 not found — did you run seed_demo?")
    else:
        patient.phone_number = "9876543210"
        db.commit()
        print(f"Set phone_number=9876543210 for {patient.full_name} ({patient.mrn})")
finally:
    db.close()