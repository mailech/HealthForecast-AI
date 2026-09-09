from io import BytesIO
from datetime import datetime
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from app.core.dependencies import get_current_user
from app.services.treatment_service import dataset_treatment_analysis

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/treatment-analysis.pdf")
def treatment_report(user=Depends(get_current_user)):
    if user.role not in {"doctor", "hospital_administrator", "healthcare_researcher", "system_administrator"}:
        from fastapi import HTTPException
        raise HTTPException(403, "Insufficient permissions")

    data = dataset_treatment_analysis()
    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("HealthForecast AI — Treatment Analysis Report", styles["Title"]),
        Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles["Normal"]),
        Spacer(1, 12),
        Paragraph(
            f"Dataset: {data['dataset']} | Encounters: {data['total_encounters']} | "
            f"Early readmission definition: {data['early_readmission_definition']}",
            styles["BodyText"],
        ),
        Spacer(1, 12),
    ]
    table_data = [["Treatment", "Encounters", "Early readmissions", "Rate"]]
    for row in data["medications"][:15]:
        table_data.append([row["treatment"], str(row["encounters"]), str(row["early_readmissions"]), f"{row['early_readmission_rate']}%"])
    table = Table(table_data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.lightgrey),
        ("GRID", (0,0), (-1,-1), 0.5, colors.grey),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 8),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    story += [Paragraph("Medication-use association summary", styles["Heading2"]), table, Spacer(1, 12)]
    ca = data["medication_change"]
    story += [
        Paragraph(f"Medication changed: {ca['changed']['encounters']} encounters; early-readmission rate {ca['changed']['rate']}%.", styles["BodyText"]),
        Paragraph(f"Medication unchanged: {ca['unchanged']['encounters']} encounters; early-readmission rate {ca['unchanged']['rate']}%.", styles["BodyText"]),
        Spacer(1, 10),
        Paragraph("Precautions / care considerations", styles["Heading2"]),
    ]
    precautions = [
        "Use model predictions as decision-support only; do not treat them as a diagnosis or treatment prescription.",
        "Confirm medication reconciliation and adherence at discharge.",
        "Arrange timely follow-up for patients with prior utilization or high predicted risk.",
        "Review glucose/A1C information and comorbidity burden with qualified clinicians.",
        "Investigate clinically relevant warning signs promptly and follow local hospital protocols.",
        "The dataset is retrospective; observed associations do not establish that a medication caused better or worse outcomes.",
    ]
    for item in precautions:
        story.append(Paragraph("• " + item, styles["BodyText"]))
        story.append(Spacer(1, 4))
    doc.build(story)
    buf.seek(0)
    return StreamingResponse(buf, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=treatment_analysis_report.pdf"})
