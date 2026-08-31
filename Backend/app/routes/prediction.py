from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.prediction import PredictionInput, PredictionResponse, PredictionSave, PredictionInDB
from app.services.prediction_service import PredictionService
from app.dependencies import RoleChecker, get_current_user

router = APIRouter(prefix="/prediction", tags=["Readmission Risk Prediction"])

# Define access rights
predict_dependency = Depends(RoleChecker(allowed_roles=["Doctor", "Healthcare Researcher", "System Administrator"]))
save_dependency = Depends(RoleChecker(allowed_roles=["Doctor", "Healthcare Researcher", "System Administrator"]))
history_dependency = Depends(RoleChecker(allowed_roles=["Doctor", "Hospital Administrator", "Healthcare Researcher", "System Administrator"]))
delete_dependency = Depends(RoleChecker(allowed_roles=["Doctor", "System Administrator"]))

@router.post("/predict", response_model=PredictionResponse, dependencies=[predict_dependency])
def predict_risk(prediction_in: PredictionInput, current_user: dict = Depends(get_current_user)):
    """
    Inputs clinical metrics to classify a patient's readmission risk score and level.
    """
    try:
        prediction_result = PredictionService.predict_readmission(prediction_in, current_user["email"])
        return prediction_result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prediction error: {e}"
        )

@router.post("", response_model=PredictionInDB, dependencies=[save_dependency])
def save_prediction(prediction_save: PredictionSave):
    """
    Persists a risk prediction analysis to the database history logs.
    """
    try:
        features_used = prediction_save.features_used or {
            "patient_id": prediction_save.patient_id,
            "prediction_date": prediction_save.prediction_date.isoformat() if prediction_save.prediction_date else None,
            "predicted_by": prediction_save.predicted_by,
        }
        res = PredictionService.save_prediction(prediction_save, features_used=features_used)
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to persist prediction record: {e}"
        )

@router.get("/patient/{patient_id}", response_model=List[PredictionInDB], dependencies=[history_dependency])
def get_patient_predictions(patient_id: str):
    """
    Retrieves all readmission predictions calculated for a patient.
    """
    return PredictionService.get_predictions_by_patient(patient_id)

@router.get("", response_model=List[PredictionInDB], dependencies=[history_dependency])
def list_predictions(skip: int = 0, limit: int = 100):
    """
    Lists historical readmission predictions.
    """
    return PredictionService.get_all_predictions(skip=skip, limit=limit)

@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[delete_dependency])
def delete_prediction(prediction_id: str):
    """
    Deletes a prediction record from the database.
    """
    success = PredictionService.delete_prediction(prediction_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found or delete failed."
        )
