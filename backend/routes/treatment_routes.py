from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from auth import require_roles

from shared import (
    TreatmentPlanInput,
    patients_collection,
    create_audit_log,
)

from datetime import datetime, timezone


router = APIRouter()


# =========================================================
# SAVE / UPDATE TREATMENT PLAN
# DOCTOR + SYSTEM ADMIN
# =========================================================


@router.patch("/api/patients/{patient_id}/treatment")
def update_treatment_plan(
    patient_id: str,
    treatment: TreatmentPlanInput,
    current_user: dict = Depends(
        require_roles(
            "Doctor",
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

    if treatment.patient_id != patient_id:

        raise HTTPException(
            status_code=400,
            detail=(
                "Patient ID in request body does not "
                "match the URL."
            ),
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

    # -----------------------------------------------------
    # DOCTOR CAN UPDATE ONLY ASSIGNED PATIENTS
    # -----------------------------------------------------

    if current_user["role"] == "Doctor":

        if patient.get("doctor_id") != current_user["id"]:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only update treatment "
                    "for assigned patients."
                ),
            )

    # -----------------------------------------------------
    # VALIDATE FOLLOW-UP DATE
    # -----------------------------------------------------

    try:

        follow_up_date = datetime.strptime(
            treatment.follow_up_date,
            "%Y-%m-%d",
        ).date().isoformat()

    except ValueError:

        raise HTTPException(
            status_code=400,
            detail=(
                "Follow-up date must be in "
                "YYYY-MM-DD format."
            ),
        )

    # -----------------------------------------------------
    # CREATE TREATMENT PLAN
    # -----------------------------------------------------

    treatment_data = {
        "diagnosis": treatment.diagnosis.strip(),

        "medicines": treatment.medicines.strip(),

        "doctor_recommendations": (
            treatment.doctor_recommendations.strip()
        ),

        "follow_up_date": follow_up_date,

        "updated_at": datetime.now(timezone.utc),

        "updated_by": current_user["id"],

        "doctor_name": current_user.get(
            "name",
            "Doctor",
        ),
    }

    # -----------------------------------------------------
    # SAVE TO PATIENT DOCUMENT
    # -----------------------------------------------------

    patients_collection.update_one(
        {
            "_id": patient_object_id
        },
        {
            "$set": {
                "treatment_plan": treatment_data
            }
        },
    )
    create_audit_log(
        current_user,
        "UPDATE_TREATMENT_PLAN",
        resource=patient_id,
        details={
            "follow_up_date": follow_up_date,
            "diagnosis": treatment.diagnosis,
        },
    )

    return {
        "message": "Treatment plan saved successfully.",
        "patient_id": patient_id,
        "treatment_plan": treatment_data,
    }