from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud
from ..models import Patient


router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"],
)


# =========================
# CREATE PREDICTION
# =========================

@router.post(
    "",
    response_model=schemas.PredictionResponse,
)
def predict_risk(
    data: schemas.PredictionRequest,
    db: Session = Depends(get_db),
):

    # -------------------------
    # Find patient
    # -------------------------

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == data.patient_id
        )
        .first()
    )

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )


    # -------------------------
    # Risk calculation
    # -------------------------
    #
    # This is the current
    # rule-based prediction.
    #
    # Later we can replace
    # this section with your
    # trained ML model.
    # -------------------------

    score = 0.0


    # Age

    if patient.age >= 65:

        score += 0.40

    elif patient.age >= 50:

        score += 0.20

    else:

        score += 0.10


    # Existing patient risk

    if patient.risk:

        risk = patient.risk.lower()

        if risk == "high":

            score += 0.35

        elif risk == "medium":

            score += 0.20

        else:

            score += 0.05


    # Disease

    if patient.disease:

        disease = patient.disease.lower()

        high_risk_diseases = [
            "heart disease",
            "stroke",
            "cancer",
            "kidney disease",
            "diabetes",
        ]

        if any(
            item in disease
            for item in high_risk_diseases
        ):

            score += 0.15


    # Make sure score stays between 0 and 1

    score = min(score, 1.0)


    # -------------------------
    # Risk level
    # -------------------------

    if score >= 0.70:

        level = "High"

        recommendation = (
            "High readmission risk detected. "
            "Close monitoring and regular "
            "follow-up are recommended."
        )

    elif score >= 0.40:

        level = "Medium"

        recommendation = (
            "Moderate readmission risk detected. "
            "Regular monitoring and follow-up "
            "are recommended."
        )

    else:

        level = "Low"

        recommendation = (
            "Low readmission risk detected. "
            "Routine follow-up and monitoring "
            "are recommended."
        )


    # -------------------------
    # Save prediction
    # -------------------------

    prediction = crud.create_prediction(
        db=db,
        patient_id=patient.id,
        risk_score=score,
        risk_level=level,
        recommendation=recommendation,
    )


    return prediction


# =========================
# GET PATIENT PREDICTIONS
# =========================

@router.get(
    "/patient/{patient_id}",
    response_model=list[
        schemas.PredictionResponse
    ],
)
def get_predictions(
    patient_id: int,
    db: Session = Depends(get_db),
):

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == patient_id
        )
        .first()
    )

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )


    return crud.get_patient_predictions(
        db,
        patient_id,
    ) 