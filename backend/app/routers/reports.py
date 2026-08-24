from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import RoleChecker
from app.db.database import get_db
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.user import UserRole
from app.schemas.report import ReportResponse

router = APIRouter(prefix="/reports", tags=["Reports"])
report_roles = RoleChecker([UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN])


def insights_for(category: str | None) -> list[str]:
    if category == "High":
        return ["Review discharge readiness and medication reconciliation.", "Arrange follow-up contact before discharge."]
    if category == "Medium":
        return ["Confirm follow-up appointment and care-plan understanding.", "Monitor unresolved clinical concerns."]
    if category == "Low":
        return ["Continue routine discharge education and standard follow-up."]
    return ["Run a readmission prediction to generate risk-based insights."]


@router.get("/{patient_id}", response_model=ReportResponse)
async def get_patient_report(
    patient_id: int,
    _: UserRole = Depends(report_roles),
    db: AsyncSession = Depends(get_db),
):
    patient = await db.scalar(select(Patient).where(Patient.id == patient_id))
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    prediction = await db.scalar(
        select(Prediction).where(Prediction.patient_id == patient_id).order_by(Prediction.created_at.desc())
    )
    category = prediction.risk_category if prediction else None
    return ReportResponse(
        patient_id=patient.id,
        patient_name=f"{patient.first_name} {patient.last_name}",
        mrn=patient.mrn,
        age=patient.age,
        gender=patient.gender,
        admission_date=patient.admission_date.isoformat() if patient.admission_date else None,
        prediction_id=prediction.id if prediction else None,
        risk_score=prediction.readmission_risk_score if prediction else None,
        risk_category=category,
        model_version=prediction.model_version if prediction else None,
        prediction_date=prediction.created_at if prediction else None,
        summary=(
            f"Latest forecast is {category.lower()} risk at {prediction.readmission_risk_score}%."
            if prediction else "No readmission forecast has been recorded for this patient."
        ),
        insights=insights_for(category),
    )


@router.get("/", response_model=list[ReportResponse])
async def list_patient_reports(
    _: UserRole = Depends(report_roles),
    db: AsyncSession = Depends(get_db),
):
    patients = (await db.execute(select(Patient).order_by(Patient.id))).scalars().all()
    reports = []
    for patient in patients:
        reports.append(await get_patient_report(patient.id, _, db))
    return reports
