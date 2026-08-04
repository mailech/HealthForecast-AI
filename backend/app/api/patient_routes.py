import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from app.database.database import get_db
from app.models.models import PatientDB
from app.schemas.schemas import PatientCreate, PatientResponse, PredictionInput
from app.services.risk_service import risk_service
from app.auth.auth import get_current_user

router = APIRouter(prefix="/patients", tags=["Patient Management"])

@router.get("", response_model=List[PatientResponse])
def get_patients(
    department: Optional[str] = None,
    risk_level: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(PatientDB)
    
    if department and department != "All Departments":
        query = query.filter(PatientDB.department == department)
        
    if risk_level and risk_level != "All Risk Levels":
        query = query.filter(PatientDB.risk_level == risk_level)
        
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (PatientDB.first_name.ilike(search_term)) |
            (PatientDB.last_name.ilike(search_term)) |
            (PatientDB.patient_code.ilike(search_term)) |
            (PatientDB.primary_diagnosis.ilike(search_term))
        )
        
    return query.all()

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient_by_id(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(PatientDB).filter(PatientDB.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.post("", response_model=PatientResponse)
def create_patient(patient_data: PatientCreate, db: Session = Depends(get_db)):
    code_number = random.randint(1000, 9999)
    patient_code = f"HF-{code_number}"
    
    # Calculate automated initial risk
    calc_input = PredictionInput(
        age=patient_data.age,
        prior_admissions=patient_data.prior_admissions,
        emergency_visits=patient_data.emergency_visits,
        length_of_stay=patient_data.length_of_stay,
        charlson_index=patient_data.charlson_index,
        lace_index=patient_data.lace_index,
        hba1c=patient_data.hba1c,
        serum_sodium=patient_data.serum_sodium,
        creatinine=patient_data.creatinine,
        polypharmacy_count=patient_data.polypharmacy_count
    )
    risk_res = risk_service.calculate_risk(calc_input)
    
    patient = PatientDB(
        patient_code=patient_code,
        first_name=patient_data.first_name,
        last_name=patient_data.last_name,
        age=patient_data.age,
        gender=patient_data.gender,
        department=patient_data.department,
        primary_diagnosis=patient_data.primary_diagnosis,
        admission_date=patient_data.admission_date,
        status=patient_data.status or "Admitted",
        prior_admissions=patient_data.prior_admissions,
        emergency_visits=patient_data.emergency_visits,
        length_of_stay=patient_data.length_of_stay,
        charlson_index=patient_data.charlson_index,
        lace_index=patient_data.lace_index,
        hba1c=patient_data.hba1c,
        serum_sodium=patient_data.serum_sodium,
        creatinine=patient_data.creatinine,
        polypharmacy_count=patient_data.polypharmacy_count,
        readmission_risk_score=risk_res.risk_score,
        risk_level=risk_res.risk_level
    )
    
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient
