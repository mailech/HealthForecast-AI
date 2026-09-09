import pandas as pd
from sqlalchemy.orm import Session
from app.models import Patient, Prediction
from app.ml.model_service import model_service, FEATURES

def ensure_dataset_predictions(db: Session) -> int:
    total = db.query(Patient).filter(Patient.dataset_encounter_id.isnot(None)).count()
    if total == 0:
        return 0
    existing = db.query(Prediction.patient_id).join(Patient).filter(
        Patient.dataset_encounter_id.isnot(None)
    ).distinct().count()
    if existing >= total:
        return existing
    model_service.load_or_train()
    query = db.query(Patient).filter(Patient.dataset_encounter_id.isnot(None)).order_by(Patient.id)
    inserted = 0
    batch_size = 5000
    offset = 0
    while True:
        patients = query.offset(offset).limit(batch_size).all()
        if not patients:
            break
        ids = [p.id for p in patients]
        already = {x[0] for x in db.query(Prediction.patient_id).filter(Prediction.patient_id.in_(ids)).all()}
        missing = [p for p in patients if p.id not in already]
        if missing:
            X = pd.DataFrame([{f: float(getattr(p, f) or 0) for f in FEATURES} for p in missing], columns=FEATURES)
            probabilities = model_service.model.predict_proba(X)[:, 1]
            rows = []
            for p, probability in zip(missing, probabilities):
                probability = float(probability)
                category = "High" if probability >= 0.70 else "Medium" if probability >= 0.40 else "Low"
                rows.append(Prediction(patient_id=p.id, readmission_probability=probability, risk_category=category, model_version=model_service.version))
            db.add_all(rows)
            db.commit()
            inserted += len(rows)
        offset += len(patients)
    return existing + inserted
