from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from bson import ObjectId
from io import BytesIO
from datetime import datetime, timezone

from auth import require_roles

from shared import (
    patients_collection,
    create_audit_log,
)

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.enums import TA_CENTER


router = APIRouter()

# =========================================================
# HOSPITAL READMISSION STATISTICS
# HOSPITAL ADMIN + SYSTEM ADMIN
# =========================================================

@router.get("/api/analytics/hospital/readmission")
def hospital_readmission_statistics(
    current_user: dict = Depends(
        require_roles(
            "Hospital Administrator",
            "System Administrator",
        )
    ),
):
    """
    Overall hospital-wide readmission statistics.

    This endpoint is for administrative monitoring only.
    It does NOT perform a new AI prediction.
    """

    patients = list(
        patients_collection.find()
    )

    total_patients = len(patients)

    # -----------------------------------------------------
    # ACTUAL READMISSION DATA
    # -----------------------------------------------------
    #
    # Patient records may contain:
    #   readmitted
    #   readmission
    #   readmission_30_days
    #
    # We check the stored readmission information instead
    # of treating the AI risk level as actual readmission.
    # -----------------------------------------------------

    readmitted_patients = 0
    readmitted_within_30_days = 0
    not_readmitted_patients = 0

    readmission_distribution = {}

    for patient in patients:

        readmission_value = patient.get(
            "readmitted",
            patient.get(
                "readmission",
                None,
            ),
        )

        # -------------------------------------------------
        # NORMALIZE READMISSION VALUE
        # -------------------------------------------------

        if readmission_value is None:

            binary_value = patient.get(
                "readmission_30_days",
                None,
            )

            if binary_value == 1:
                readmission_value = "<30"

            elif binary_value == 0:
                readmission_value = "NO"

        if readmission_value is not None:

            readmission_value = str(
                readmission_value
            ).strip().upper()

            readmission_distribution[
                readmission_value
            ] = (
                readmission_distribution.get(
                    readmission_value,
                    0,
                )
                + 1
            )

            # ---------------------------------------------
            # READMITTED
            # ---------------------------------------------

            if readmission_value in {
                "<30",
                ">30",
                "YES",
                "READMITTED",
                "TRUE",
                "1",
            }:

                readmitted_patients += 1

            # ---------------------------------------------
            # WITHIN 30 DAYS
            # ---------------------------------------------

            if readmission_value in {
                "<30",
                "WITHIN 30 DAYS",
                "30 DAYS",
                "YES",
                "READMITTED",
                "TRUE",
                "1",
            }:

                readmitted_within_30_days += 1

            # ---------------------------------------------
            # NOT READMITTED
            # ---------------------------------------------

            elif readmission_value in {
                "NO",
                "NOT READMITTED",
                "FALSE",
                "0",
            }:

                not_readmitted_patients += 1

    # -----------------------------------------------------
    # TOTAL ADMISSIONS
    # -----------------------------------------------------

    total_admissions = total_patients

    # -----------------------------------------------------
    # READMISSION RATE
    # -----------------------------------------------------

    if total_admissions > 0:
        readmission_rate = round(
            (
                readmitted_patients
                / total_admissions
            )
            * 100,
            2,
        )
    else:
        readmission_rate = 0.0

    # -----------------------------------------------------
    # RISK DISTRIBUTION
    # -----------------------------------------------------

    high_risk = sum(
        1
        for patient in patients
        if str(
            patient.get(
                "risk",
                "",
            )
        ).upper()
        == "HIGH"
    )

    medium_risk = sum(
        1
        for patient in patients
        if str(
            patient.get(
                "risk",
                "",
            )
        ).upper()
        == "MEDIUM"
    )

    low_risk = sum(
        1
        for patient in patients
        if str(
            patient.get(
                "risk",
                "",
            )
        ).upper()
        == "LOW"
    )

    # -----------------------------------------------------
    # AUDIT LOG
    # -----------------------------------------------------

    create_audit_log(
        current_user,
        "HOSPITAL_READMISSION_STATISTICS_VIEW",
        details={
            "total_patients": total_patients,
            "readmitted_patients": readmitted_patients,
        },
    )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "total_patients": total_patients,

        "total_admissions": total_admissions,

        "readmitted_patients": readmitted_patients,

        "not_readmitted_patients": (
            not_readmitted_patients
        ),

        "readmitted_within_30_days": (
            readmitted_within_30_days
        ),

        "readmission_rate": readmission_rate,

        "high_risk": high_risk,

        "medium_risk": medium_risk,

        "low_risk": low_risk,

        "readmission_distribution": (
            readmission_distribution
        ),
    }

