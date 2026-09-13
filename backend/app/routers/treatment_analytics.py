from collections import Counter, defaultdict
from datetime import date
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.patient import Patient, Treatment
from ..models.user import User
from ..utils.security import get_current_user


router = APIRouter(
    prefix="/treatments",
    tags=["Treatment Effectiveness"],
)


# ============================================================
# OUTCOME CLASSIFICATION
# ============================================================

def classify_outcome(outcome: str | None) -> str:
    """
    Convert free-text treatment outcomes into a small set of
    analytics categories.

    This is a reporting classification only. It does not
    represent a clinical efficacy guideline.
    """

    if not outcome:
        return "Not Recorded"

    value = outcome.strip().lower()

    positive_terms = {
        "successful",
        "success",
        "improved",
        "improvement",
        "recovered",
        "recovery",
        "effective",
        "responded",
        "stable",
        "resolved",
        "better",
        "favorable",
        "favourable",
        "completed",
    }

    negative_terms = {
        "failed",
        "failure",
        "worsened",
        "worse",
        "ineffective",
        "adverse",
        "complication",
        "declined",
        "deteriorated",
        "not improved",
    }

    ongoing_terms = {
        "ongoing",
        "in progress",
        "active",
        "continuing",
        "continued",
        "under treatment",
        "monitoring",
    }

    if any(term in value for term in negative_terms):
        return "Unfavorable"
    
    if any(term in value for term in positive_terms):
        return "Favorable"

    if any(term in value for term in ongoing_terms):
        return "Ongoing"

    return "Not Classified"


# ============================================================
# ACCESS CONTROL
# ============================================================

def check_patient_access(
    patient: Patient,
    current_user: User,
) -> None:
    """
    Apply the project's role-based patient access rules.
    """

    role = current_user.role.value

    if role == "system_admin":
        return

    if role == "hospital_admin":
        return

    if role == "doctor":
        if patient.assigned_doctor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "You can only access treatment analytics "
                    "for your assigned patients."
                ),
            )

        return

    if role == "healthcare_researcher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Researchers cannot access identifiable "
                "patient treatment analytics."
            ),
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to access treatment analytics.",
    )


# ============================================================
# HELPERS
# ============================================================

def calculate_duration_days(
    start_date: date | None,
    end_date: date | None,
) -> int | None:
    """
    Calculate treatment duration when both dates are available.
    """

    if start_date is None or end_date is None:
        return None

    duration = (end_date - start_date).days

    return max(duration, 0)


def treatment_to_record(
    treatment: Treatment,
) -> dict[str, Any]:
    """
    Convert a treatment database record into an analytics record.
    """

    outcome_category = classify_outcome(
        treatment.outcome
    )

    duration_days = calculate_duration_days(
        treatment.start_date,
        treatment.end_date,
    )

    return {
        "id": treatment.id,
        "patient_id": treatment.patient_id,
        "treatment_name": treatment.treatment_name,
        "medication": treatment.medication,
        "dosage": treatment.dosage,
        "start_date": treatment.start_date,
        "end_date": treatment.end_date,
        "outcome": treatment.outcome,
        "outcome_category": outcome_category,
        "duration_days": duration_days,
    }


# ============================================================
# AGGREGATE TREATMENT EFFECTIVENESS
# ============================================================

