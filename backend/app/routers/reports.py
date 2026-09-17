from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from datetime import datetime

from ..database import get_db
from .. import models
from ..auth import require_roles

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER


router = APIRouter(prefix="/reports", tags=["Reports"])


# =========================
# PATIENT REPORT DATA
# =========================

@router.get("/patient/{patient_id}")
def get_patient_report(
    patient_id: int,
    current_user=Depends(require_roles("admin", "doctor")),
    db: Session = Depends(get_db)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    prediction = db.query(models.Prediction).filter(
        models.Prediction.patient_id == patient_id
    ).order_by(
        models.Prediction.created_at.desc()
    ).first()

    treatments = db.query(models.TreatmentRecord).filter(
        models.TreatmentRecord.patient_id == patient_id
    ).order_by(
        models.TreatmentRecord.recorded_at.desc()
    ).all()

    medications = db.query(models.MedicationRecord).filter(
        models.MedicationRecord.patient_id == patient_id
    ).order_by(
        models.MedicationRecord.recorded_at.desc()
    ).all()

    recovery = db.query(models.RecoveryRecord).filter(
        models.RecoveryRecord.patient_id == patient_id
    ).order_by(
        models.RecoveryRecord.recorded_at.desc()
    ).all()

    return {
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "age": patient.age,
            "gender": patient.gender,
            "disease": patient.disease,
            "risk": patient.risk,
            "status": patient.status,
            "admission_date": str(patient.admission_date)
            if patient.admission_date else None,
            "notes": patient.notes,
        },

        "prediction": {
            "risk_score": prediction.risk_score,
            "risk_level": prediction.risk_level,
            "recommendation": prediction.recommendation,
            "created_at": str(prediction.created_at)
            if prediction.created_at else None,
        } if prediction else None,

        "treatments": [
            {
                "name": item.treatment_name,
                "outcome": item.outcome,
                "effectiveness": item.effectiveness_score,
                "notes": item.notes,
                "date": str(item.recorded_at)
                if item.recorded_at else None,
            }
            for item in treatments
        ],

        "medications": [
            {
                "name": item.medication_name,
                "outcome": item.outcome,
                "effectiveness": item.effectiveness_score,
                "notes": item.notes,
                "date": str(item.recorded_at)
                if item.recorded_at else None,
            }
            for item in medications
        ],

        "recovery": [
            {
                "stage": item.recovery_stage,
                "score": item.recovery_score,
                "days": item.days_to_recovery,
                "notes": item.notes,
                "date": str(item.recorded_at)
                if item.recorded_at else None,
            }
            for item in recovery
        ],
    }


# =========================
# DOWNLOAD PDF REPORT
# =========================

