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

    # Medical Reports history if available
    med_reports = (await db.execute(
        select(MedicalReport)
        .where(MedicalReport.patient_id == patient_id)
        .order_by(MedicalReport.created_at.desc())
    )).scalars().all()
    medical_report_list = [
        MedicalReportInfo(
            id=mr.id,
            file_name=mr.file_name,
            file_type=mr.file_type,
            file_size=mr.file_size,
            created_at=mr.created_at,
        )
        for mr in med_reports
    ]

    # Prediction risk history if available
    pred_history = (await db.execute(
        select(Prediction)
        .where(Prediction.patient_id == patient_id)
        .order_by(Prediction.created_at.desc())
    )).scalars().all()
    risk_history_list = [
        RiskHistoryInfo(
            id=p.id,
            date=p.created_at,
            risk_category=p.risk_category,
            risk_score=p.readmission_risk_score,
            prior_admissions=p.prior_admissions,
            length_of_stay=p.length_of_stay,
        )
        for p in pred_history
    ]

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
        prior_admissions=prediction.prior_admissions if prediction else None,
        length_of_stay=prediction.length_of_stay if prediction else None,
        summary=(
            f"Latest forecast is {category.lower()} risk at {prediction.readmission_risk_score}%."
            if prediction else "No readmission forecast has been recorded for this patient."
        ),
        insights=insights,
        treatment=treatment_info,
        appointments=appointment_list,
        medical_reports=medical_report_list,
        risk_history=risk_history_list,
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


# ============================================================
# MEDICAL REPORT UPLOAD & CLINICAL EXTRACTION
# ============================================================
from fastapi import UploadFile, File, Form
from app.models.medical_report import MedicalReport
from app.schemas.medical_report import ClinicalExtractionResponse, MedicalReportItem
from app.schemas.report import MedicalReportInfo, RiskHistoryInfo
from app.services.report_parser_service import ReportParserService


@router.post("/upload-extract", response_model=ClinicalExtractionResponse)
async def upload_and_extract_report(
    patient_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(RoleChecker([UserRole.DOCTOR])),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a medical report (PDF, DOCX, TXT), extract clinical information,
    detect conflicts with DB patient data, and save report metadata.
    Restricted to DOCTOR role.
    """
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    # 1. Verify Patient Exists
    patient = await db.scalar(select(Patient).where(Patient.id == patient_id))
    if patient is None:
        raise HTTPException(status_code=404, detail=f"Patient #{patient_id} not found.")

    # 2. Read File Contents & Validate
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="The uploaded medical report file is empty.")

    file_ext = file.filename.lower().split(".")[-1]
    if file_ext not in ["pdf", "docx", "txt", "text"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file format. Please upload a PDF (.pdf), DOCX (.docx), or TXT (.txt) report."
        )

    # 3. Extract Raw Text & Parse Clinical Fields
    try:
        raw_text = ReportParserService.extract_raw_text(contents, file.filename)
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as err:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to extract readable text from this report: {str(err)}"
        )

    extracted_fields = ReportParserService.parse_clinical_text(raw_text)
    conflicts = ReportParserService.detect_conflicts(extracted_fields, patient)

    # 4. Save Medical Report Record in Database
    medical_report = MedicalReport(
        patient_id=patient.id,
        uploaded_by_id=current_user.id,
        file_name=file.filename,
        file_type=file_ext,
        file_size=len(contents),
        extracted_text=raw_text[:2000],  # Save initial text sample
    )
    db.add(medical_report)
    await db.flush()

    # Trigger Event-based notification for report analysis
    from app.services.notification_service import NotificationService
    patient_name = f"{patient.first_name} {patient.last_name}"
    await NotificationService.create_notification(
        db=db,
        type="report_analysis",
        title="Report Analysis Completed",
        message=f"Medical report analysis completed for {patient_name}.",
        user_id=current_user.id,
        target_role="Doctor",
        related_entity_type="patient",
        related_entity_id=patient.id,
        event_key=f"report_analysis:report_{medical_report.id}",
    )
    await db.commit()
    await db.refresh(medical_report)

    return ClinicalExtractionResponse(
        report_id=medical_report.id,
        patient_id=patient.id,
        file_name=file.filename,
        file_type=file_ext,
        file_size=len(contents),
        extracted_fields=extracted_fields,
        conflicts=conflicts,
        raw_text_snippet=raw_text[:500] if raw_text else None,
    )


@router.get("/medical-reports/{patient_id}", response_model=list[MedicalReportItem])
async def list_patient_medical_reports(
    patient_id: int,
    _: UserRole = Depends(RoleChecker([UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """List uploaded medical reports for a patient (Doctor & Hospital Admin)."""
    result = await db.execute(
        select(MedicalReport)
        .where(MedicalReport.patient_id == patient_id)
        .order_by(MedicalReport.created_at.desc())
    )
    return result.scalars().all()