@router.get("/effectiveness")
def get_treatment_effectiveness(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate aggregate treatment effectiveness analytics.

    Accessible to:
        - Doctor
        - Hospital Administrator
        - Healthcare Researcher
        - System Administrator

    No identifiable patient information is returned.
    """

    role = current_user.role.value

    if role not in {
        "doctor",
        "hospital_admin",
        "healthcare_researcher",
        "system_admin",
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access treatment analytics.",
        )

    # --------------------------------------------------------
    # Retrieve treatments according to role
    # --------------------------------------------------------

    if role == "doctor":
        treatments = (
            db.query(Treatment)
            .join(
                Patient,
                Treatment.patient_id == Patient.id,
            )
            .filter(
                Patient.assigned_doctor_id == current_user.id
            )
            .all()
        )

    else:
        treatments = (
            db.query(Treatment)
            .all()
        )

    # --------------------------------------------------------
    # Basic counts
    # --------------------------------------------------------

    total_treatments = len(treatments)

    patient_ids = {
        treatment.patient_id
        for treatment in treatments
    }

    total_patients = len(patient_ids)

    # --------------------------------------------------------
    # Outcome distribution
    # --------------------------------------------------------

    outcome_counter = Counter()

    for treatment in treatments:
        category = classify_outcome(
            treatment.outcome
        )

        outcome_counter[category] += 1

    # --------------------------------------------------------
    # Effectiveness calculation
    # --------------------------------------------------------

    classified_outcomes = (
        outcome_counter["Favorable"]
        + outcome_counter["Unfavorable"]
    )

    favorable_outcomes = (
        outcome_counter["Favorable"]
    )

    if classified_outcomes > 0:
        effectiveness_rate = (
            favorable_outcomes
            / classified_outcomes
        ) * 100
    else:
        effectiveness_rate = 0.0

    # --------------------------------------------------------
    # Treatment duration
    # --------------------------------------------------------

    durations = []

    for treatment in treatments:
        duration = calculate_duration_days(
            treatment.start_date,
            treatment.end_date,
        )

        if duration is not None:
            durations.append(duration)

    average_duration_days = (
        sum(durations) / len(durations)
        if durations
        else 0.0
    )

    # --------------------------------------------------------
    # Treatment type analysis
    # --------------------------------------------------------

    treatment_stats = defaultdict(
        lambda: {
            "total": 0,
            "favorable": 0,
            "unfavorable": 0,
            "ongoing": 0,
            "not_recorded": 0,
        }
    )

    for treatment in treatments:

        name = (
            treatment.treatment_name
            or "Unknown Treatment"
        )

        category = classify_outcome(
            treatment.outcome
        )

        treatment_stats[name]["total"] += 1

        if category == "Favorable":
            treatment_stats[name]["favorable"] += 1

        elif category == "Unfavorable":
            treatment_stats[name]["unfavorable"] += 1

        elif category == "Ongoing":
            treatment_stats[name]["ongoing"] += 1

        else:
            treatment_stats[name]["not_recorded"] += 1

    treatment_effectiveness = []

    for treatment_name, stats in treatment_stats.items():

        classified = (
            stats["favorable"]
            + stats["unfavorable"]
        )

        rate = (
            stats["favorable"] / classified * 100
            if classified > 0
            else 0.0
        )

        treatment_effectiveness.append(
            {
                "treatment_name": treatment_name,
                "total_records": stats["total"],
                "favorable": stats["favorable"],
                "unfavorable": stats["unfavorable"],
                "ongoing": stats["ongoing"],
                "not_recorded": stats["not_recorded"],
                "effectiveness_rate": round(
                    rate,
                    2,
                ),
            }
        )

    treatment_effectiveness.sort(
        key=lambda item: item["total_records"],
        reverse=True,
    )

    # --------------------------------------------------------
    # Medication outcome analysis
    # --------------------------------------------------------

    medication_stats = defaultdict(
        lambda: {
            "total": 0,
            "favorable": 0,
            "unfavorable": 0,
            "ongoing": 0,
            "not_recorded": 0,
        }
    )

    for treatment in treatments:

        medication = (
            treatment.medication
            or "Not Recorded"
        )

        category = classify_outcome(
            treatment.outcome
        )

        medication_stats[medication]["total"] += 1

        if category == "Favorable":
            medication_stats[medication]["favorable"] += 1

        elif category == "Unfavorable":
            medication_stats[medication]["unfavorable"] += 1

        elif category == "Ongoing":
            medication_stats[medication]["ongoing"] += 1

        else:
            medication_stats[medication]["not_recorded"] += 1

    medication_outcomes = []

    for medication, stats in medication_stats.items():

        classified = (
            stats["favorable"]
            + stats["unfavorable"]
        )

        rate = (
            stats["favorable"] / classified * 100
            if classified > 0
            else 0.0
        )

        medication_outcomes.append(
            {
                "medication": medication,
                "total_records": stats["total"],
                "favorable": stats["favorable"],
                "unfavorable": stats["unfavorable"],
                "ongoing": stats["ongoing"],
                "not_recorded": stats["not_recorded"],
                "outcome_rate": round(
                    rate,
                    2,
                ),
            }
        )

    medication_outcomes.sort(
        key=lambda item: item["total_records"],
        reverse=True,
    )

    # --------------------------------------------------------
    # Return aggregate analytics
    # --------------------------------------------------------

    return {
        "total_patients": total_patients,
        "total_treatments": total_treatments,

        "outcome_distribution": {
            "favorable": outcome_counter["Favorable"],
            "unfavorable": outcome_counter["Unfavorable"],
            "ongoing": outcome_counter["Ongoing"],
            "not_recorded": (
                outcome_counter["Not Recorded"]
                + outcome_counter["Not Classified"]
            ),
        },

        "effectiveness_rate": round(
            effectiveness_rate,
            2,
        ),

        "average_treatment_duration_days": round(
            average_duration_days,
            2,
        ),

        "treatment_effectiveness": treatment_effectiveness,

        "medication_outcomes": medication_outcomes,

        "privacy": (
            "Aggregate treatment analytics only. "
            "No identifiable patient information is returned."
        ),
    }


# ============================================================
# PATIENT-SPECIFIC TREATMENT ANALYSIS
# ============================================================

@router.get("/effectiveness/{patient_id}")
def get_patient_treatment_effectiveness(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate treatment effectiveness analytics for one patient.

    Identifiable access:
        - Doctor: assigned patients only
        - Hospital Administrator: allowed
        - System Administrator: allowed

    Researchers are explicitly denied access.
    """

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient_id
        )
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found.",
        )

    check_patient_access(
        patient,
        current_user,
    )

    treatments = (
        db.query(Treatment)
        .filter(
            Treatment.patient_id == patient_id
        )
        .order_by(
            Treatment.start_date.desc()
        )
        .all()
    )

    records = [
        treatment_to_record(treatment)
        for treatment in treatments
    ]

    outcome_counter = Counter(
        record["outcome_category"]
        for record in records
    )

    classified_outcomes = (
        outcome_counter["Favorable"]
        + outcome_counter["Unfavorable"]
    )

    favorable = outcome_counter["Favorable"]

    effectiveness_rate = (
        favorable / classified_outcomes * 100
        if classified_outcomes > 0
        else 0.0
    )

    durations = [
        record["duration_days"]
        for record in records
        if record["duration_days"] is not None
    ]

    average_duration = (
        sum(durations) / len(durations)
        if durations
        else 0.0
    )

    return {
        "patient_id": patient.id,
        "patient_name": patient.name,

        "total_treatments": len(records),

        "outcome_distribution": {
            "favorable": outcome_counter["Favorable"],
            "unfavorable": outcome_counter["Unfavorable"],
            "ongoing": outcome_counter["Ongoing"],
            "not_recorded": (
                outcome_counter["Not Recorded"]
                + outcome_counter["Not Classified"]
            ),
        },

        "effectiveness_rate": round(
            effectiveness_rate,
            2,
        ),

        "average_treatment_duration_days": round(
            average_duration,
            2,
        ),

        "treatments": records,

        "notice": (
            "Treatment outcome analysis is based on "
            "recorded treatment outcomes and is intended "
            "to support clinical review."
        ),
    }