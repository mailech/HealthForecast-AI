from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.patient import PatientCreate, PatientResponse, TimelineEvent
from app.core.rbac import RoleChecker
from app.db.database import get_db
from app.services.patient_service import PatientService
from app.services.report_parser_service import ReportParserService

from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.recommendation import Recommendation
from app.models.appointment import Appointment
from app.models.treatment import Treatment
from app.models.medical_report import MedicalReport
from app.models.user import User, UserRole


router = APIRouter(
    prefix="/patients",
    tags=["Patients"]
)


# ============================================================
# GET ALL PATIENTS
# ============================================================
@router.get(
    "/",
    response_model=list[PatientResponse],
    dependencies=[
        Depends(
            RoleChecker([
                UserRole.DOCTOR,
                UserRole.HOSPITAL_ADMIN,
                UserRole.RESEARCHER,
                UserRole.SYSTEM_ADMIN
            ])
        )
    ]
)
async def list_patients(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Patient).order_by(Patient.id)
    )

    patients = result.scalars().all()

    response_list = []

    for patient in patients:
        latest_pred = await db.scalar(
            select(Prediction)
            .where(
                Prediction.patient_id == patient.id
            )
            .order_by(
                Prediction.created_at.desc()
            )
        )

        response_list.append(
            PatientResponse(
                id=patient.id,
                mrn=patient.mrn,
                first_name=patient.first_name,
                last_name=patient.last_name,
                gender=patient.gender,
                age=patient.age,
                diagnosis=patient.diagnosis,
                department=patient.department,
                admission_date=patient.admission_date,
                risk_category=(
                    latest_pred.risk_category
                    if latest_pred
                    else None
                ),
                risk_score=(
                    latest_pred.readmission_risk_score
                    if latest_pred
                    else None
                ),
            )
        )

    return response_list


