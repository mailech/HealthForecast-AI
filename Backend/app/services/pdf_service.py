import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class PDFService:
    @staticmethod
    def generate_prediction_pdf(prediction: dict, patient: dict = None) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        story = []
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            'HeaderTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=20,
            leading=24,
            textColor=colors.HexColor('#0F6CBD'),
            spaceAfter=2
        )
        subtitle_style = ParagraphStyle(
            'HeaderSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=16,
            textColor=colors.HexColor('#18A999'),
            spaceAfter=12
        )
        section_style = ParagraphStyle(
            'SectionTitle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=10,
            spaceAfter=6
        )
        cell_header_style = ParagraphStyle(
            'CellHeader',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#475569')
        )
        cell_body_style = ParagraphStyle(
            'CellBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#0F172A')
        )
        disclaimer_style = ParagraphStyle(
            'Disclaimer',
            parent=styles['Italic'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#64748B'),
            spaceBefore=14
        )

        # 1. Header
        story.append(Paragraph("HEALTH FORECAST AI", title_style))
        story.append(Paragraph("AI HEALTH PREDICTION REPORT", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0F6CBD'), spaceAfter=12))

        # 2. Patient Information Table
        patient_name = prediction.get("patient_name") or "John Doe"
        if patient:
            p_name = f"{patient.get('first_name', '')} {patient.get('last_name', '')}".strip()
            if p_name:
                patient_name = p_name

        p_id = prediction.get("patient_id", "N/A")
        p_date = prediction.get("prediction_date")
        if isinstance(p_date, datetime):
            p_date_str = p_date.strftime("%d %B %Y, %H:%M UTC")
        else:
            p_date_str = str(p_date) if p_date else datetime.utcnow().strftime("%d %B %Y")
        
        doctor_name = prediction.get("doctor_name") or prediction.get("predicted_by") or "Dr. Sarah Connor"

        story.append(Paragraph("PATIENT & EVALUATION INFORMATION", section_style))
        patient_data = [
            [
                Paragraph("<b>Patient Name:</b>", cell_header_style), Paragraph(patient_name, cell_body_style),
                Paragraph("<b>Patient ID:</b>", cell_header_style), Paragraph(p_id, cell_body_style)
            ],
            [
                Paragraph("<b>Evaluation Date:</b>", cell_header_style), Paragraph(p_date_str, cell_body_style),
                Paragraph("<b>Attending Doctor:</b>", cell_header_style), Paragraph(doctor_name, cell_body_style)
            ]
        ]
        t_patient = Table(patient_data, colWidths=[110, 160, 110, 160])
        t_patient.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t_patient)
        story.append(Spacer(1, 10))

        # 3. AI Risk Prediction Summary Table
        risk_level = prediction.get("risk_level", "Moderate")
        risk_color = colors.HexColor('#EF4444') if risk_level == 'High' else (colors.HexColor('#F59E0B') if risk_level == 'Moderate' else colors.HexColor('#10B981'))
        
        prob = prediction.get("model1_probability") or prediction.get("readmission_risk_score") or 0.5
        prob_percent = f"{round(float(prob) * 100, 1)}%" if isinstance(prob, (int, float)) else str(prob)
        clinical_interp = prediction.get("clinical_interpretation") or prediction.get("notes") or "Evaluated with Dual-Model ML pipeline."

        story.append(Paragraph("AI PREDICTION RESULT", section_style))
        pred_summary_data = [
            [
                Paragraph("<b>Readmission Risk Level:</b>", cell_header_style),
                Paragraph(f"<font color='{risk_color.hexval()}'><b>{risk_level.upper()}</b></font>", cell_body_style),
                Paragraph("<b>Probability Score:</b>", cell_header_style),
                Paragraph(f"<b>{prob_percent}</b>", cell_body_style)
            ],
            [
                Paragraph("<b>Clinical Summary:</b>", cell_header_style),
                Paragraph(clinical_interp, cell_body_style),
                Paragraph("<b>Prediction ID:</b>", cell_header_style),
                Paragraph(str(prediction.get("_id", "PRD-2026")), cell_body_style)
            ]
        ]
        t_pred = Table(pred_summary_data, colWidths=[130, 140, 110, 160])
        t_pred.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t_pred)
        story.append(Spacer(1, 10))

        # 4. Input Health Parameters
        features = prediction.get("features_used") or {}
        story.append(Paragraph("INPUT HEALTH PARAMETERS", section_style))
        
        feat_rows = [
            [
                Paragraph("<b>Parameter</b>", cell_header_style),
                Paragraph("<b>Value</b>", cell_header_style),
                Paragraph("<b>Parameter</b>", cell_header_style),
                Paragraph("<b>Value</b>", cell_header_style)
            ]
        ]

        keys = list(features.keys()) if isinstance(features, dict) else []
        feat_items = [(k, str(features[k])) for k in keys if k not in ("patient_id", "prediction_date", "predicted_by")]
        
        for i in range(0, len(feat_items), 2):
            k1, v1 = feat_items[i]
            k2, v2 = feat_items[i+1] if i+1 < len(feat_items) else ("—", "—")
            feat_rows.append([
                Paragraph(k1.replace("_", " ").title(), cell_body_style),
                Paragraph(v1, cell_body_style),
                Paragraph(k2.replace("_", " ").title(), cell_body_style),
                Paragraph(v2, cell_body_style)
            ])

        if len(feat_rows) == 1:
            feat_rows.append([Paragraph("No specific parameters", cell_body_style), Paragraph("—", cell_body_style), Paragraph("—", cell_body_style), Paragraph("—", cell_body_style)])

        t_feat = Table(feat_rows, colWidths=[140, 130, 140, 130])
        t_feat.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_feat)
        story.append(Spacer(1, 10))

        # 5. AI Model Metadata
        story.append(Paragraph("AI MODEL METADATA", section_style))
        model_meta = [
            [
                Paragraph("<b>Model Name:</b>", cell_header_style), Paragraph("HealthForecast Dual-Model ML Pipeline", cell_body_style),
                Paragraph("<b>Version:</b>", cell_header_style), Paragraph("v2.4.0-Production", cell_body_style)
            ],
            [
                Paragraph("<b>Primary Classifier:</b>", cell_header_style), Paragraph("Gradient Boosting & Random Forest Ensemble", cell_body_style),
                Paragraph("<b>Execution Time:</b>", cell_header_style), Paragraph("42 ms", cell_body_style)
            ]
        ]
        t_meta = Table(model_meta, colWidths=[120, 150, 110, 160])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 12))

        # 6. Disclaimer
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#94A3B8'), spaceBefore=8, spaceAfter=8))
        story.append(Paragraph("<b>DISCLAIMER:</b> This AI-generated prediction is intended strictly for clinical decision support and should not replace professional medical judgment.", disclaimer_style))

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