@router.get("/patient/{patient_id}/pdf")
def download_patient_report(
    patient_id: int,
    current_user=Depends(require_roles("admin", "doctor")),
    db: Session = Depends(get_db)
):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    prediction = db.query(models.Prediction).filter(
        models.Prediction.patient_id == patient_id
    ).order_by(
        models.Prediction.created_at.desc()
    ).first()

    treatments = db.query(models.TreatmentRecord).filter(
        models.TreatmentRecord.patient_id == patient_id
    ).order_by(
        models.TreatmentRecord.recorded_at.desc()
    ).all()

    medications = db.query(models.MedicationRecord).filter(
        models.MedicationRecord.patient_id == patient_id
    ).order_by(
        models.MedicationRecord.recorded_at.desc()
    ).all()

    recovery = db.query(models.RecoveryRecord).filter(
        models.RecoveryRecord.patient_id == patient_id
    ).order_by(
        models.RecoveryRecord.recorded_at.desc()
    ).all()

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    title = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=20,
        spaceAfter=8,
        textColor=colors.HexColor("#0f172a")
    )

    heading = ParagraphStyle(
        "Heading",
        parent=styles["Heading2"],
        fontSize=13,
        spaceBefore=12,
        spaceAfter=6,
        textColor=colors.HexColor("#1e3a8a")
    )

    normal = ParagraphStyle(
        "NormalReport",
        parent=styles["Normal"],
        fontSize=9,
        leading=13
    )

    story = []

    story.append(
        Paragraph("HealthForecast-AI", title)
    )

    story.append(
        Paragraph(
            "Patient Clinical & Readmission Risk Report",
            ParagraphStyle(
                "SubTitle",
                parent=styles["Normal"],
                alignment=TA_CENTER,
                fontSize=11
            )
        )
    )

    story.append(Spacer(1, 12))

    story.append(
        Paragraph("Patient Information", heading)
    )

    patient_data = [
        ["Patient ID", str(patient.id)],
        ["Name", patient.name or "-"],
        ["Age", str(patient.age or "-")],
        ["Gender", patient.gender or "-"],
        ["Disease", patient.disease or "-"],
        ["Current Risk", patient.risk or "-"],
        ["Status", patient.status or "-"],
        [
            "Admission Date",
            str(patient.admission_date)
            if patient.admission_date else "-"
        ],
    ]

    table = Table(
        patient_data,
        colWidths=[140, 350]
    )

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#e2e8f0")),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#0f172a")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("PADDING", (0, 0), (-1, -1), 7),
        ])
    )

    story.append(table)

    if patient.notes:
        story.append(
            Paragraph("Patient Notes", heading)
        )
        story.append(
            Paragraph(
                patient.notes,
                normal
            )
        )

    # =========================
    # ML PREDICTION
    # =========================

    story.append(
        Paragraph("AI Readmission Risk Assessment", heading)
    )

    if prediction:
        prediction_data = [
            ["Risk Level", prediction.risk_level],
            [
                "Risk Score",
                f"{prediction.risk_score * 100:.2f}%"
            ],
            [
                "Recommendation",
                prediction.recommendation
            ],
            [
                "Prediction Date",
                str(prediction.created_at)
                if prediction.created_at else "-"
            ],
        ]

        table = Table(
            prediction_data,
            colWidths=[140, 350]
        )

        table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#dbeafe")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 7),
            ])
        )

        story.append(table)
    else:
        story.append(
            Paragraph(
                "No ML prediction is available for this patient.",
                normal
            )
        )

    # =========================
    # TREATMENT
    # =========================

    story.append(
        Paragraph("Treatment Effectiveness", heading)
    )

    if treatments:
        data = [
            ["Treatment", "Outcome", "Score", "Date"]
        ]

        for item in treatments:
            data.append([
                item.treatment_name,
                item.outcome,
                f"{item.effectiveness_score:.1f}%",
                str(item.recorded_at)
                if item.recorded_at else "-"
            ])

        table = Table(
            data,
            colWidths=[150, 120, 70, 150]
        )

        table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("PADDING", (0, 0), (-1, -1), 6),
            ])
        )

        story.append(table)
    else:
        story.append(
            Paragraph(
                "No treatment records available.",
                normal
            )
        )

    # =========================
    # MEDICATION
    # =========================

    story.append(
        Paragraph("Medication Effectiveness", heading)
    )

    if medications:
        data = [
            ["Medication", "Outcome", "Score", "Date"]
        ]

        for item in medications:
            data.append([
                item.medication_name,
                item.outcome,
                f"{item.effectiveness_score:.1f}%",
                str(item.recorded_at)
                if item.recorded_at else "-"
            ])

        table = Table(
            data,
            colWidths=[150, 120, 70, 150]
        )

        table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("PADDING", (0, 0), (-1, -1), 6),
            ])
        )

        story.append(table)
    else:
        story.append(
            Paragraph(
                "No medication records available.",
                normal
            )
        )

    # =========================
    # RECOVERY
    # =========================

    story.append(
        Paragraph("Recovery Analysis", heading)
    )

    if recovery:
        data = [
            ["Stage", "Score", "Days", "Date"]
        ]

        for item in recovery:
            data.append([
                item.recovery_stage,
                f"{item.recovery_score:.1f}%",
                str(item.days_to_recovery or "-"),
                str(item.recorded_at)
                if item.recorded_at else "-"
            ])

        table = Table(
            data,
            colWidths=[180, 90, 90, 130]
        )

        table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("PADDING", (0, 0), (-1, -1), 6),
            ])
        )

        story.append(table)
    else:
        story.append(
            Paragraph(
                "No recovery records available.",
                normal
            )
        )

    story.append(Spacer(1, 18))

    story.append(
        Paragraph(
            f"Report generated: {datetime.now().strftime('%d %B %Y, %I:%M %p')}",
            normal
        )
    )

    story.append(
        Paragraph(
            "This report is generated from HealthForecast-AI system records "
            "and is intended for authorized healthcare users.",
            normal
        )
    )

    doc.build(story)

    buffer.seek(0)

    filename = f"HealthForecast_Patient_{patient.id}_Report.pdf"

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
                f'attachment; filename="{filename}"'
        }
    )