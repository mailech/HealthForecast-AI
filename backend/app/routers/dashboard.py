from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.admission import Admission
from app.schemas.dashboard import (
    DashboardStats, ReadmissionOverview, DemographicsItem, TrendItem, DiagnosisItem, HospitalPerformance
)
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Healthcare Analytics Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patients_query = db.query(Patient)
    if current_user.role == UserRole.DOCTOR.value:
        patients_query = patients_query.filter(Patient.assigned_doctor_id == current_user.id)

    total_patients = patients_query.count()
    assigned_patients = db.query(Patient).filter(Patient.assigned_doctor_id == current_user.id).count() if current_user.role == UserRole.DOCTOR.value else total_patients

    all_admissions = db.query(Admission).all()
    if not all_admissions:
        return DashboardStats(
            total_patients=0,
            assigned_patients=0,
            high_risk_count=0,
            medium_risk_count=0,
            low_risk_count=0,
            readmission_rate_30_days=0.0,
            readmission_rate_over_30_days=0.0,
            avg_stay_days=0.0
        )

    high_risk = sum(1 for a in all_admissions if a.risk_category == "High")
    med_risk = sum(1 for a in all_admissions if a.risk_category == "Medium")
    low_risk = sum(1 for a in all_admissions if a.risk_category == "Low")

    readm_30 = sum(1 for a in all_admissions if a.readmitted == "<30")
    readm_over_30 = sum(1 for a in all_admissions if a.readmitted == ">30")
    total_adm = len(all_admissions)

    r_rate_30 = round((readm_30 / total_adm) * 100, 1) if total_adm > 0 else 0.0
    r_rate_over_30 = round((readm_over_30 / total_adm) * 100, 1) if total_adm > 0 else 0.0
    avg_stay = round(sum(a.time_in_hospital for a in all_admissions) / total_adm, 1) if total_adm > 0 else 0.0

    return DashboardStats(
        total_patients=total_patients,
        assigned_patients=assigned_patients,
        high_risk_count=high_risk,
        medium_risk_count=med_risk,
        low_risk_count=low_risk,
        readmission_rate_30_days=r_rate_30,
        readmission_rate_over_30_days=r_rate_over_30,
        avg_stay_days=avg_stay
    )

@router.get("/readmission-overview", response_model=List[ReadmissionOverview])
def get_readmission_overview(db: Session = Depends(get_db)):
    admissions = db.query(Admission).all()
    total = len(admissions) if admissions else 1

    counts = {"No Readmission": 0, "Readmitted <30 Days": 0, "Readmitted >30 Days": 0}
    for a in admissions:
        if a.readmitted == "<30":
            counts["Readmitted <30 Days"] += 1
        elif a.readmitted == ">30":
            counts["Readmitted >30 Days"] += 1
        else:
            counts["No Readmission"] += 1

    return [
        ReadmissionOverview(category=k, count=v, percentage=round((v / total) * 100, 1))
        for k, v in counts.items()
    ]

@router.get("/demographics", response_model=List[DemographicsItem])
def get_demographics(group_by: str = "age", db: Session = Depends(get_db)):
    if group_by == "gender":
        results = db.query(Patient.gender, func.count(Patient.id)).group_by(Patient.gender).all()
    elif group_by == "race":
        results = db.query(Patient.race, func.count(Patient.id)).group_by(Patient.race).all()
    else:
        results = db.query(Patient.age, func.count(Patient.id)).group_by(Patient.age).all()

    return [DemographicsItem(label=str(label), count=count) for label, count in results]

@router.get("/hospital-performance", response_model=List[HospitalPerformance])
def get_hospital_performance(db: Session = Depends(get_db)):
    specialties = db.query(Admission.medical_specialty).distinct().all()
    out = []
    for (spec,) in specialties:
        if not spec:
            continue
        adms = db.query(Admission).filter(Admission.medical_specialty == spec).all()
        if not adms:
            continue
        tot = len(adms)
        avg_days = sum(a.time_in_hospital for a in adms) / tot
        readm = sum(1 for a in adms if a.readmitted in ["<30", ">30"])
        high_r = sum(1 for a in adms if a.risk_category == "High")

        out.append(HospitalPerformance(
            department=spec,
            total_patients=tot,
            avg_days_in_hospital=round(avg_days, 1),
            readmission_rate=round((readm / tot) * 100, 1),
            high_risk_percentage=round((high_r / tot) * 100, 1)
        ))
    return out
