from sqlalchemy import func
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models import Patient, Prediction, Treatment
from app.services.treatment_service import dataset_treatment_analysis
from app.services.prediction_population import ensure_dataset_predictions


router = APIRouter(
    prefix="/analytics",
    tags=["Healthcare Analytics"]
)


# ---------------------------------------------------------
# Patient scope
# ---------------------------------------------------------

def scoped_patient_query(user, db):
    """
    Return a database query for patients visible to the current user.

    IMPORTANT:
    This returns a SQL query instead of loading all patient IDs into
    Python. This prevents SQLite from receiving thousands of query
    parameters.
    """

    q = db.query(Patient)

    if user.role == "doctor":
        q = q.filter(
            (Patient.dataset_encounter_id.isnot(None))
            | (Patient.doctor_id == user.id)
        )

    elif user.role in {
        "hospital_administrator",
        "healthcare_researcher"
    }:
        q = q.filter(
            (Patient.dataset_encounter_id.isnot(None))
            | (Patient.hospital == user.hospital)
        )

    elif user.role == "system_administrator":
        pass

    else:
        # User has no access to patient data
        q = q.filter(False)

    return q


def scoped_patients(user, db):
    """
    Return patients visible to the current user.
    """

    return scoped_patient_query(user, db).all()


# ---------------------------------------------------------
# Prediction scope
# ---------------------------------------------------------

def scoped_predictions(user, db):
    """
    Get predictions belonging to patients visible to the user.

    Uses a SQL subquery instead of:

        patient_id IN (1, 2, 3, ..., 101766)

    This prevents the SQLite 'too many SQL variables' error.
    """

    patient_ids_query = scoped_patient_query(user, db).with_entities(
        Patient.id
    )

    return (
        db.query(Prediction)
        .filter(
            Prediction.patient_id.in_(patient_ids_query)
        )
        .all()
    )


# ---------------------------------------------------------
# Treatment scope
# ---------------------------------------------------------

def scoped_treatments(user, db):
    """
    Get treatments belonging to patients visible to the user.

    Uses a SQL subquery instead of creating a huge Python list
    of patient IDs.
    """

    patient_ids_query = scoped_patient_query(user, db).with_entities(
        Patient.id
    )

    return (
        db.query(Treatment)
        .filter(
            Treatment.patient_id.in_(patient_ids_query)
        )
        .all()
    )


# ---------------------------------------------------------
# Dashboard
# ---------------------------------------------------------

@router.get("/dashboard")
def dashboard(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return healthcare analytics dashboard statistics.
    """

    # Make sure predictions exist for the dataset
    ensure_dataset_predictions(db)

    # Get data within the user's scope
    patients = scoped_patients(user, db)
    predictions = scoped_predictions(user, db)
    treatments = scoped_treatments(user, db)

    # -----------------------------------------------------
    # Get latest prediction for each patient
    # -----------------------------------------------------

    latest = {}

    for prediction in predictions:
        if prediction.patient_id not in latest:
            latest[prediction.patient_id] = prediction

    # -----------------------------------------------------
    # Early readmission
    # -----------------------------------------------------

    early = sum(
        1
        for patient in patients
        if patient.readmitted == "<30"
    )

    # -----------------------------------------------------
    # Risk distribution
    # -----------------------------------------------------

    risk_counts = {
        "Low": 0,
        "Medium": 0,
        "High": 0
    }

    for prediction in latest.values():
        if prediction.risk_category in risk_counts:
            risk_counts[prediction.risk_category] += 1

    # -----------------------------------------------------
    # Average readmission probability
    # -----------------------------------------------------

    average_probability = (
        sum(
            prediction.readmission_probability
            for prediction in latest.values()
        ) / len(latest)
        if latest
        else 0
    )

    # -----------------------------------------------------
    # Average treatment effectiveness
    # -----------------------------------------------------

    average_treatment = (
        sum(
            treatment.effectiveness_score
            for treatment in treatments
        ) / len(treatments)
        if treatments
        else 0
    )

    # -----------------------------------------------------
    # Return dashboard data
    # -----------------------------------------------------

    return {
        "total_patients": len(patients),

        "patients_with_predictions": len(latest),

        "high_risk_patients": risk_counts["High"],

        "medium_risk_patients": risk_counts["Medium"],

        "low_risk_patients": risk_counts["Low"],

        "average_readmission_probability": round(
            average_probability,
            4
        ),

        "early_readmission_count": early,

        "early_readmission_rate": round(
            (early / len(patients)) * 100,
            2
        ) if patients else 0,

        "treatment_records": len(treatments),

        "average_treatment_effectiveness": round(
            average_treatment,
            2
        ),

        "risk_distribution": risk_counts,

        "role": user.role
    }


# ---------------------------------------------------------
# Risk Distribution
# ---------------------------------------------------------

@router.get("/risk-distribution")
def risk(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return risk distribution for patients visible to the user.
    """

    predictions = scoped_predictions(user, db)

    latest = {}

    for prediction in predictions:
        if prediction.patient_id not in latest:
            latest[prediction.patient_id] = prediction.risk_category

    counts = {
        "Low": 0,
        "Medium": 0,
        "High": 0
    }

    for category in latest.values():
        if category in counts:
            counts[category] += 1

    return [
        {
            "category": category,
            "count": count
        }
        for category, count in counts.items()
    ]


# ---------------------------------------------------------
# Treatment Effectiveness
# ---------------------------------------------------------

@router.get("/treatment-effectiveness")
def treatment(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return average treatment effectiveness grouped by outcome.
    """

    treatments = scoped_treatments(user, db)

    grouped = {}

    for item in treatments:
        grouped.setdefault(
            item.outcome,
            []
        ).append(
            item.effectiveness_score
        )

    return [
        {
            "outcome": outcome,
            "average_effectiveness": round(
                sum(scores) / len(scores),
                2
            )
        }
        for outcome, scores in grouped.items()
    ]


# ---------------------------------------------------------
# Treatment Analysis
# ---------------------------------------------------------

@router.get("/treatment-analysis")
def treatment_analysis(
    user=Depends(get_current_user)
):
    """
    Return treatment analysis from the dataset.
    """

    if user.role not in {
        "doctor",
        "hospital_administrator",
        "healthcare_researcher",
        "system_administrator"
    }:
        raise HTTPException(
            status_code=403,
            detail="Insufficient permissions"
        )

    return dataset_treatment_analysis()