from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.medical_history import MedicalHistory
from app.schemas.medical_history import MedicalHistoryCreate, MedicalHistoryUpdate, MedicalHistoryResponse
from app.models.audit_log import AuditLog

router = APIRouter()


@router.get("/patient/{patient_id}", response_model=List[MedicalHistoryResponse])
def get_patient_medical_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "Hospital Administrator", "System Administrator"))
):
    history = db.query(MedicalHistory).filter(MedicalHistory.patient_id == patient_id).all()
    return [MedicalHistoryResponse.from_orm(h) for h in history]


@router.get("/{history_id}", response_model=MedicalHistoryResponse)
def get_medical_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "Hospital Administrator", "System Administrator"))
):
    history = db.query(MedicalHistory).filter(MedicalHistory.id == history_id).first()
    if not history:
        raise HTTPException(status_code=404, detail="Medical history not found")
    return MedicalHistoryResponse.from_orm(history)


@router.post("/", response_model=MedicalHistoryResponse)
def create_medical_history(
    history_data: MedicalHistoryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "System Administrator"))
):
    new_history = MedicalHistory(**history_data.dict())
    db.add(new_history)
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="CREATE_MEDICAL_HISTORY",
        entity_type="MedicalHistory",
        new_values=f"patient_id={history_data.patient_id}, condition={history_data.condition}"
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(new_history)
    return MedicalHistoryResponse.from_orm(new_history)


@router.put("/{history_id}", response_model=MedicalHistoryResponse)
def update_medical_history(
    history_id: int,
    history_data: MedicalHistoryUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "System Administrator"))
):
    history = db.query(MedicalHistory).filter(MedicalHistory.id == history_id).first()
    if not history:
        raise HTTPException(status_code=404, detail="Medical history not found")
    
    old_values = f"condition={history.condition}"
    
    for field, value in history_data.dict(exclude_unset=True).items():
        setattr(history, field, value)
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE_MEDICAL_HISTORY",
        entity_type="MedicalHistory",
        entity_id=history_id,
        old_values=old_values,
        new_values=f"condition={history.condition}"
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(history)
    return MedicalHistoryResponse.from_orm(history)


@router.delete("/{history_id}")
def delete_medical_history(
    history_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("System Administrator"))
):
    history = db.query(MedicalHistory).filter(MedicalHistory.id == history_id).first()
    if not history:
        raise HTTPException(status_code=404, detail="Medical history not found")
    
    db.delete(history)
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="DELETE_MEDICAL_HISTORY",
        entity_type="MedicalHistory",
        entity_id=history_id,
        old_values=f"condition={history.condition}"
    )
    db.add(audit_log)
    
    db.commit()
    return {"message": "Medical history deleted successfully"}
