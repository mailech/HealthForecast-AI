from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.object_id import PyObjectId

class PredictionInput(BaseModel):
    patient_id: str
    age: int = Field(..., ge=0, le=120)
    gender: str = Field(..., description="Male, Female, Other")
    length_of_stay: int = Field(..., ge=0)
    num_previous_admissions: int = Field(..., ge=0)
    num_medications: int = Field(..., ge=0)
    systolic_bp: int = Field(..., ge=40, le=250)
    diastolic_bp: int = Field(..., ge=30, le=160)
    blood_sugar: float = Field(..., ge=30, le=600)
    comorbidity_count: int = Field(0, ge=0)

class PredictionResponse(BaseModel):
    patient_id: str
    readmission_risk_score: float = Field(..., description="Probability of readmission between 0.0 and 1.0")
    risk_level: str = Field(..., description="High, Medium, or Low")
    prediction_date: datetime = Field(default_factory=datetime.utcnow)
    predicted_by: Optional[str] = None
    notes: Optional[str] = None

class PredictionSave(PredictionResponse):
    features_used: Dict[str, Any]

class PredictionInDB(PredictionSave):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }
