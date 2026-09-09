from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models import Patient, Treatment
from app.schemas.treatment import TreatmentCreate, TreatmentOut
from app.services.treatment_service import effectiveness_label

router = APIRouter(prefix="/treatments", tags=["Treatment Effectiveness"])


def can_access(user, patient):
    if user.role == "doctor":
        return patient.doctor_id == user.id
    if user.role in {"hospital_administrator", "healthcare_researcher"}:
        return patient.hospital == user.hospital
    return user.role == "system_administrator"


@router.post("", response_model=TreatmentOut)
def create(payload: TreatmentCreate, user=Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.get(Patient, payload.patient_id)
    if not patient:
        raise HTTPException(404, "Patient not found")
    if not can_access(user, patient):
        raise HTTPException(403, "Patient is outside your access scope")
    if user.role not in {"doctor", "hospital_administrator", "system_administrator"}:
        raise HTTPException(403, "Insufficient permissions")

    data = payload.model_dump()
    data["notes"] = f"{data['notes']} | Effectiveness: {effectiveness_label(data['effectiveness_score'])}"
    treatment = Treatment(**data)
    db.add(treatment)
    db.commit()
    db.refresh(treatment)
    return treatment


@router.get("/patient/{pid}", response_model=list[TreatmentOut])
def list_(pid: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    patient = db.get(Patient, pid)
    if not patient:
        raise HTTPException(404, "Patient not found")
    if not can_access(user, patient):
        raise HTTPException(403, "Patient is outside your access scope")
    return db.query(Treatment).filter(Treatment.patient_id == pid).all()
