from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import (
    get_current_user,
    require_roles,
)

from ml.model_service import (
    predict_readmission,
)


router = APIRouter(
    prefix="/prediction",
    tags=["Prediction"]
)


# ============================================================
# CREATE PREDICTION
# ADMIN + DOCTOR
# ============================================================

@router.post(
    "/",
    response_model=schemas.PredictionResponse
)
def create_prediction(
    request: schemas.PredictionRequest,
    current_user=Depends(
        require_roles(
            "admin",
            "doctor",
        )
    ),
    db: Session = Depends(get_db)
):

    # ========================================================
    # GET PATIENT
    # ========================================================

    patient = (
        db.query(models.Patient)
        .filter(
            models.Patient.id ==
            request.patient_id
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )


    # ========================================================
    # ML PREDICTION
    # ========================================================

    try:

        result = predict_readmission(
            age=patient.age,
            gender=patient.gender,
            disease=patient.disease,
        )

    except FileNotFoundError as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    except Exception as error:

        print(
            "ML prediction error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to generate ML prediction"
        )


    # ========================================================
    # SAVE PREDICTION
    # ========================================================

    prediction = models.Prediction(
        patient_id=patient.id,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        recommendation=result["recommendation"],
    )

    db.add(prediction)

    db.commit()

    db.refresh(prediction)


    return prediction


# ============================================================
# GET PATIENT PREDICTIONS
# ============================================================

@router.get(
    "/patient/{patient_id}",
    response_model=list[schemas.PredictionResponse]
)
def get_patient_predictions(
    patient_id: int,
    current_user=Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    patient = (
        db.query(models.Patient)
        .filter(
            models.Patient.id ==
            patient_id
        )
        .first()
    )

    if not patient:

        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )


    # ========================================================
    # PATIENT CAN SEE ONLY THEIR OWN PREDICTIONS
    # ========================================================

    if current_user.role == "patient":

        if patient.user_id != current_user.id:

            raise HTTPException(
                status_code=403,
                detail=(
                    "You can only access "
                    "your own predictions"
                )
            )


    # ========================================================
    # RETURN HISTORY
    # ========================================================

    return (
        db.query(models.Prediction)
        .filter(
            models.Prediction.patient_id ==
            patient_id
        )
        .order_by(
            models.Prediction.created_at.desc()
        )
        .all()
    ) 