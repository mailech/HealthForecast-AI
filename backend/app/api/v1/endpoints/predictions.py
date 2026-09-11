from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.api.deps import get_current_user, require_roles
from app.models.user import User
from app.models.encounter import Encounter
from app.models.patient import Patient
from app.models.prediction import ReadmissionPrediction
from app.schemas.prediction import (
    EncounterPredictionRequest,
    PredictionResponse,
    TopRiskFactorItem,
    CDSSRecommendationItem
)
from ml.inference import get_inference_engine
from ml.cdss import get_cdss_engine


router = APIRouter()

ALLOWED_ROLES = [
    "Doctor",
    "Hospital Administrator",
    "Healthcare Researcher",
    "System Administrator"
]

def map_db_encounter_to_dict(encounter: Encounter, patient: Patient) -> Dict[str, Any]:
    """Extract clinical features from DB Encounter and Patient objects."""
    return {
        "race": patient.race if patient and patient.race else "Caucasian",
        "gender": patient.gender if patient and patient.gender else "Female",
        "age": patient.age_group if patient and patient.age_group else "[60-70)",
        "admission_type_id": encounter.admission_type_id or 1,
        "discharge_disposition_id": encounter.discharge_disposition_id or 1,
        "admission_source_id": encounter.admission_source_id or 7,

        "time_in_hospital": encounter.time_in_hospital,
        "payer_code": encounter.payer_code or "?",
        "medical_specialty": encounter.medical_specialty or "?",
        "num_lab_procedures": encounter.num_lab_procedures,
        "num_procedures": encounter.num_procedures,
        "num_medications": encounter.num_medications,
        "number_outpatient": encounter.number_outpatient,
        "number_emergency": encounter.number_emergency,
        "number_inpatient": encounter.number_inpatient,
        "diag_1": encounter.diag_1 or "414",
        "diag_2": encounter.diag_2 or "250.00",
        "diag_3": encounter.diag_3 or "401",
        "number_diagnoses": encounter.number_diagnoses,
        "max_glu_serum": encounter.max_glu_serum or "None",
        "A1Cresult": encounter.a1c_result or "None",
        "change": encounter.change_status or "No",
        "diabetesMed": encounter.diabetes_med or "No",
        "metformin": encounter.metformin or "No",
        "repaglinide": encounter.repaglinide or "No",
        "nateglinide": encounter.nateglinide or "No",
        "chlorpropamide": encounter.chlorpropamide or "No",
        "glimepiride": encounter.glimepiride or "No",
        "acetohexamide": encounter.acetohexamide or "No",
        "glipizide": encounter.glipizide or "No",
        "glyburide": encounter.glyburide or "No",
        "tolbutamide": encounter.tolbutamide or "No",
        "pioglitazone": encounter.pioglitazone or "No",
        "rosiglitazone": encounter.rosiglitazone or "No",
        "acarbose": encounter.acarbose or "No",
        "miglitol": encounter.miglitol or "No",
        "troglitazone": encounter.troglitazone or "No",
        "tolazamide": encounter.tolazamide or "No",
        "examide": encounter.examide or "No",
        "citoglipton": encounter.citoglipton or "No",
        "insulin": encounter.insulin or "No",
        "glyburide_metformin": encounter.glyburide_metformin or "No",
        "glipizide_metformin": encounter.glipizide_metformin or "No",
        "glimepiride_pioglitazone": encounter.glimepiride_pioglitazone or "No",
        "metformin_rosiglitazone": encounter.metformin_rosiglitazone or "No",
        "metformin_pioglitazone": encounter.metformin_pioglitazone or "No"
    }