# ============================================================
# GET ONE PATIENT
# ============================================================
@router.get(
    "/{patient_id}",
    response_model=PatientResponse
)
async def get_patient(
    patient_id: int,

    _: UserRole = Depends(
        RoleChecker([
            UserRole.DOCTOR,
            UserRole.HOSPITAL_ADMIN,
            UserRole.RESEARCHER,
            UserRole.SYSTEM_ADMIN
        ])
    ),

    db: AsyncSession = Depends(get_db),
):
    patient = await PatientService.get_patient_by_id(
        db,
        patient_id
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    latest_pred = await db.scalar(
        select(Prediction)
        .where(
            Prediction.patient_id == patient.id
        )
        .order_by(
            Prediction.created_at.desc()
        )
    )

    return PatientResponse(
        id=patient.id,
        mrn=patient.mrn,
        first_name=patient.first_name,
        last_name=patient.last_name,
        gender=patient.gender,
        age=patient.age,
        diagnosis=patient.diagnosis,
        department=patient.department,
        admission_date=patient.admission_date,
        risk_category=(
            latest_pred.risk_category
            if latest_pred
            else None
        ),
        risk_score=(
            latest_pred.readmission_risk_score
            if latest_pred
            else None
        ),
    )


# ============================================================
# CREATE PATIENT
# ============================================================
@router.post(
    "/",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_patient(
    patient_in: PatientCreate,

    _: UserRole = Depends(
        RoleChecker([
            UserRole.DOCTOR,
            UserRole.HOSPITAL_ADMIN,
            UserRole.SYSTEM_ADMIN
        ])
    ),

    db: AsyncSession = Depends(get_db),
):
    return await PatientService.create_patient(
        db,
        patient_in
    )


# ============================================================
# DELETE PATIENT PERMANENTLY
# ============================================================
@router.delete(
    "/{patient_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
async def delete_patient(
    patient_id: int,

    _: UserRole = Depends(
        RoleChecker([
            UserRole.DOCTOR,
            UserRole.HOSPITAL_ADMIN,
            UserRole.SYSTEM_ADMIN
        ])
    ),

    db: AsyncSession = Depends(get_db),
):
    # --------------------------------------------------------
    # Check whether patient exists
    # --------------------------------------------------------
    patient = await PatientService.get_patient_by_id(
        db,
        patient_id
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    try:
        # ----------------------------------------------------
        # 1. Get prediction IDs belonging to this patient
        # ----------------------------------------------------
        prediction_ids = (
            select(Prediction.id)
            .where(
                Prediction.patient_id == patient_id
            )
        )

        # ----------------------------------------------------
        # 2. Delete recommendations
        # Recommendations depend on predictions
        # ----------------------------------------------------
        await db.execute(
            delete(Recommendation)
            .where(
                Recommendation.prediction_id.in_(
                    prediction_ids
                )
            )
        )

        # ----------------------------------------------------
        # 3. Delete predictions
        # ----------------------------------------------------
        await db.execute(
            delete(Prediction)
            .where(
                Prediction.patient_id == patient_id
            )
        )

        # ----------------------------------------------------
        # 4. Delete appointments
        # ----------------------------------------------------
        await db.execute(
            delete(Appointment)
            .where(
                Appointment.patient_id == patient_id
            )
        )

        # ----------------------------------------------------
        # 5. Delete treatments
        # ----------------------------------------------------
        await db.execute(
            delete(Treatment)
            .where(
                Treatment.patient_id == patient_id
            )
        )

        # ----------------------------------------------------
        # 6. Delete patient
        # ----------------------------------------------------
        await db.delete(patient)

        # ----------------------------------------------------
        # 7. Commit permanent deletion
        # ----------------------------------------------------
        await db.commit()

        return None

    except Exception as e:
        # ----------------------------------------------------
        # Rollback if any deletion fails
        # ----------------------------------------------------
        await db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete patient: {str(e)}"
        )


# ============================================================
# GET PATIENT CLINICAL ACTIVITY TIMELINE
# ============================================================
@router.get(
    "/{patient_id}/timeline",
    response_model=list[TimelineEvent],
)
async def get_patient_timeline(
    patient_id: int,
    _: UserRole = Depends(
        RoleChecker([
            UserRole.DOCTOR,
            UserRole.HOSPITAL_ADMIN,
            UserRole.RESEARCHER,
            UserRole.SYSTEM_ADMIN
        ])
    ),
    db: AsyncSession = Depends(get_db),
):
    patient = await PatientService.get_patient_by_id(db, patient_id)
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    events: list[TimelineEvent] = []

    # 1. Patient Record Creation / Registration
    reg_time = patient.created_at.isoformat() if hasattr(patient, "created_at") and patient.created_at else None
    if not reg_time and patient.admission_date:
        reg_time = f"{patient.admission_date.isoformat()}T08:00:00+00:00"

    if reg_time:
        events.append(TimelineEvent(
            id=f"reg_{patient.id}",
            event_type="patient_registered",
            title="Patient Record Created",
            timestamp=reg_time,
            icon="user",
            description=f"Patient {patient.first_name} {patient.last_name} registered in hospital system.",
            details={
                "mrn": patient.mrn,
                "department": patient.department or "General Medicine",
                "diagnosis": patient.diagnosis or "Unspecified",
            }
        ))

    # 2. Medical Reports & Extracted Information
    med_reports = (await db.execute(
        select(MedicalReport)
        .where(MedicalReport.patient_id == patient_id)
        .order_by(MedicalReport.created_at.desc())
    )).scalars().all()

    for mr in med_reports:
        doc_user = await db.scalar(select(User).where(User.id == mr.uploaded_by_id))
        uploader_name = doc_user.full_name if doc_user else f"Doctor #{mr.uploaded_by_id}"
        report_ts = mr.created_at.isoformat() if mr.created_at else None

        if report_ts:
            events.append(TimelineEvent(
                id=f"upload_{mr.id}",
                event_type="medical_report_uploaded",
                title="Medical Report Uploaded",
                timestamp=report_ts,
                icon="file",
                description="Previous medical report was uploaded for clinical analysis.",
                details={
                    "file_name": mr.file_name,
                    "file_type": mr.file_type.upper(),
                    "file_size": f"{(mr.file_size / 1024):.1f} KB",
                    "uploaded_by": uploader_name,
                }
            ))

            # Check extracted fields
            if mr.extracted_text:
                try:
                    ext = ReportParserService.parse_clinical_text(mr.extracted_text)
                    has_ext = (
                        ext.prior_admissions is not None or
                        ext.length_of_stay is not None or
                        ext.diagnosis is not None or
                        ext.age is not None
                    )
                    if has_ext:
                        events.append(TimelineEvent(
                            id=f"extract_{mr.id}",
                            event_type="clinical_info_extracted",
                            title="Clinical Information Extracted",
                            timestamp=report_ts,
                            icon="extraction",
                            description="Extracted clinical parameters from medical report.",
                            details={
                                "prior_admissions": ext.prior_admissions,
                                "prior_admissions_source": ext.prior_admissions_source,
                                "length_of_stay": ext.length_of_stay,
                                "length_of_stay_source": ext.length_of_stay_source,
                                "diagnosis": ext.diagnosis,
                                "age": ext.age,
                            }
                        ))
                except Exception:
                    pass

    # 3. Risk Predictions History
    predictions = (await db.execute(
        select(Prediction)
        .where(Prediction.patient_id == patient_id)
        .order_by(Prediction.created_at.desc())
    )).scalars().all()

    for pred in predictions:
        pred_ts = pred.created_at.isoformat() if pred.created_at else None
        if pred_ts:
            events.append(TimelineEvent(
                id=f"pred_{pred.id}",
                event_type="risk_prediction_generated",
                title="Risk Prediction Generated",
                timestamp=pred_ts,
                icon="activity",
                description="ML readmission risk assessment evaluated.",
                details={
                    "risk_score": pred.readmission_risk_score,
                    "risk_category": pred.risk_category,
                    "model_version": pred.model_version or "v1.0.0",
                    "prior_admissions": pred.prior_admissions,
                    "length_of_stay": pred.length_of_stay,
                }
            ))

    # 4. Appointments History
    appointments = (await db.execute(
        select(Appointment)
        .where(Appointment.patient_id == patient_id)
        .order_by(Appointment.appointment_date.desc(), Appointment.appointment_time.desc())
    )).scalars().all()

    for appt in appointments:
        doc = await db.scalar(select(User).where(User.id == appt.doctor_id))
        doc_name = doc.full_name if doc else f"Doctor #{appt.doctor_id}"
        appt_time_str = appt.appointment_time.strftime("%H:%M:%S") if hasattr(appt.appointment_time, "strftime") else str(appt.appointment_time)
        appt_date_str = appt.appointment_date.isoformat() if hasattr(appt.appointment_date, "isoformat") else str(appt.appointment_date)
        appt_ts = f"{appt_date_str}T{appt_time_str}+00:00"

        is_completed = (appt.status or "").lower() == "completed"
        events.append(TimelineEvent(
            id=f"appt_{appt.id}",
            event_type="appointment_completed" if is_completed else "appointment_scheduled",
            title="Appointment Completed" if is_completed else "Appointment Scheduled",
            timestamp=appt_ts,
            icon="check" if is_completed else "calendar",
            description="Clinical appointment completed." if is_completed else "Follow-up consultation scheduled.",
            details={
                "doctor_name": doc_name,
                "status": (appt.status or "Scheduled").capitalize(),
                "notes": appt.notes or "No additional notes",
            }
        ))

    # 5. Sort events chronologically (Newest first)
    def parse_event_time(ev: TimelineEvent) -> float:
        try:
            dt_str = ev.timestamp.replace("Z", "+00:00")
            return datetime.fromisoformat(dt_str).timestamp()
        except Exception:
            return 0.0

    events.sort(key=parse_event_time, reverse=True)

    return events