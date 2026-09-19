from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import RoleChecker
from app.db.database import get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation
from app.models.treatment import Treatment
from app.models.user import User, UserRole
from app.schemas.report import AppointmentInfo, ReportResponse, TreatmentInfo

router = APIRouter(prefix="/reports", tags=["Reports"])
report_roles = RoleChecker([UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.RESEARCHER, UserRole.SYSTEM_ADMIN])


def default_insights_for(category: str | None) -> list[str]:
    if category == "High":
        return [
            "Review discharge readiness and medication reconciliation.",
            "Arrange follow-up contact within 48 hours of discharge.",
            "Schedule multidisciplinary care consultation for high-risk flags.",
        ]
    if category == "Medium":
        return [
            "Confirm follow-up appointment and care-plan understanding.",
            "Monitor unresolved clinical concerns and key lab parameters.",
        ]
    if category == "Low":
        return ["Continue routine discharge education and standard follow-up care."]
    return []


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

    # Stored recommendations for prediction if available
    insights = []
    if prediction:
        recs = (await db.execute(
            select(Recommendation).where(Recommendation.prediction_id == prediction.id)
        )).scalars().all()
        if recs:
            insights = [r.actionable_insight for r in recs]

    if not insights and category:
        insights = default_insights_for(category)

    # Treatment info if available
    treatment_record = await db.scalar(
        select(Treatment).where(Treatment.patient_id == patient_id)
    )
    treatment_info = None
    if treatment_record:
        treatment_info = TreatmentInfo(
            diagnosis=treatment_record.diagnosis,
            treatment_plan=treatment_record.treatment_plan,
        )
    elif patient.diagnosis:
        treatment_info = TreatmentInfo(
            diagnosis=patient.diagnosis,
            treatment_plan=None,
        )

    # Appointments info if available
    appts = (await db.execute(
        select(Appointment)
        .where(Appointment.patient_id == patient_id)
        .order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
    )).scalars().all()

    appointment_list = []
    for appt in appts:
        doc = await db.scalar(select(User).where(User.id == appt.doctor_id))
        doc_name = doc.full_name if doc else f"Doctor #{appt.doctor_id}"
        time_str = appt.appointment_time.strftime("%H:%M") if hasattr(appt.appointment_time, 'strftime') else str(appt.appointment_time)
        appointment_list.append(
            AppointmentInfo(
                id=appt.id,
                doctor_name=doc_name,
                appointment_date=appt.appointment_date.isoformat() if hasattr(appt.appointment_date, 'isoformat') else str(appt.appointment_date),
                appointment_time=time_str,
                status=appt.status,
                reminder_timing=appt.reminder_timing or "At appointment time",
            )
        )

    return ReportResponse(
        patient_id=patient.id,
        patient_name=f"{patient.first_name} {patient.last_name}",
        first_name=patient.first_name,
        last_name=patient.last_name,
        mrn=patient.mrn,
        age=patient.age,
        gender=patient.gender,
        diagnosis=patient.diagnosis,
        department=patient.department,
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
        insights=insights,
        treatment=treatment_info,
        appointments=appointment_list,
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
