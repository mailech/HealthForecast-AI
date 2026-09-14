from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import (
    can_access_patient,
    can_manage_patient_clinical_data,
    get_current_user,
    require_roles,
)
from app.database import get_db
from app.models.patient import Patient, Treatment
from app.models.user import User, UserRole
from app.schemas.patient import TreatmentCreate, TreatmentResponse, TreatmentUpdate
from app.services.treatment_service import TreatmentService

router = APIRouter(prefix="/treatments", tags=["Treatment Effectiveness & Recovery"])


@router.get("/effectiveness")
def get_treatment_effectiveness(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve hospital-wide medication effectiveness, recovery rates, and outcome distribution."""
    return TreatmentService.get_aggregate_effectiveness(db)


@router.get("/patient/{patient_id}")
def get_patient_treatments(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DOCTOR, UserRole.RESEARCHER])),
):
    """Get all treatment records for a patient with role-based access validation."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if not can_access_patient(current_user, patient):
        raise HTTPException(status_code=403, detail="Access denied to this patient's records")

    treatments = (
        db.query(Treatment)
        .filter(Treatment.patient_id == patient_id)
        .order_by(Treatment.start_date.desc())
        .all()
    )
    return treatments


@router.post("/patient/{patient_id}", response_model=TreatmentResponse)
def add_treatment(
    patient_id: int,
    treatment: TreatmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DOCTOR])),
):
    """Add a new treatment record for a patient (Doctors can only add for assigned patients)."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if not can_manage_patient_clinical_data(current_user, patient):
        raise HTTPException(
            status_code=403,
            detail="Access denied. You can only manage treatments for patients assigned to you.",
        )

    record = Treatment(
        patient_id=patient_id,
        medication=treatment.medication,
        dosage=treatment.dosage,
        status=treatment.status or "active",
        outcome=treatment.outcome,
        start_date=datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.put("/{treatment_id}", response_model=TreatmentResponse)
def update_treatment(
    treatment_id: int,
    update_data: TreatmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DOCTOR])),
):
    """Update a treatment record, record recovery outcome, or change status."""
    record = db.query(Treatment).filter(Treatment.id == treatment_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Treatment record not found")

    patient = db.query(Patient).filter(Patient.id == record.patient_id).first()
    if not patient or not can_manage_patient_clinical_data(current_user, patient):
        raise HTTPException(
            status_code=403,
            detail="Access denied. You can only modify treatments for patients assigned to you.",
        )

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(record, field, value)

    if update_data.status in ["completed", "discontinued"] and not record.end_date:
        record.end_date = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record


@router.get("/patient/{patient_id}/recovery-analysis")
def get_patient_recovery_analysis(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.DOCTOR, UserRole.RESEARCHER])),
):
    """Analyze patient recovery trajectory, response to medication, and personalized treatment recommendations."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if not can_access_patient(current_user, patient):
        raise HTTPException(status_code=403, detail="Access denied to this patient")

    analysis = TreatmentService.get_patient_recovery_analysis(db, patient)
    if current_user.role == UserRole.RESEARCHER:
        analysis["patient_name"] = None
        analysis["patient_code"] = f"ANON-{patient.id:06d}"
    return analysis
