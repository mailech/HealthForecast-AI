import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.rbac import Role, require_roles
from app.models.patient import Admission, Patient
from app.schemas.patient import AdmissionCreate, AdmissionOut

router = APIRouter(prefix="/admissions", tags=["admissions"])

_writers = require_roles(Role.DOCTOR, Role.HOSPITAL_ADMIN, Role.SYSTEM_ADMIN)


@router.post("", response_model=AdmissionOut, status_code=201)
def create_admission(payload: AdmissionCreate, db: Session = Depends(get_db), _=Depends(_writers)):
    if not db.get(Patient, payload.patient_id):
        raise HTTPException(status_code=404, detail="Patient not found")
    admission = Admission(**payload.model_dump())
    db.add(admission)
    db.commit()
    db.refresh(admission)
    return admission


@router.get("/patient/{patient_id}", response_model=list[AdmissionOut])
def list_admissions_for_patient(patient_id: uuid.UUID, db: Session = Depends(get_db), _=Depends(_writers)):
    return (
        db.query(Admission)
        .filter(Admission.patient_id == patient_id)
        .order_by(Admission.admitted_on.desc())
        .all()
    )
