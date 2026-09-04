from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.admission import Admission
from app.schemas.admission import AdmissionCreate, AdmissionUpdate, AdmissionResponse
from app.models.audit_log import AuditLog

router = APIRouter()


@router.get("/patient/{patient_id}", response_model=List[AdmissionResponse])
def get_patient_admissions(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "Hospital Administrator", "System Administrator"))
):
    admissions = db.query(Admission).filter(Admission.patient_id == patient_id).all()
    return [AdmissionResponse.from_orm(a) for a in admissions]


@router.get("/", response_model=List[AdmissionResponse])
def get_admissions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "Hospital Administrator", "System Administrator"))
):
    admissions = db.query(Admission).offset(skip).limit(limit).all()
    return [AdmissionResponse.from_orm(a) for a in admissions]


@router.get("/{admission_id}", response_model=AdmissionResponse)
def get_admission(
    admission_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "Hospital Administrator", "System Administrator"))
):
    admission = db.query(Admission).filter(Admission.id == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    return AdmissionResponse.from_orm(admission)


@router.post("/", response_model=AdmissionResponse)
def create_admission(
    admission_data: AdmissionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "System Administrator"))
):
    existing_admission = db.query(Admission).filter(
        Admission.admission_number == admission_data.admission_number
    ).first()
    if existing_admission:
        raise HTTPException(status_code=400, detail="Admission number already exists")
    
    new_admission = Admission(**admission_data.dict())
    db.add(new_admission)
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="CREATE_ADMISSION",
        entity_type="Admission",
        new_values=f"admission_number={admission_data.admission_number}, patient_id={admission_data.patient_id}"
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(new_admission)
    return AdmissionResponse.from_orm(new_admission)


@router.put("/{admission_id}", response_model=AdmissionResponse)
def update_admission(
    admission_id: int,
    admission_data: AdmissionUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "System Administrator"))
):
    admission = db.query(Admission).filter(Admission.id == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    
    old_values = f"admission_number={admission.admission_number}"
    
    for field, value in admission_data.dict(exclude_unset=True).items():
        setattr(admission, field, value)
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE_ADMISSION",
        entity_type="Admission",
        entity_id=admission_id,
        old_values=old_values,
        new_values=f"admission_number={admission.admission_number}"
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(admission)
    return AdmissionResponse.from_orm(admission)


@router.delete("/{admission_id}")
def delete_admission(
    admission_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("System Administrator"))
):
    admission = db.query(Admission).filter(Admission.id == admission_id).first()
    if not admission:
        raise HTTPException(status_code=404, detail="Admission not found")
    
    db.delete(admission)
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="DELETE_ADMISSION",
        entity_type="Admission",
        entity_id=admission_id,
        old_values=f"admission_number={admission.admission_number}"
    )
    db.add(audit_log)
    
    db.commit()
    return {"message": "Admission deleted successfully"}