# =========================================================
# HOSPITAL ANALYTICS
# =========================================================

@router.get("/api/analytics/hospital")
def hospital_analytics(
    current_user: dict = Depends(
        require_roles(
            "Doctor",
            "Hospital Administrator",
            "System Administrator",
        )
    ),
):

    role = current_user["role"]

    if role == "Doctor":

        patients = list(
            patients_collection.find(
                {
                    "doctor_id": current_user["id"]
                }
            )
        )

    else:

        patients = list(
            patients_collection.find()
        )

    total_patients = len(patients)

    high_risk = sum(
        1
        for patient in patients
        if str(
            patient.get("risk", "")
        ).upper() == "HIGH"
    )

    medium_risk = sum(
        1
        for patient in patients
        if str(
            patient.get("risk", "")
        ).upper() == "MEDIUM"
    )

    low_risk = sum(
        1
        for patient in patients
        if str(
            patient.get("risk", "")
        ).upper() == "LOW"
    )

    status_counts = {}

    for patient in patients:

        status = patient.get(
            "status",
            "Unknown",
        )

        status_counts[status] = (
            status_counts.get(status, 0) + 1
        )

    return {
        "total_patients": total_patients,
        "high_risk": high_risk,
        "medium_risk": medium_risk,
        "low_risk": low_risk,
        "status_distribution": status_counts,
    }


# =========================================================
# HOSPITAL ANALYTICS EXPORT
# =========================================================

@router.get("/api/analytics/hospital/export")
def export_hospital_analytics(
    current_user: dict = Depends(
        require_roles(
            "Hospital Administrator",
            "System Administrator",
        )
    ),
):

    patients = list(
        patients_collection.find()
    )

    rows = []

    for patient in patients:

        treatment = patient.get(
            "treatment_plan",
            {}
        )

        rows.append(
            {
                "patient_id": str(
                    patient.get("_id")
                ),
                "patient_name": patient.get(
                    "name"
                ),
                "patient_age": patient.get(
                    "age"
                ),
                "disease": patient.get(
                    "disease"
                ),
                "risk": patient.get(
                    "risk"
                ),
                "status": patient.get(
                    "status"
                ),
                "diagnosis": treatment.get(
                    "diagnosis"
                ),
                "medicines": treatment.get(
                    "medicines"
                ),
                "doctor_recommendations": treatment.get(
                    "doctor_recommendations"
                ),
                "follow_up_date": treatment.get(
                    "follow_up_date"
                ),
                "doctor_name": treatment.get(
                    "doctor_name"
                ),
                "treatment_updated_at": (
                    treatment.get("updated_at").isoformat()
                    if isinstance(
                        treatment.get("updated_at"),
                        datetime,
                    )
                    else treatment.get(
                        "updated_at"
                    )
                ),
            }
        )

    create_audit_log(
        current_user,
        "HOSPITAL_ANALYTICS_EXPORT",
        details={
            "records": len(rows)
        },
    )

    return {
        "records": rows
    }


# =========================================================
# PATIENT DETAILS FOR HOSPITAL ADMIN
# =========================================================

@router.get("/api/analytics/patient/{patient_id}")
def hospital_patient_details(
    patient_id: str,
    current_user: dict = Depends(
        require_roles(
            "Hospital Administrator",
            "System Administrator",
        )
    ),
):

    try:

        patient_object_id = ObjectId(patient_id)

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid patient ID.",
        )

    patient = patients_collection.find_one(
        {
            "_id": patient_object_id
        }
    )

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    treatment = patient.get(
        "treatment_plan",
        {}
    )

    return {
        "patient_id": str(
            patient["_id"]
        ),
        "name": patient.get(
            "name"
        ),
        "age": patient.get(
            "age"
        ),
        "disease": patient.get(
            "disease"
        ),
        "risk": patient.get(
            "risk"
        ),
        "status": patient.get(
            "status"
        ),
        "treatment_plan": {
            "diagnosis": treatment.get(
                "diagnosis"
            ),
            "medicines": treatment.get(
                "medicines"
            ),
            "doctor_recommendations": treatment.get(
                "doctor_recommendations"
            ),
            "follow_up_date": treatment.get(
                "follow_up_date"
            ),
            "doctor_name": treatment.get(
                "doctor_name"
            ),
            "updated_at": (
                treatment.get("updated_at").isoformat()
                if isinstance(
                    treatment.get("updated_at"),
                    datetime,
                )
                else treatment.get(
                    "updated_at"
                )
            ),
        },
    }


