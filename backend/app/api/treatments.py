from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.treatment import Treatment
from app.schemas.treatment import TreatmentCreate, TreatmentUpdate, TreatmentResponse
from app.models.audit_log import AuditLog

router = APIRouter()


@router.get("/patient/{patient_id}", response_model=List[TreatmentResponse])
def get_patient_treatments(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "Hospital Administrator", "System Administrator"))
):
    treatments = db.query(Treatment).filter(Treatment.patient_id == patient_id).all()
    return [TreatmentResponse.from_orm(t) for t in treatments]


@router.get("/admission/{admission_id}", response_model=List[TreatmentResponse])
def get_admission_treatments(
    admission_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "Hospital Administrator", "System Administrator"))
):
    treatments = db.query(Treatment).filter(Treatment.admission_id == admission_id).all()
    return [TreatmentResponse.from_orm(t) for t in treatments]


@router.get("/", response_model=List[TreatmentResponse])
def get_treatments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "Hospital Administrator", "System Administrator"))
):
    treatments = db.query(Treatment).offset(skip).limit(limit).all()
    return [TreatmentResponse.from_orm(t) for t in treatments]


@router.get("/{treatment_id}", response_model=TreatmentResponse)
def get_treatment(
    treatment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "Hospital Administrator", "System Administrator"))
):
    treatment = db.query(Treatment).filter(Treatment.id == treatment_id).first()
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    return TreatmentResponse.from_orm(treatment)


@router.post("/", response_model=TreatmentResponse)
def create_treatment(
    treatment_data: TreatmentCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "System Administrator"))
):
    new_treatment = Treatment(**treatment_data.dict())
    db.add(new_treatment)
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="CREATE_TREATMENT",
        entity_type="Treatment",
        new_values=f"patient_id={treatment_data.patient_id}, treatment_name={treatment_data.treatment_name}"
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(new_treatment)
    return TreatmentResponse.from_orm(new_treatment)


@router.put("/{treatment_id}", response_model=TreatmentResponse)
def update_treatment(
    treatment_id: int,
    treatment_data: TreatmentUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "System Administrator"))
):
    treatment = db.query(Treatment).filter(Treatment.id == treatment_id).first()
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    
    old_values = f"treatment_name={treatment.treatment_name}"
    
    for field, value in treatment_data.dict(exclude_unset=True).items():
        setattr(treatment, field, value)
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="UPDATE_TREATMENT",
        entity_type="Treatment",
        entity_id=treatment_id,
        old_values=old_values,
        new_values=f"treatment_name={treatment.treatment_name}"
    )
    db.add(audit_log)
    
    db.commit()
    db.refresh(treatment)
    return TreatmentResponse.from_orm(treatment)


@router.delete("/{treatment_id}")
def delete_treatment(
    treatment_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role("System Administrator"))
):
    treatment = db.query(Treatment).filter(Treatment.id == treatment_id).first()
    if not treatment:
        raise HTTPException(status_code=404, detail="Treatment not found")
    
    db.delete(treatment)
    
    audit_log = AuditLog(
        user_id=current_user.id,
        action="DELETE_TREATMENT",
        entity_type="Treatment",
        entity_id=treatment_id,
        old_values=f"treatment_name={treatment.treatment_name}"
    )
    db.add(audit_log)
    
    db.commit()
    return {"message": "Treatment deleted successfully"}
