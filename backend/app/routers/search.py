from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, or_, cast, String
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rbac import get_current_user
from app.db.database import get_db
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.prediction import Prediction
from app.models.user import User, UserRole

router = APIRouter(prefix="/search", tags=["Global Search"])


class SearchResultItem(BaseModel):
    category: str  # 'patient', 'appointment', 'prediction', 'report', 'treatment'
    id: int
    title: str
    subtitle: str
    route: str
    metadata: Optional[dict] = None


@router.get("/", response_model=List[SearchResultItem])
async def global_search(
    q: str = Query(..., min_length=1, max_length=100, description="Search query"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Unified global search across authorized patients, appointments, predictions, and reports."""
    query_str = q.strip()
    if not query_str:
        return []

    pattern = f"%{query_str}%"
    results: List[SearchResultItem] = []

    # 1. Search Patients (Doctors, Hospital Admins, System Admins)
    if current_user.role in [UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SYSTEM_ADMIN]:
        patient_conditions = [
            Patient.first_name.ilike(pattern),
            Patient.last_name.ilike(pattern),
            Patient.mrn.ilike(pattern),
            Patient.diagnosis.ilike(pattern),
            Patient.department.ilike(pattern),
        ]
        if query_str.isdigit():
            patient_conditions.append(Patient.id == int(query_str))

        patient_stmt = select(Patient).where(or_(*patient_conditions)).limit(6)
        patients = (await db.execute(patient_stmt)).scalars().all()

        for p in patients:
            results.append(
                SearchResultItem(
                    category="patient",
                    id=p.id,
                    title=f"{p.first_name} {p.last_name}",
                    subtitle=f"ID #{p.id} • Dept: {p.department or 'General'} • Diagnosis: {p.diagnosis or 'N/A'}",
                    route="/patients",
                    metadata={"patient_id": p.id, "name": f"{p.first_name} {p.last_name}"},
                )
            )

    # 2. Search Appointments (Doctors, Hospital Admins, System Admins)
    if current_user.role in [UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SYSTEM_ADMIN]:
        appt_stmt = (
            select(Appointment, Patient)
            .join(Patient, Appointment.patient_id == Patient.id)
            .limit(10)
        )
        if current_user.role == UserRole.DOCTOR:
            appt_stmt = appt_stmt.where(Appointment.doctor_id == current_user.id)

        appt_rows = (await db.execute(appt_stmt)).all()
        for appt, pat in appt_rows:
            pat_name = f"{pat.first_name} {pat.last_name}"
            date_str = str(appt.appointment_date)
            status_str = appt.status.lower()
            if (
                query_str.lower() in pat_name.lower()
                or query_str.lower() in date_str
                or query_str.lower() in status_str
                or (query_str.isdigit() and appt.id == int(query_str))
            ):
                results.append(
                    SearchResultItem(
                        category="appointment",
                        id=appt.id,
                        title=f"Appointment: {pat_name}",
                        subtitle=f"{date_str} at {appt.appointment_time} • Status: {appt.status}",
                        route="/appointments",
                        metadata={"appointment_id": appt.id, "patient_id": pat.id},
                    )
                )

    # 3. Search Predictions (Doctors, Hospital Admins, Researchers, System Admins)
    pred_stmt = (
        select(Prediction, Patient)
        .join(Patient, Prediction.patient_id == Patient.id)
        .limit(10)
    )
    pred_rows = (await db.execute(pred_stmt)).all()
    for pred, pat in pred_rows:
        pat_name = f"{pat.first_name} {pat.last_name}"
        risk_str = pred.risk_category.lower()
        if (
            query_str.lower() in pat_name.lower()
            or query_str.lower() in risk_str
            or (query_str.isdigit() and (pred.id == int(query_str) or pred.patient_id == int(query_str)))
        ):
            results.append(
                SearchResultItem(
                    category="prediction",
                    id=pred.id,
                    title=f"Risk Prediction: {pat_name}",
                    subtitle=f"Risk: {pred.risk_category} ({pred.readmission_risk_score:.1f}%) • Model: {pred.model_version}",
                    route="/risk-analyzer",
                    metadata={"prediction_id": pred.id, "patient_id": pat.id},
                )
            )

    # 4. Search Reports
    if any(k in query_str.lower() for k in ["report", "readmission", "analytic", "dataset", "export", "risk", "summary"]):
        results.append(
            SearchResultItem(
                category="report",
                id=1,
                title=f"Clinical Analytics & Risk Report",
                subtitle="Aggregated hospital and patient readmission intelligence",
                route="/reports",
            )
        )

    return results[:12]

