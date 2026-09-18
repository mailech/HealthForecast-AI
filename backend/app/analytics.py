from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from datetime import date
from fpdf import FPDF

from app.database import get_db
from app.security import require_role
from app import models

router = APIRouter(prefix="/analytics", tags=["analytics"])


def build_summary(db: Session):
    total_patients = db.query(models.Patient).count()
    total_treatments = db.query(models.Treatment).count()

    treatments = db.query(models.Treatment).all()
    improved = len([t for t in treatments if t.outcome == "Improved"])
    no_change = len([t for t in treatments if t.outcome == "No Change"])
    worsened = len([t for t in treatments if t.outcome == "Worsened"])

    worsened_patient_ids = {t.patient_id for t in treatments if t.outcome == "Worsened"}
    high_risk_patients = len(worsened_patient_ids)
    readmission_rate = (
        round((high_risk_patients / total_patients) * 100, 1)
        if total_patients > 0 else 0
    )

    diagnosis_counts = {}
    for p in db.query(models.Patient).all():
        if p.diagnosis:
            diagnosis_counts[p.diagnosis] = diagnosis_counts.get(p.diagnosis, 0) + 1

    return {
        "total_patients": total_patients,
        "total_treatments": total_treatments,
        "high_risk_patients": high_risk_patients,
        "readmission_rate": readmission_rate,
        "treatment_outcomes": {
            "improved": improved,
            "no_change": no_change,
            "worsened": worsened,
        },
        "diagnosis_breakdown": diagnosis_counts,
    }


@router.get("/summary")
def analytics_summary(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("doctor", "hospital_administrator", "system_admin", "healthcare_researcher")),
):
    return build_summary(db)


@router.get("/report")
def download_analytics_report(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("hospital_administrator", "system_admin", "healthcare_researcher")),
):
    summary = build_summary(db)

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, "HealthForecast AI - Healthcare Analytics Report", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, f"Generated: {date.today().isoformat()}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Hospital-Wide Summary", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    pdf.cell(0, 7, f"Total Patients: {summary['total_patients']}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, f"Total Treatments: {summary['total_treatments']}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, f"High-Risk Patients: {summary['high_risk_patients']}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, f"Readmission Rate: {summary['readmission_rate']}%", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Treatment Outcomes", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 11)
    outcomes = summary["treatment_outcomes"]
    pdf.cell(0, 7, f"Improved: {outcomes['improved']}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, f"No Change: {outcomes['no_change']}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, f"Worsened: {outcomes['worsened']}", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, f"Diagnosis Breakdown ({len(summary['diagnosis_breakdown'])} distinct diagnoses)", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 9)
    for diagnosis, count in summary["diagnosis_breakdown"].items():
        pdf.set_x(pdf.l_margin)
        pdf.multi_cell(0, 6, f"- {diagnosis}: {count} patient(s)", new_x="LMARGIN", new_y="NEXT")

    pdf_bytes = bytes(pdf.output())
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=healthcare_analytics_report.pdf"},
    )