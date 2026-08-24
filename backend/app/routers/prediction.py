from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.prediction import PredictionCreate, PredictionResponse
from app.core.rbac import RoleChecker
from app.db.database import get_db
from app.models.patient import Patient
from app.models.prediction import Prediction
from app.models.user import UserRole
from app.services.ml_service import MLService


router = APIRouter(
    prefix="/predictions",
    tags=["Predictions"]
)


@router.post(
    "/predict",
    response_model=PredictionResponse
)
async def predict_readmission(
    payload: PredictionCreate,
    token=Depends(RoleChecker([UserRole.DOCTOR])),
    db: AsyncSession = Depends(get_db),
):
    """Generate patient readmission risk using the trained ML model."""

    try:
        result = await MLService.predict_readmission_risk(payload)

        patient = await db.scalar(
            select(Patient).where(Patient.id == payload.patient_id)
        )
        if patient is None:
            raise HTTPException(status_code=404, detail="Patient not found")

        prediction = Prediction(
            patient_id=payload.patient_id,
            readmission_risk_score=result["readmission_risk_score"],
            risk_category=result["risk_category"],
            model_version=result["model_version"],
        )
        db.add(prediction)
        await db.flush()

        return PredictionResponse(
            id=prediction.id,
            patient_id=payload.patient_id,
            readmission_risk_score=result["readmission_risk_score"],
            risk_category=result["risk_category"],
            model_version=result["model_version"],
            probabilities=result["probabilities"],
            patient_name=f"{patient.first_name} {patient.last_name}",
        )

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Prediction failed: {str(error)}"
        )


@router.get(
    "/patient/{patient_id}",
    response_model=list[PredictionResponse],
)
async def get_patient_prediction_history(
    patient_id: int,
    token=Depends(RoleChecker([UserRole.DOCTOR])),
    db: AsyncSession = Depends(get_db),
):
    """Return persisted prediction history for one patient."""
    patient = await db.scalar(select(Patient).where(Patient.id == patient_id))
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    result = await db.execute(
        select(Prediction)
        .where(Prediction.patient_id == patient_id)
        .order_by(Prediction.created_at.desc())
    )
    return [
        PredictionResponse(
            id=prediction.id,
            patient_id=prediction.patient_id,
            readmission_risk_score=prediction.readmission_risk_score,
            risk_category=prediction.risk_category,
            model_version=prediction.model_version,
            patient_name=f"{patient.first_name} {patient.last_name}",
        )
        for prediction in result.scalars().all()
    ]