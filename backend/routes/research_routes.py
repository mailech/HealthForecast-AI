from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user, require_roles
from shared import *

router = APIRouter()
@router.get("/api/research/analytics")
def research_analytics(
    current_user: dict = Depends(
        require_roles(
            "Healthcare Researcher",
            "System Administrator",
            "Hospital Administrator",
        )
    ),
):

    patients = list(
        patients_collection.find()
    )

    total_patients = len(patients)

    age_groups = {
        "0-18": 0,
        "19-40": 0,
        "41-60": 0,
        "61+": 0,
    }

    risk_distribution = {
        "LOW": 0,
        "MEDIUM": 0,
        "HIGH": 0,
    }

    for patient in patients:

        age = patient.get("age")

        if age is not None:

            if age <= 18:
                age_groups["0-18"] += 1

            elif age <= 40:
                age_groups["19-40"] += 1

            elif age <= 60:
                age_groups["41-60"] += 1

            else:
                age_groups["61+"] += 1

        risk = str(
            patient.get("risk", "")
        ).upper()

        if risk in risk_distribution:
            risk_distribution[risk] += 1

    return {
        "total_records": total_patients,
        "age_distribution": age_groups,
        "risk_distribution": risk_distribution,
    }


@router.get("/api/research/dataset")
def research_dataset(
    current_user: dict = Depends(
        require_roles(
            "Healthcare Researcher",
            "System Administrator",
        )
    ),
):

    patients = list(
        patients_collection.find()
    )

    anonymized_data = []

    for index, patient in enumerate(patients):

        anonymized_data.append(
            {
                "record_id": f"R-{index + 1:06d}",
                "age": patient.get("age"),
                "disease": patient.get("disease"),
                "risk": patient.get("risk"),
                "status": patient.get("status"),
            }
        )

    return {
        "records": anonymized_data
    }


@router.get("/api/research/dataset/export")
def export_research_dataset(
    current_user: dict = Depends(
        require_roles(
            "Healthcare Researcher",
            "System Administrator",
        )
    ),
):

    patients = list(
        patients_collection.find()
    )

    records = []

    for index, patient in enumerate(patients):

        records.append(
            {
                "record_id": f"R-{index + 1:06d}",
                "age": patient.get("age"),
                "disease": patient.get("disease"),
                "risk": patient.get("risk"),
                "status": patient.get("status"),
            }
        )

    create_audit_log(
        current_user,
        "RESEARCH_DATA_EXPORT",
        details={
            "records": len(records)
        },
    )

    return {
        "records": records
    }


