from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.rbac import Role, require_roles
from app.db.session import get_db
from app.models.patient import Admission, Bill, Patient, RiskScore
from app.models.user import User
from app.schemas.patient import AdmissionOut, BillOut, PatientOut, RiskScoreOut

router = APIRouter(prefix="/me", tags=["patient-self-service"])

_patient_only = require_roles(Role.PATIENT)


def _own_patient_id(current_user: User) -> str:
    if not current_user.patient_id:
        raise HTTPException(status_code=403, detail="This account is not linked to a patient record")
    return current_user.patient_id


@router.get("/profile", response_model=PatientOut)
def my_profile(db: Session = Depends(get_db), current_user: User = Depends(_patient_only)):
    patient_id = _own_patient_id(current_user)
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Linked patient record not found")
    return patient


@router.get("/admissions", response_model=list[AdmissionOut])
def my_admissions(db: Session = Depends(get_db), current_user: User = Depends(_patient_only)):
    patient_id = _own_patient_id(current_user)
    return (
        db.query(Admission)
        .filter(Admission.patient_id == patient_id)
        .order_by(Admission.admitted_on.desc())
        .all()
    )


@router.get("/risk-status", response_model=list[RiskScoreOut])
def my_risk_status(db: Session = Depends(get_db), current_user: User = Depends(_patient_only)):
    patient_id = _own_patient_id(current_user)
    return (
        db.query(RiskScore)
        .filter(RiskScore.patient_id == patient_id)
        .order_by(RiskScore.generated_at.desc())
        .all()
    )


@router.get("/bills", response_model=list[BillOut])
def my_bills(db: Session = Depends(get_db), current_user: User = Depends(_patient_only)):
    patient_id = _own_patient_id(current_user)
    return db.query(Bill).filter(Bill.patient_id == patient_id).order_by(Bill.issued_on.desc()).all()
