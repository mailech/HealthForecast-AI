"""
HealthForecast AI - Pydantic Request & Response Schemas
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class PatientEncounterInput(BaseModel):
    patient_id: Optional[int] = None
    age_num: int = 65
    time_in_hospital: int = 5
    num_lab_procedures: int = 45
    num_procedures: int = 1
    num_medications: int = 16
    number_outpatient: int = 0
    number_emergency: int = 1
    number_inpatient: int = 1
    number_diagnoses: int = 8
    high_glucose: int = 0
    high_a1c: int = 1
    insulin_changed: int = 1
    diabetes_med: int = 1
    comorbidity_circulatory: int = 1
    comorbidity_renal: int = 0
    comorbidity_respiratory: int = 0
    model_name: Optional[str] = "RandomForest"

class RecommendationCreate(BaseModel):
    patient_id: int
    category: str
    title: str
    description: str
    priority: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: str
    department: str

class RetrainRequest(BaseModel):
    n_samples: int = 3000
    test_size: float = 0.25
    algorithm: Optional[str] = "RandomForest"

class SwitchModelRequest(BaseModel):
    model_name: str
