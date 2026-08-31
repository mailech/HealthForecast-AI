from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.object_id import PyObjectId

class PredictionInput(BaseModel):
    patient_id: str
    race: Optional[str] = Field("Caucasian", description="Caucasian, AfricanAmerican, Hispanic, Asian, Other, Unknown")
    gender: str = Field("Female", description="Male, Female")
    age: str = Field("[50-60)", description="[0-10), [10-20), [20-30), [30-40), [40-50), [50-60), [60-70), [70-80), [80-90), [90-100)")
    admission_type_id: int = Field(1, ge=1, le=8)
    discharge_disposition_id: int = Field(1, ge=1, le=30)
    admission_source_id: int = Field(7, ge=1, le=25)
    time_in_hospital: int = Field(3, ge=1, le=14)
    num_lab_procedures: int = Field(40, ge=1, le=150)
    num_procedures: int = Field(1, ge=0, le=10)
    num_medications: int = Field(15, ge=1, le=100)
    number_outpatient: int = Field(0, ge=0)
    number_emergency: int = Field(0, ge=0)
    number_inpatient: int = Field(0, ge=0)
    diag_1: str = Field("250.01", description="Primary ICD-9 diagnosis code")
    diag_2: str = Field("401", description="Secondary ICD-9 diagnosis code")
    diag_3: str = Field("272", description="Tertiary ICD-9 diagnosis code")
    number_diagnoses: int = Field(9, ge=1, le=16)
    medical_specialty: str = Field("InternalMedicine")
    change: str = Field("No", description="Ch, No")
    diabetesMed: str = Field("Yes", description="Yes, No")
    medications: Optional[Dict[str, str]] = Field(default_factory=dict)

    model_config = {
        "extra": "allow"
    }

class PredictionResponse(BaseModel):
    patient_id: str
    model1_probability: float = Field(..., description="Probability score from Model 1 (Patient Risk)")
    model1_prediction: str = Field(..., description="Prediction label from Model 1")
    model2_probability: float = Field(..., description="Probability score from Model 2 (Readmission)")
    model2_prediction: str = Field(..., description="Prediction label from Model 2")
    readmission_risk_score: float = Field(..., description="Max risk score between 0.0 and 1.0")
    risk_level: str = Field(..., description="High, Medium, or Low")
    clinical_interpretation: str = Field(..., description="Detailed clinical summary")
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
