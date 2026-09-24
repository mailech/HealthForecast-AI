from datetime import date, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.analytics import (
    AnalyticsSummary,
    HospitalOperationsResponse,
    HospitalOperationsSummary,
    PatientFlowMetrics,
    DepartmentWorkloadItem,
    PatientRiskOverview,
)
from app.db.database import get_db
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.appointment import Appointment
from app.core.rbac import RoleChecker
from app.models.user import UserRole, User

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=AnalyticsSummary)
async def get_dashboard_analytics(
    _: UserRole = Depends(RoleChecker([UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """Return dashboard metrics calculated from stored patient predictions."""
    total_patients = await db.scalar(select(func.count(Patient.id))) or 0
    total_predictions = await db.scalar(select(func.count(Prediction.id))) or 0
    high_risk = await db.scalar(
        select(func.count(Prediction.id)).where(Prediction.risk_category == "High")
    ) or 0
    medium_risk = await db.scalar(
        select(func.count(Prediction.id)).where(Prediction.risk_category == "Medium")
    ) or 0
    low_risk = await db.scalar(
        select(func.count(Prediction.id)).where(Prediction.risk_category == "Low")
    ) or 0
    average_score = await db.scalar(select(func.avg(Prediction.readmission_risk_score))) or 0
    appointments_today = await db.scalar(
        select(func.count(Appointment.id)).where(Appointment.appointment_date == date.today())
    ) or 0

    recent_result = await db.execute(
        select(Prediction, Patient)
        .join(Patient, Patient.id == Prediction.patient_id)
        .order_by(Prediction.created_at.desc())
        .limit(10)
    )
    recent_predictions = [
        {
            "id": prediction.id,
            "patient_id": prediction.patient_id,
            "patient_name": f"{patient.first_name} {patient.last_name}",
            "risk_score": prediction.readmission_risk_score,
            "risk_category": prediction.risk_category,
            "created_at": prediction.created_at.isoformat(),
        }
        for prediction, patient in recent_result.all()
    ]

    return AnalyticsSummary(
        total_patients=total_patients,
        total_predictions=total_predictions,
        high_risk_patients=high_risk,
        average_risk_score=round(float(average_score), 2),
        readmission_rate=round((high_risk / total_predictions) * 100, 2) if total_predictions else 0.0,
        appointments_today=appointments_today,
        risk_distribution=[
            {"name": "Low", "value": low_risk},
            {"name": "Medium", "value": medium_risk},
            {"name": "High", "value": high_risk},
        ],
        recent_predictions=recent_predictions,
    )


@router.get("/operations", response_model=HospitalOperationsResponse)
async def get_hospital_operations(
    period: str = Query("this_week", description="Filter period: today, this_week, this_month"),
    _: User = Depends(RoleChecker([UserRole.HOSPITAL_ADMIN, UserRole.SYSTEM_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """
    Hospital Operations & Department Workload endpoint for Hospital Administrator.
    Returns real aggregate metrics calculated from actual database records.
    """
    today = date.today()
    if period == "today":
        start_date = today
        end_date = today
    elif period == "this_month":
        start_date = today.replace(day=1)
        if today.month == 12:
            next_month = today.replace(year=today.year + 1, month=1, day=1)
        else:
            next_month = today.replace(month=today.month + 1, day=1)
        end_date = next_month - timedelta(days=1)
    else:  # "this_week" default
        period = "this_week"
        start_date = today - timedelta(days=today.weekday())
        end_date = start_date + timedelta(days=6)

    # 1. Summary Metrics
    total_patients = await db.scalar(select(func.count(Patient.id))) or 0
    todays_appointments = await db.scalar(
        select(func.count(Appointment.id)).where(Appointment.appointment_date == today)
    ) or 0
    pending_appointments = await db.scalar(
        select(func.count(Appointment.id)).where(func.lower(Appointment.status).in_(["scheduled", "pending"]))
    ) or 0
    completed_appointments = await db.scalar(
        select(func.count(Appointment.id)).where(func.lower(Appointment.status) == "completed")
    ) or 0
    missed_appointments = await db.scalar(
        select(func.count(Appointment.id)).where(func.lower(Appointment.status).in_(["missed", "cancelled"]))
    ) or 0

    summary = HospitalOperationsSummary(
        total_patients=total_patients,
        todays_appointments=todays_appointments,
        pending_appointments=pending_appointments,
        completed_appointments=completed_appointments,
        missed_appointments=missed_appointments,
    )

    # 2. Patient Flow (Filtered by period)
    registered_patients = await db.scalar(
        select(func.count(Patient.id)).where(
            or_(
                and_(Patient.admission_date >= start_date, Patient.admission_date <= end_date),
                and_(func.date(Patient.created_at) >= start_date, func.date(Patient.created_at) <= end_date),
            )
        )
    ) or 0

    total_appts_period = await db.scalar(
        select(func.count(Appointment.id)).where(
            Appointment.appointment_date >= start_date,
            Appointment.appointment_date <= end_date,
        )
    ) or 0

    completed_appts_period = await db.scalar(
        select(func.count(Appointment.id)).where(
            Appointment.appointment_date >= start_date,
            Appointment.appointment_date <= end_date,
            func.lower(Appointment.status) == "completed",
        )
    ) or 0

    pending_appts_period = await db.scalar(
        select(func.count(Appointment.id)).where(
            Appointment.appointment_date >= start_date,
            Appointment.appointment_date <= end_date,
            func.lower(Appointment.status).in_(["scheduled", "pending"]),
        )
    ) or 0

    missed_appts_period = await db.scalar(
        select(func.count(Appointment.id)).where(
            Appointment.appointment_date >= start_date,
            Appointment.appointment_date <= end_date,
            func.lower(Appointment.status).in_(["missed", "cancelled"]),
        )
    ) or 0

    patient_flow = PatientFlowMetrics(
        period=period,
        registered_patients=registered_patients,
        total_appointments=total_appts_period,
        completed_appointments=completed_appts_period,
        pending_appointments=pending_appts_period,
        missed_appointments=missed_appts_period,
    )

    # 3. Department Workload
    dept_res = await db.execute(
        select(Patient.department).where(Patient.department.isnot(None), Patient.department != "").distinct()
    )
    depts = [d[0] for d in dept_res.all() if d[0]]

    dept_items = []
    for dept_name in depts:
        p_count = await db.scalar(
            select(func.count(Patient.id)).where(Patient.department == dept_name)
        ) or 0

        a_count = await db.scalar(
            select(func.count(Appointment.id))
            .join(Patient, Appointment.patient_id == Patient.id)
            .where(
                Patient.department == dept_name,
                Appointment.appointment_date >= start_date,
                Appointment.appointment_date <= end_date,
            )
        ) or 0

        dept_items.append(
            DepartmentWorkloadItem(
                name=dept_name,
                patient_count=p_count,
                appointment_count=a_count,
                total_workload=p_count + a_count,
            )
        )

    # Sort department items by total_workload descending
    dept_items.sort(key=lambda x: x.total_workload, reverse=True)

    # 4. Patient Risk Overview (stored latest risk predictions)
    subq = (
        select(
            Prediction.patient_id,
            func.max(Prediction.id).label("max_id")
        )
        .group_by(Prediction.patient_id)
        .subquery()
    )

    pred_res = await db.execute(
        select(Prediction.risk_category, func.count(Prediction.id))
        .join(subq, Prediction.id == subq.c.max_id)
        .group_by(Prediction.risk_category)
    )

    counts = {cat: count for cat, count in pred_res.all()}
    high_r = counts.get("High", 0)
    med_r = counts.get("Medium", 0)
    low_r = counts.get("Low", 0)

    risk_overview = PatientRiskOverview(
        high_risk=high_r,
        medium_risk=med_r,
        low_risk=low_r,
        total_evaluated=high_r + med_r + low_r,
    )

    return HospitalOperationsResponse(
        summary=summary,
        patient_flow=patient_flow,
        department_workload=dept_items,
        risk_overview=risk_overview,
    )