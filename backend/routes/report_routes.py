from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from auth import get_current_user, require_roles

from shared import (
    Report,
    reports_collection,
    patients_collection,
    create_audit_log,
    serialize_report,
)

from datetime import datetime, timezone


router = APIRouter()

@router.post("/api/reports")
def create_report(
    report: Report,
    current_user: dict = Depends(
        require_roles(
            "Doctor",
            "System Administrator",
        )
    ),
):

    try:

        patient = patients_collection.find_one(
            {
                "_id": ObjectId(report.patient_id)
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid patient ID.",
        )

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    if current_user["role"] == "Doctor":

        if patient.get("doctor_id") != current_user["id"]:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only create reports "
                    "for assigned patients."
                ),
            )

    report_data = {
        "patient_id": report.patient_id,
        "patient_name": report.patient_name,
        "type": report.type,
        "status": report.status,
        "created_at": datetime.now(timezone.utc),
        "created_by": current_user["id"],
    }

    result = reports_collection.insert_one(
        report_data
    )

    create_audit_log(
        current_user,
        "CREATE_REPORT",
        resource=str(result.inserted_id),
    )

    return {
        "message": "Report created successfully",
        "report_id": str(result.inserted_id),
    }


# =========================================================
# GET REPORTS
# =========================================================


@router.get("/api/reports")
def get_reports(
    current_user: dict = Depends(get_current_user),
):

    role = current_user["role"]

    if role == "Doctor":

        assigned_patients = list(
            patients_collection.find(
                {
                    "doctor_id": current_user["id"]
                },
                {
                    "_id": 1
                },
            )
        )

        patient_ids = [
            str(patient["_id"])
            for patient in assigned_patients
        ]

        reports = list(
            reports_collection.find(
                {
                    "patient_id": {
                        "$in": patient_ids
                    }
                }
            )
        )

    elif role in {
        "Hospital Administrator",
        "System Administrator",
    }:

        reports = list(
            reports_collection.find()
        )

    elif role == "Healthcare Researcher":

        reports = list(
            reports_collection.find(
                {},
                {
                    "patient_name": 0
                },
            )
        )

    else:

        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    return [
        serialize_report(report)
        for report in reports
    ]


# =========================================================
# DELETE REPORT
# DOCTOR + SYSTEM ADMIN
# =========================================================


@router.delete("/api/reports/{report_id}")
def delete_report(
    report_id: str,
    current_user: dict = Depends(
        require_roles(
            "Doctor",
            "System Administrator",
        )
    ),
):

    try:

        report = reports_collection.find_one(
            {
                "_id": ObjectId(report_id)
            }
        )

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid report ID.",
        )

    if not report:

        raise HTTPException(
            status_code=404,
            detail="Report not found.",
        )

    if current_user["role"] == "Doctor":

        try:

            patient = patients_collection.find_one(
                {
                    "_id": ObjectId(
                        report["patient_id"]
                    )
                }
            )

        except Exception:

            raise HTTPException(
                status_code=400,
                detail="Invalid patient ID in report.",
            )

        if not patient:

            raise HTTPException(
                status_code=404,
                detail="Patient not found.",
            )

        if patient.get("doctor_id") != current_user["id"]:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only delete reports "
                    "for assigned patients."
                ),
            )

    result = reports_collection.delete_one(
        {
            "_id": ObjectId(report_id)
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Report not found.",
        )

    create_audit_log(
        current_user,
        "DELETE_REPORT",
        resource=report_id,
    )

    return {
        "message": "Report deleted successfully"
    }