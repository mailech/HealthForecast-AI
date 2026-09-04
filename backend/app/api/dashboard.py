from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_role
from app.models.patient import Patient
from app.models.admission import Admission
from app.schemas.dashboard import DashboardStats

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(require_role("Doctor", "Hospital Administrator", "System Administrator"))
):
    total_patients = db.query(func.count(Patient.id)).filter(Patient.is_active == True).scalar()
    
    total_admissions = db.query(func.count(Admission.id)).scalar()
    
    total_discharges = db.query(func.count(Admission.id)).filter(
        Admission.discharge_date.isnot(None)
    ).scalar()
    
    active_admissions = db.query(func.count(Admission.id)).filter(
        Admission.discharge_date.is_(None)
    ).scalar()
    
    readmissions = db.query(func.count(Admission.id)).filter(
        Admission.readmission_flag == 'Yes'
    ).scalar()
    
    readmission_rate = (readmissions / total_admissions * 100) if total_admissions > 0 else 0.0
    
    high_risk_patients = db.query(func.count(Patient.id)).filter(
        Patient.is_active == True
    ).scalar()
    
    return DashboardStats(
        total_patients=total_patients or 0,
        total_admissions=total_admissions or 0,
        total_discharges=total_discharges or 0,
        high_risk_patients=high_risk_patients or 0,
        readmission_rate=round(readmission_rate, 2),
        active_admissions=active_admissions or 0
    )
