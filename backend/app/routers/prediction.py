from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd

from ..database import get_db
from .. import models, schemas
from ..auth import (
    get_current_user,
    require_roles,
)

from ml.model_service import predict_readmission


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

    # Get patient
    patient = (
        db.query(models.Patient)
        .filter(
            models.Patient.id == request.patient_id
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

        data = pd.DataFrame([{
            "race": "Caucasian",
            "gender": patient.gender or "Female",
            "age": "[40-50)",
            "admission_type_id": 1,
            "discharge_disposition_id": 1,
            "admission_source_id": 7,
            "time_in_hospital": 4,
            "num_lab_procedures": 40,
            "num_procedures": 1,
            "num_medications": 10,
            "number_outpatient": 0,
            "number_emergency": 0,
            "number_inpatient": 0,
            "number_diagnoses": 3,
            "max_glu_serum": "None",
            "A1Cresult": "None",
            "insulin": "No",
            "change": "No",
            "diabetesMed": "Yes",
        }])

        result = predict_readmission(data)

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
            detail=f"Unable to generate ML prediction: {error}"
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
            models.Patient.id == patient_id
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # Return prediction history
    return (
        db.query(models.Prediction)
        .filter(
            models.Prediction.patient_id == patient_id
        )
        .order_by(
            models.Prediction.created_at.desc()
        )
        .all()
    ) 