from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union

class MedicationItemSchema(BaseModel):
    medication_name: str
    dosage_status: str = "Steady"

class PredictionRequestSchema(BaseModel):
    patient_nbr: Optional[Union[int, str]] = 1001
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[Union[str, int]] = "[60-70)"
    gender: Optional[str] = "Female"
    race: Optional[str] = "Caucasian"
    admission_type: Optional[str] = "Emergency"
    medical_specialty: Optional[str] = "InternalMedicine"
    time_in_hospital: int = Field(default=4, ge=1, le=365, description="Hospital stay duration in days")
    num_lab_procedures: int = Field(default=45, ge=0, le=200, description="Number of clinical lab tests performed")
    num_procedures: int = Field(default=1, ge=0, le=50, description="Number of non-lab medical procedures")
    num_medications: int = Field(default=12, ge=0, le=100, description="Total distinct medications administered")
    number_outpatient: int = Field(default=0, ge=0, le=100, description="Prior outpatient visits in past year")
    number_emergency: int = Field(default=0, ge=0, le=100, description="Prior emergency room encounters")
    number_inpatient: int = Field(default=0, ge=0, le=100, description="Prior inpatient hospitalizations")
    number_diagnoses: int = Field(default=3, ge=1, le=16, description="Number of recorded diagnoses")
    diag_1: Optional[str] = "250.00 Diabetes Mellitus"
    diag_2: Optional[str] = "401.90 Essential Hypertension"
    diag_3: Optional[str] = "414.01 Coronary Atherosclerosis"
    max_glu_serum: Optional[str] = "Norm"
    A1Cresult: Optional[str] = ">8"
    change: Optional[str] = "Ch"
    diabetesMed: Optional[str] = "Yes"
    medications: Optional[List[MedicationItemSchema]] = []

    class Config:
        extra = "allow"

class PredictionResponseSchema(BaseModel):
    risk_score: float
    risk_category: str
    readmitted_forecast: str
    predicted_length_of_stay_days: float
    model_version: str
    model_confidence: str
    risk_drivers: List[Dict[str, Any]]

class LoSPredictionResponseSchema(BaseModel):
    predicted_length_of_stay_days: float
