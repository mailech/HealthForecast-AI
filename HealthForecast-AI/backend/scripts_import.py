from pathlib import Path
import sys
import re
import pandas as pd

from app.db.session import Base, engine, SessionLocal
from app.models import User, Patient

ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = Path(__import__("os").environ.get("HF_DATA_DIR", str(ROOT / "data")))
DATA = DATA_ROOT / "diabetic_data.csv"
MAPPING = DATA_ROOT / "IDS_mapping.csv"

def midpoint(value):
    m = re.match(r"\[(\d+)-(\d+)\)", str(value))
    return (int(m.group(1)) + int(m.group(2))) // 2 if m else 60

def load_mappings():
    # IDS_mapping.csv uses blank rows and section headers to separate
    # admission type, discharge disposition, and admission source mappings.
    raw = pd.read_csv(MAPPING, dtype=str, keep_default_na=False)
    maps = {"admission_type_id": {}, "discharge_disposition_id": {}, "admission_source_id": {}}
    sections = ["admission_type_id", "discharge_disposition_id", "admission_source_id"]
    section_index = 0
    for _, row in raw.iterrows():
        key = str(row.get("admission_type_id", "")).strip()
        desc = str(row.get("description", "")).strip()
        if key in {"discharge_disposition_id", "admission_source_id"}:
            section_index = sections.index(key)
            continue
        if key == "":
            continue
        if key.isdigit() and desc:
            maps[sections[section_index]][key] = desc
    return maps

def import_data():
    if not DATA.exists():
        raise SystemExit(f"Missing dataset: {DATA}")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        doctor = db.query(User).filter(User.email == "doctor@gmail.com").first()
        if not doctor:
            raise SystemExit("Run scripts/seed.py first.")
        existing = db.query(Patient).filter(Patient.dataset_encounter_id.isnot(None)).count()
        if existing:
            print(f"Dataset already imported: {existing} encounters.")
            return

        maps = load_mappings()
        df = pd.read_csv(DATA, low_memory=False, dtype={"encounter_id": str, "patient_nbr": str})
        rows = []
        for r in df.itertuples(index=False):
            admission_id = str(r.admission_type_id)
            discharge_id = str(r.discharge_disposition_id)
            source_id = str(r.admission_source_id)
            rows.append({
                "mrn": f"DM-{r.encounter_id}",
                "full_name": f"Dataset Patient {r.patient_nbr}",
                "age": midpoint(r.age),
                "gender": str(r.gender),
                "diagnosis": f"Diabetes / {str(r.diag_1)}",
                "doctor_id": doctor.id,
                "hospital": "Demo Hospital",
                "time_in_hospital": int(r.time_in_hospital),
                "num_lab_procedures": int(r.num_lab_procedures),
                "num_procedures": int(r.num_procedures),
                "num_medications": int(r.num_medications),
                "number_outpatient": int(r.number_outpatient),
                "number_emergency": int(r.number_emergency),
                "number_inpatient": int(r.number_inpatient),
                "number_diagnoses": int(r.number_diagnoses),
                "dataset_encounter_id": str(r.encounter_id),
                "dataset_patient_nbr": str(r.patient_nbr),
                "admission_type": maps.get("admission_type_id", {}).get(admission_id, admission_id),
                "discharge_disposition": maps.get("discharge_disposition_id", {}).get(discharge_id, discharge_id),
                "admission_source": maps.get("admission_source_id", {}).get(source_id, source_id),
                "readmitted": str(r.readmitted),
                "a1c_result": str(r.A1Cresult),
                "diabetes_med": str(r.diabetesMed),
                "medication_change": str(r.change),
                "insulin": str(r.insulin),
            })
            if len(rows) >= 2000:
                db.bulk_insert_mappings(Patient, rows)
                db.commit()
                rows.clear()
        if rows:
            db.bulk_insert_mappings(Patient, rows)
            db.commit()
        print(f"Imported {len(df)} encounters.")
    finally:
        db.close()

