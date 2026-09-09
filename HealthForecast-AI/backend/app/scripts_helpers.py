from app.db.session import SessionLocal
from app.models import Patient

def import_dataset_if_needed():
    db=SessionLocal()
    try:
        exists=db.query(Patient).filter(Patient.dataset_encounter_id.isnot(None)).first() is not None
    finally:
        db.close()
    if exists:
        return
    from scripts_import import import_data
    import_data()
