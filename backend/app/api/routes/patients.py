import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.core.rbac import Role, require_roles
from app.models.patient import Patient, PatientAssignment
from app.models.user import User
from app.schemas.patient import PatientAnonymizedOut, PatientCreate, PatientOut

router = APIRouter(prefix="/patients", tags=["patients"])


def _age_band(dob: date) -> str:
    age = (date.today() - dob).days // 365
    lower = (age // 10) * 10
    return f"{lower}-{lower + 9}"


@router.post("", response_model=PatientOut, status_code=status.HTTP_201_CREATED)
def create_patient(
    payload: PatientCreate,
    db: Session = Depends(get_db),
    _=Depends(require_roles(Role.HOSPITAL_ADMIN, Role.SYSTEM_ADMIN)),
):
    if db.query(Patient).filter(Patient.mrn == payload.mrn).first():
        raise HTTPException(status_code=409, detail="A patient with this MRN already exists")
    if payload.phone_number and db.query(Patient).filter(Patient.phone_number == payload.phone_number).first():
        raise HTTPException(status_code=409, detail="A patient with this phone number already exists")
    patient = Patient(**payload.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("")
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.DOCTOR, Role.HOSPITAL_ADMIN, Role.RESEARCHER, Role.SYSTEM_ADMIN)),
):
    """Scoping follows the Access Matrix exactly:
    - Doctor: assigned patients only, full detail
    - Hospital Admin / System Admin: full detail, all patients
    - Researcher: anonymized, all patients
    Patient-role accounts are excluded entirely — they use /me/* instead,
    which is scoped to their own record only.
    """
    if current_user.role == Role.RESEARCHER.value:
        patients = db.query(Patient).all()
        return [
            PatientAnonymizedOut(
                id=p.id, age_band=_age_band(p.date_of_birth), gender=p.gender,
                race=p.race, hospital_id=p.hospital_id,
            )
            for p in patients
        ]

    if current_user.role == Role.DOCTOR.value:
        patients = (
            db.query(Patient)
            .join(PatientAssignment, PatientAssignment.patient_id == Patient.id)
            .filter(PatientAssignment.doctor_id == current_user.id)
            .all()
        )
        return [PatientOut.model_validate(p) for p in patients]

    # hospital_admin, system_admin — the only roles left after the allowlist above
    patients = db.query(Patient).all()
    return [PatientOut.model_validate(p) for p in patients]


@router.get("/{patient_id}", response_model=PatientOut)
def get_patient(
    patient_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(Role.DOCTOR, Role.HOSPITAL_ADMIN, Role.SYSTEM_ADMIN)),
):
    """Researchers and patient-role accounts are excluded by the role
    allowlist above — researchers use the anonymized list endpoint,
    patients use /me/profile, scoped to their own record only."""
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if current_user.role == Role.DOCTOR.value:
        is_assigned = (
            db.query(PatientAssignment)
            .filter(PatientAssignment.patient_id == patient_id, PatientAssignment.doctor_id == current_user.id)
            .first()
        )
        if not is_assigned:
            raise HTTPException(status_code=403, detail="This patient is outside your assigned scope")

    return patient
