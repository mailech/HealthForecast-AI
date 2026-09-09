from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.ml.model_service import model_service
from app.models import Patient, Prediction
from app.schemas.prediction import PredictionOut, PredictionRequest

router = APIRouter(prefix="/predictions", tags=["Risk Prediction"])


def features(patient):
    return {
        key: getattr(patient, key)
        for key in [
            "age",
            "time_in_hospital",
            "num_lab_procedures",
            "num_procedures",
            "num_medications",
            "number_outpatient",
            "number_emergency",
            "number_inpatient",
            "number_diagnoses",
        ]
    }


def can_access(user, patient):
    # Shared historical dataset predictions are available to every
    # application role. Researcher views anonymize the patient data.
    if patient.dataset_encounter_id is not None:
        return user.role in {
            "doctor",
            "hospital_administrator",
            "healthcare_researcher",
            "system_administrator",
        }

    # Manually created patients remain scoped to their normal ownership.
    if user.role == "doctor":
        return patient.doctor_id == user.id
    if user.role in {"hospital_administrator", "healthcare_researcher"}:
        return patient.hospital == user.hospital
    return user.role == "system_administrator"


@router.post("/predict", response_model=PredictionOut)
def predict(payload: PredictionRequest, user=Depends(get_current_user)):
    if user.role not in {
        "doctor",
        "hospital_administrator",
        "healthcare_researcher",
        "system_administrator",
    }:
        raise HTTPException(403, "Insufficient permissions")
    probability, category, version = model_service.predict(payload.model_dump())
    return {
        "readmission_probability": round(probability, 4),
        "risk_category": category,
        "model_version": version,
    }


@router.post("/patients/{pid}", response_model=PredictionOut)
def predict_patient(pid: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.get(Patient, pid)
    if not patient:
        raise HTTPException(404, "Patient not found")
    if not can_access(user, patient):
        raise HTTPException(403, "Patient is outside your access scope")

    probability, category, version = model_service.predict(features(patient))
    db.add(
        Prediction(
            patient_id=pid,
            readmission_probability=probability,
            risk_category=category,
            model_version=version,
        )
    )
    db.commit()
    return {
        "patient_id": pid,
        "readmission_probability": round(probability, 4),
        "risk_category": category,
        "model_version": version,
    }


@router.get("/patients/{pid}", response_model=list[PredictionOut])
def history(pid: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.get(Patient, pid)
    if not patient:
        raise HTTPException(404, "Patient not found")
    if not can_access(user, patient):
        raise HTTPException(403, "Patient is outside your access scope")
    return (
        db.query(Prediction)
        .filter(Prediction.patient_id == pid)
        .order_by(Prediction.id.desc())
        .all()
    )
