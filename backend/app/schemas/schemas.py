from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserRegister(BaseModel):
    full_name: str
    email: str
    password: str
    role: Optional[str] = "Doctor"
    hospital_name: Optional[str] = "MetroHealth General Hospital"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    hospital_name: str

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Prediction Request & Response Schemas
class PredictionInput(BaseModel):
    age: int = Field(..., ge=18, le=110)
    prior_admissions: int = Field(..., ge=0)
    emergency_visits: int = Field(..., ge=0)
    length_of_stay: int = Field(..., ge=1)
    charlson_index: int = Field(..., ge=0, le=12)
    lace_index: int = Field(..., ge=0, le=19)
    hba1c: float = Field(..., ge=3.0, le=20.0)
    serum_sodium: float = Field(..., ge=110.0, le=160.0)
    creatinine: float = Field(..., ge=0.2, le=15.0)
    polypharmacy_count: int = Field(..., ge=0)
    patient_id: Optional[int] = None

class KeyFactor(BaseModel):
    factor: str
    impact: str # High, Moderate, Low
    value: str

class PredictionResult(BaseModel):
    patient_id: Optional[int] = None
    risk_score: float
    risk_level: str # Low, Medium, High
    confidence: float
    key_factors: List[KeyFactor]
    recommendations: List[str]
    created_at: str

# Patient Schemas
class PatientCreate(BaseModel):
    first_name: str
    last_name: str
    age: int
    gender: str
    department: str
    primary_diagnosis: str
    admission_date: str
    status: Optional[str] = "Admitted"
    prior_admissions: int = 0
    emergency_visits: int = 0
    length_of_stay: int = 1
    charlson_index: int = 1
    lace_index: int = 5
    hba1c: float = 6.5
    serum_sodium: float = 138.0
    creatinine: float = 1.0
    polypharmacy_count: int = 3

class PatientResponse(BaseModel):
    id: int
    patient_code: str
    first_name: str
    last_name: str
    age: int
    gender: str
    department: str
    primary_diagnosis: str
    admission_date: str
    discharge_date: Optional[str] = None
    status: str
    prior_admissions: int
    emergency_visits: int
    length_of_stay: int
    charlson_index: int
    lace_index: int
    hba1c: float
    serum_sodium: float
    creatinine: float
    polypharmacy_count: int
    readmission_risk_score: float
    risk_level: str

    class Config:
        from_attributes = True

# Dashboard Summary Schema
class DashboardSummary(BaseModel):
    total_patients: int
    high_risk_patients: int
    medium_risk_patients: int
    low_risk_patients: int
    readmission_rate_30d: float
    predicted_savings_usd: int
    department_distribution: dict
    recent_alerts: List[dict]
