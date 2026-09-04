from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientUpdate, PatientResponse
from app.models.audit_log import AuditLog

router = APIRouter()


@router.get("/", response_model=List[PatientResponse])
def get_patients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "Hospital Administrator", "System Administrator"))
):
    query = db.query(Patient)
    
    if search:
        query = query.filter(
            (Patient.first_name.ilike(f"%{search}%")) |
            (Patient.last_name.ilike(f"%{search}%")) |
            (Patient.patient_id.ilike(f"%{search}%"))
        )
    
    if is_active is not None:
        query = query.filter(Patient.is_active == is_active)
    
    patients = query.offset(skip).limit(limit).all()
    return [PatientResponse.from_orm(p) for p in patients]


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "Hospital Administrator", "System Administrator"))
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return PatientResponse.from_orm(patient)


@router.post("/", response_model=PatientResponse)
def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "System Administrator"))
):
    existing_patient = db.query(Patient).filter(Patient.patient_id == patient_data.patient_id).first()
    if existing_patient:
        raise HTTPException(status_code=400, detail="Patient ID already exists")
    
    new_patient = Patient(**patient_data.dict())
    db.add(new_patient)
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="CREATE_PATIENT",
        entity_type="Patient",
        new_values=f"patient_id={patient_data.patient_id}, name={patient_data.first_name} {patient_data.last_name}"
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(new_patient)
    return PatientResponse.from_orm(new_patient)


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "System Administrator"))
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    old_values = f"first_name={patient.first_name}, last_name={patient.last_name}"
    
    for field, value in patient_data.dict(exclude_unset=True).items():
        setattr(patient, field, value)
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE_PATIENT",
        entity_type="Patient",
        entity_id=patient_id,
        old_values=old_values,
        new_values=f"first_name={patient.first_name}, last_name={patient.last_name}"
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(patient)
    return PatientResponse.from_orm(patient)


@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("System Administrator"))
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db.delete(patient)
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="DELETE_PATIENT",
        entity_type="Patient",
        entity_id=patient_id,
        old_values=f"patient_id={patient.patient_id}, name={patient.first_name} {patient.last_name}"
    )
    db.add(audit_log)
    
    db.commit()
    return {"message": "Patient deleted successfully"}
