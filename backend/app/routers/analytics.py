from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.analytics import AnalyticsSummary
from app.db.database import get_db
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.appointment import Appointment
from datetime import date
from app.core.rbac import RoleChecker
from app.models.user import UserRole

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