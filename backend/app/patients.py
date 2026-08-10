from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from typing import Optional

from app.database import get_db
from app.security import get_current_user, require_role
from app import models

router = APIRouter(prefix="/patients", tags=["patients"])


class PatientCreate(BaseModel):
    full_name: str
    date_of_birth: date
    gender: str
    medical_record_number: str
    diagnosis: Optional[str] = None
    admission_date: Optional[date] = None
    discharge_date: Optional[date] = None
    assigned_doctor_id: Optional[int] = None


@router.post("/")
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("system_admin", "hospital_administrator")),
):
    new_patient = models.Patient(**patient.dict())
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient

@router.get("/")
def list_patients(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role == "system_admin":
        return db.query(models.Patient).all()

    elif current_user.role == "hospital_administrator":
        return db.query(models.Patient).all()

    elif current_user.role == "doctor":
        return db.query(models.Patient).filter(
            models.Patient.assigned_doctor_id == current_user.id
        ).all()

    elif current_user.role == "healthcare_researcher":
        patients = db.query(models.Patient).all()
        anonymized = []
        for p in patients:
            anonymized.append({
                "id": p.id,
                "gender": p.gender,
                "diagnosis": p.diagnosis,
                "admission_date": p.admission_date,
                "discharge_date": p.discharge_date,
            })
        return anonymized

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Role not recognized")