@router.post("/predict", response_model=PredictionResponse)
async def predict_custom_encounter(
    request: EncounterPredictionRequest,
    current_user: User = Depends(require_roles(ALLOWED_ROLES))
):
    """
    Generate readmission risk prediction and CDSS recommendations for custom raw clinical input.
    """
    raw_data = request.model_dump()

    
    # 1. Run inference engine
    inference_engine = get_inference_engine()
    pred_res = inference_engine.predict(raw_data)
    
    # 2. Run CDSS engine
    cdss_engine = get_cdss_engine()
    recommendations = cdss_engine.generate_recommendations(
        encounter_data=raw_data,
        risk_category=pred_res["risk_category"],
        risk_probability=pred_res["risk_probability"]
    )
    
    return PredictionResponse(
        encounter_id=None,
        patient_id=None,
        risk_probability=pred_res["risk_probability"],
        risk_percentage=pred_res["risk_percentage"],
        risk_category=pred_res["risk_category"],
        prediction=pred_res["prediction"],
        predicted_class_label=pred_res["predicted_class_label"],
        top_risk_factors=[TopRiskFactorItem(**item) for item in pred_res["top_risk_factors"]],
        cdss_recommendations=[CDSSRecommendationItem(**item) for item in recommendations],
        model_name=pred_res["model_name"],
        model_version=pred_res["model_version"],
        timestamp=pred_res["timestamp"],
        disclaimer=pred_res["disclaimer"]
    )

@router.post("/predict/{encounter_id}", response_model=PredictionResponse)
async def predict_stored_encounter(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(ALLOWED_ROLES))
):
    """
    Generate readmission risk prediction for a stored database encounter and log prediction.
    """
    # Query encounter with patient relationship
    query = select(Encounter).options(selectinload(Encounter.patient)).where(Encounter.encounter_id == encounter_id)
    result = await db.execute(query)
    encounter = result.scalar_one_or_none()
    
    if not encounter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Encounter with ID '{encounter_id}' not found."
        )
        
    raw_data = map_db_encounter_to_dict(encounter, encounter.patient)
    
    # Run ML Inference Engine
    inference_engine = get_inference_engine()
    pred_res = inference_engine.predict(raw_data)
    
    # Run CDSS Engine
    cdss_engine = get_cdss_engine()
    recommendations = cdss_engine.generate_recommendations(
        encounter_data=raw_data,
        risk_category=pred_res["risk_category"],
        risk_probability=pred_res["risk_probability"]
    )
    
    # Save Prediction log to DB
    prediction_record = ReadmissionPrediction(
        encounter_id=encounter.id,
        predicted_by_user_id=current_user.id if current_user else None,
        readmission_risk_score=pred_res["risk_probability"],
        risk_level=pred_res["risk_category"].upper().replace(" ", "_"),
        predicted_readmitted=pred_res["predicted_class_label"],
        model_version=pred_res["model_version"],
        top_risk_factors=pred_res["top_risk_factors"],
        clinical_recommendations=recommendations
    )
    db.add(prediction_record)
    await db.commit()
    
    return PredictionResponse(
        encounter_id=encounter.encounter_id,
        patient_id=encounter.patient_id,
        risk_probability=pred_res["risk_probability"],
        risk_percentage=pred_res["risk_percentage"],
        risk_category=pred_res["risk_category"],
        prediction=pred_res["prediction"],
        predicted_class_label=pred_res["predicted_class_label"],
        top_risk_factors=[TopRiskFactorItem(**item) for item in pred_res["top_risk_factors"]],
        cdss_recommendations=[CDSSRecommendationItem(**item) for item in recommendations],
        model_name=pred_res["model_name"],
        model_version=pred_res["model_version"],
        timestamp=pred_res["timestamp"],
        disclaimer=pred_res["disclaimer"]
    )

@router.get("/encounter/{encounter_id}", response_model=List[Dict[str, Any]])
async def get_encounter_prediction_history(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_roles(ALLOWED_ROLES))
):
    """
    Retrieve historical prediction logs for a specific encounter.
    """
    query = select(Encounter).where(Encounter.encounter_id == encounter_id)
    res = await db.execute(query)
    encounter = res.scalar_one_or_none()
    
    if not encounter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Encounter with ID '{encounter_id}' not found."
        )
        
    pred_query = select(ReadmissionPrediction).where(
        ReadmissionPrediction.encounter_id == encounter.id
    ).order_by(ReadmissionPrediction.created_at.desc())
    
    pred_res = await db.execute(pred_query)
    predictions = pred_res.scalars().all()
    
    return [
        {
            "id": p.id,
            "encounter_id": encounter.encounter_id,
            "risk_score": p.readmission_risk_score,
            "risk_level": p.risk_level,
            "predicted_readmitted": p.predicted_readmitted,
            "model_version": p.model_version,
            "top_risk_factors": p.top_risk_factors,
            "clinical_recommendations": p.clinical_recommendations,
            "created_at": p.created_at.isoformat()
        }
        for p in predictions
    ]