# =========================================================
# PATIENT PDF REPORT
# HOSPITAL ADMIN + SYSTEM ADMIN
# =========================================================

@router.get("/api/analytics/patient/{patient_id}/pdf")
def download_patient_pdf(
    patient_id: str,
    current_user: dict = Depends(
        require_roles(
            "Hospital Administrator",
            "System Administrator",
        )
    ),
):

    try:

        patient_object_id = ObjectId(patient_id)

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid patient ID.",
        )

    patient = patients_collection.find_one(
        {
            "_id": patient_object_id
        }
    )

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    treatment = patient.get(
        "treatment_plan",
        {}
    )

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()

    title_style = styles["Title"]
    title_style.alignment = TA_CENTER

    heading_style = styles["Heading2"]
    normal_style = styles["BodyText"]

    elements = []

    elements.append(
        Paragraph(
            "HealthForecast AI",
            title_style,
        )
    )

    elements.append(
        Paragraph(
            "Patient Health & Treatment Report",
            heading_style,
        )
    )

    elements.append(
        Spacer(1, 15)
    )

    # -----------------------------------------------------
    # PATIENT INFORMATION
    # -----------------------------------------------------

    elements.append(
        Paragraph(
            "Patient Information",
            heading_style,
        )
    )

    patient_data = [
        [
            "Patient ID",
            str(patient["_id"]),
        ],
        [
            "Name",
            str(patient.get("name", "N/A")),
        ],
        [
            "Age",
            str(patient.get("age", "N/A")),
        ],
        [
            "Disease",
            str(patient.get("disease", "N/A")),
        ],
        [
            "Risk Level",
            str(patient.get("risk", "N/A")),
        ],
        [
            "Status",
            str(patient.get("status", "N/A")),
        ],
    ]

    patient_table = Table(
        patient_data,
        colWidths=[150, 330],
    )

    patient_table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )

    elements.append(patient_table)

    elements.append(
        Spacer(1, 20)
    )

    # -----------------------------------------------------
    # TREATMENT INFORMATION
    # -----------------------------------------------------

    elements.append(
        Paragraph(
            "Treatment Information",
            heading_style,
        )
    )

    treatment_data = [
        [
            "Diagnosis",
            str(
                treatment.get(
                    "diagnosis",
                    "N/A",
                )
            ),
        ],
        [
            "Medicines",
            str(
                treatment.get(
                    "medicines",
                    "N/A",
                )
            ),
        ],
        [
            "Doctor Recommendations",
            str(
                treatment.get(
                    "doctor_recommendations",
                    "N/A",
                )
            ),
        ],
        [
            "Follow-up Date",
            str(
                treatment.get(
                    "follow_up_date",
                    "N/A",
                )
            ),
        ],
        [
            "Doctor",
            str(
                treatment.get(
                    "doctor_name",
                    "N/A",
                )
            ),
        ],
    ]

    treatment_table = Table(
        treatment_data,
        colWidths=[150, 330],
    )

    treatment_table.setStyle(
        TableStyle(
            [
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )

    elements.append(treatment_table)

    elements.append(
        Spacer(1, 20)
    )

    elements.append(
        Paragraph(
            "Generated by HealthForecast AI",
            normal_style,
        )
    )

    elements.append(
        Paragraph(
            datetime.now(timezone.utc).strftime(
                "Generated on: %Y-%m-%d %H:%M UTC"
            ),
            normal_style,
        )
    )

    document.build(elements)

    buffer.seek(0)

    create_audit_log(
        current_user,
        "PATIENT_PDF_EXPORT",
        resource=patient_id,
    )

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="patient_{patient_id}_report.pdf"'
            )
        },
    )