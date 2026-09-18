from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import date
from typing import Optional
from fpdf import FPDF

from app.database import get_db
from app.security import get_current_user, require_role
from app import models

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/doctors")
def list_doctors(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("hospital_administrator", "system_admin")),
):
    doctors = db.query(models.User).filter(models.User.role == "doctor").all()
    return [{"id": d.id, "full_name": d.full_name} for d in doctors]


class PatientCreate(BaseModel):
    full_name: str
    date_of_birth: date
    gender: str
    medical_record_number: str
    diagnosis: Optional[str] = None
    admission_date: Optional[date] = None
    discharge_date: Optional[date] = None
    assigned_doctor_id: Optional[int] = None


@router.post("/")
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("system_admin", "hospital_administrator")),
):
    new_patient = models.Patient(**patient.dict())
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient


@router.get("/")
def list_patients(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role == "system_admin":
        return db.query(models.Patient).all()

    elif current_user.role == "hospital_administrator":
        return db.query(models.Patient).all()

    elif current_user.role == "doctor":
        return db.query(models.Patient).filter(
            models.Patient.assigned_doctor_id == current_user.id
        ).all()

    elif current_user.role == "healthcare_researcher":
        patients = db.query(models.Patient).all()
        anonymized = []
        for p in patients:
            anonymized.append({
                "id": p.id,
                "gender": p.gender,
                "diagnosis": p.diagnosis,
                "admission_date": p.admission_date,
                "discharge_date": p.discharge_date,
            })
        return anonymized

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Role not recognized")


@router.get("/{patient_id}/report")
def download_patient_report(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("doctor", "hospital_administrator", "system_admin")),
):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if current_user.role == "doctor" and patient.assigned_doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this patient's report")

    treatments = db.query(models.Treatment).filter(models.Treatment.patient_id == patient_id).all()

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "HealthForecast AI - Patient Health Report", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, f"Generated: {date.today().isoformat()}", ln=True)
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Patient Information", ln=True)
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 7, f"Name: {patient.full_name}", ln=True)
    pdf.cell(0, 7, f"Date of Birth: {patient.date_of_birth}", ln=True)
    pdf.cell(0, 7, f"Gender: {patient.gender}", ln=True)
    pdf.cell(0, 7, f"Medical Record Number: {patient.medical_record_number}", ln=True)
    pdf.cell(0, 7, f"Diagnosis: {patient.diagnosis or 'N/A'}", ln=True)
    pdf.cell(0, 7, f"Admission Date: {patient.admission_date or 'N/A'}", ln=True)
    pdf.cell(0, 7, f"Discharge Date: {patient.discharge_date or 'N/A'}", ln=True)
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, f"Treatment History ({len(treatments)})", ln=True)
    pdf.set_font("Helvetica", "", 10)
    if not treatments:
        pdf.cell(0, 7, "No treatment records on file.", ln=True)
    for t in treatments:
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(
            0, 6,
            f"- {t.treatment_name} | Medication: {t.medication or 'N/A'} | "
            f"{t.start_date} to {t.end_date or 'ongoing'} | Outcome: {t.outcome or 'N/A'}",
            new_x="LMARGIN",
            new_y="NEXT",
        )

    pdf_bytes = bytes(pdf.output())
    filename = f"patient_{patient_id}_report.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )