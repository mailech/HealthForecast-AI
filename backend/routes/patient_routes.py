from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from auth import get_current_user, require_roles

from shared import (
    Patient,
    patients_collection,
    create_audit_log,
    serialize_patient,
)


router = APIRouter()


# =========================================================
# CREATE PATIENT
# DOCTOR + SYSTEM ADMIN
# =========================================================

@router.post("/api/patients")
def create_patient(
    patient: Patient,
    current_user: dict = Depends(
        require_roles(
            "Doctor",
            "System Administrator",
        )
    ),
):

    patient_data = patient.model_dump()

    if current_user["role"] == "Doctor":
        patient_data["doctor_id"] = current_user["id"]
    else:
        patient_data["doctor_id"] = None

    patient_data["created_at"] = datetime.now(timezone.utc)

    result = patients_collection.insert_one(
        patient_data
    )

    patient_id = str(result.inserted_id)

    create_audit_log(
        current_user,
        "CREATE_PATIENT",
        resource=patient_id,
    )

    return {
        "message": "Patient created successfully",
        "patient_id": patient_id,
        "id": patient_id,
    }


# =========================================================
# GET PATIENTS
# =========================================================

@router.get("/api/patients")
def get_patients(
    current_user: dict = Depends(get_current_user),
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

    elif role == "Hospital Administrator":

        patients = list(
            patients_collection.find()
        )

    elif role == "System Administrator":

        patients = list(
            patients_collection.find()
        )

    else:

        raise HTTPException(
            status_code=403,
            detail=(
                "Researchers must use the anonymized "
                "research endpoints."
            ),
        )

    return [
        serialize_patient(patient)
        for patient in patients
    ]


# =========================================================
# GET SINGLE PATIENT
# =========================================================

@router.get("/api/patients/{patient_id}")
def get_patient(
    patient_id: str,
    current_user: dict = Depends(get_current_user),
):

    try:

        object_id = ObjectId(patient_id)

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid patient ID.",
        )

    patient = patients_collection.find_one(
        {
            "_id": object_id
        }
    )

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    role = current_user["role"]

    if role == "Doctor":

        if patient.get("doctor_id") != current_user["id"]:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only access your assigned patients."
                ),
            )

    elif role == "Healthcare Researcher":

        raise HTTPException(
            status_code=403,
            detail=(
                "Researchers cannot access individual patient records."
            ),
        )

    elif role not in {
        "Hospital Administrator",
        "System Administrator",
    }:

        raise HTTPException(
            status_code=403,
            detail="Access denied.",
        )

    return serialize_patient(patient)


# =========================================================
# DELETE PATIENT
# SYSTEM ADMIN ONLY
# =========================================================

@router.delete("/api/patients/{patient_id}")
def delete_patient(
    patient_id: str,
    current_user: dict = Depends(
        require_roles(
            "System Administrator"
        )
    ),
):

    try:

        object_id = ObjectId(patient_id)

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid patient ID.",
        )

    result = patients_collection.delete_one(
        {
            "_id": object_id
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    create_audit_log(
        current_user,
        "DELETE_PATIENT",
        resource=patient_id,
    )

    return {
        "message": "Patient deleted successfully"
    }