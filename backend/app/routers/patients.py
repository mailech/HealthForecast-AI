import json
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import can_access_patient, can_modify_patient, can_view_pii, get_current_user, require_roles
from app.database import get_db
from app.models.patient import Admission, MedicalHistory, Patient, Treatment
from app.models.user import User, UserRole
from app.schemas.patient import (
    AdmissionCreate,
    AdmissionResponse,
    MedicalHistoryCreate,
    MedicalHistoryResponse,
    PatientCreate,
    PatientDetailResponse,
    PatientResponse,
    PatientUpdate,
    TreatmentCreate,
    TreatmentResponse,
)
from app.services.names import generate_patient_name
from app.services.prediction_service import anonymize_patient

router = APIRouter(prefix="/patients", tags=["Patient Management"])


def _serialize_patient(patient: Patient, user: User) -> dict:
    if user.role == UserRole.RESEARCHER:
        return anonymize_patient(patient)
    data = PatientResponse.model_validate(patient).model_dump()
    return data


@router.get("/", response_model=List[PatientResponse])
def list_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Patient)
    if current_user.role == UserRole.DOCTOR:
        query = query.filter(Patient.assigned_doctor_id == current_user.id)

    patients = query.offset(skip).limit(limit).all()
    if current_user.role == UserRole.RESEARCHER:
        return [anonymize_patient(p) for p in patients]
    return patients


@router.get("/{patient_id}", response_model=PatientDetailResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if not can_access_patient(current_user, patient):
        raise HTTPException(status_code=403, detail="Access denied to this patient")

    if current_user.role == UserRole.RESEARCHER:
        base = anonymize_patient(patient)
        return {**base, "medical_history": [], "treatments": [], "admissions": []}
    return patient


@router.post("/", response_model=PatientResponse)
def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.SYSTEM_ADMIN, UserRole.DOCTOR])),
):
    if db.query(Patient).filter(Patient.patient_id == patient_data.patient_id).first():
        raise HTTPException(status_code=400, detail="Patient ID already exists")
    patient = Patient(**patient_data.model_dump())
    if not patient.full_name:
        patient.full_name = generate_patient_name(patient.patient_id, patient.gender)
    if current_user.role == UserRole.DOCTOR:
        patient.assigned_doctor_id = current_user.id
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not can_modify_patient(current_user):
        raise HTTPException(status_code=403, detail="Cannot modify patient records")
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if current_user.role == UserRole.DOCTOR and patient.assigned_doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not assigned to this patient")

    for field, value in patient_data.model_dump(exclude_unset=True).items():
        setattr(patient, field, value)
    db.commit()
    db.refresh(patient)
    return patient


@router.post("/{patient_id}/medical-history", response_model=MedicalHistoryResponse)
def add_medical_history(
    patient_id: int,
    history: MedicalHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DOCTOR, UserRole.SYSTEM_ADMIN])),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    record = MedicalHistory(patient_id=patient_id, **history.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/{patient_id}/treatments", response_model=TreatmentResponse)
def add_treatment(
    patient_id: int,
    treatment: TreatmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DOCTOR, UserRole.SYSTEM_ADMIN])),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    record = Treatment(patient_id=patient_id, **treatment.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.post("/{patient_id}/admissions", response_model=AdmissionResponse)
def add_admission(
    patient_id: int,
    admission: AdmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DOCTOR, UserRole.SYSTEM_ADMIN, UserRole.HOSPITAL_ADMIN])),
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    record = Admission(patient_id=patient_id, **admission.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
