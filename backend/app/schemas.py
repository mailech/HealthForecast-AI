from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime


# ============================================================
# USER SCHEMAS
# ============================================================

class UserCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: str = Field(
        min_length=5,
        max_length=255
    )

    password: str = Field(
        min_length=6,
        max_length=72
    )


class UserLogin(BaseModel):
    email: str

    password: str = Field(
        min_length=1,
        max_length=72
    )


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# ============================================================
# ADMIN USER MANAGEMENT SCHEMAS
# ============================================================

class AdminUserCreate(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: str = Field(
        min_length=5,
        max_length=255
    )

    password: str = Field(
        min_length=6,
        max_length=72
    )

    role: str


# ============================================================
# PATIENT SCHEMAS
# ============================================================

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    disease: str
    risk: str
    status: str

    admission_date: Optional[date] = None

    notes: Optional[str] = None

    # Link patient record to a user account
    user_id: Optional[int] = None


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    disease: Optional[str] = None
    risk: Optional[str] = None
    status: Optional[str] = None

    admission_date: Optional[date] = None

    notes: Optional[str] = None

    # Link patient record to a user account
    user_id: Optional[int] = None


class PatientResponse(BaseModel):
    id: int

    # Linked user account
    user_id: Optional[int] = None

    name: str
    age: int
    gender: str
    disease: str
    risk: str
    status: str

    admission_date: Optional[date] = None

    notes: Optional[str] = None

    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ============================================================
# PREDICTION SCHEMAS
# ============================================================

class PredictionRequest(BaseModel):
    patient_id: int


class PredictionResponse(BaseModel):
    id: int
    patient_id: int
    risk_score: float
    risk_level: str
    recommendation: str

    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True 

class TreatmentCreate(BaseModel):
    patient_id: int
    treatment_name: str
    outcome: str
    effectiveness_score: float = Field(ge=0, le=100)
    notes: Optional[str] = None


class TreatmentResponse(BaseModel):
    id: int
    patient_id: int
    treatment_name: str
    outcome: str
    effectiveness_score: float
    notes: Optional[str] = None
    recorded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MedicationCreate(BaseModel):
    patient_id: int
    medication_name: str
    outcome: str
    effectiveness_score: float = Field(ge=0, le=100)
    notes: Optional[str] = None


class MedicationResponse(BaseModel):
    id: int
    patient_id: int
    medication_name: str
    outcome: str
    effectiveness_score: float
    notes: Optional[str] = None
    recorded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RecoveryCreate(BaseModel):
    patient_id: int
    recovery_stage: str
    recovery_score: float = Field(ge=0, le=100)
    days_to_recovery: Optional[int] = None
    notes: Optional[str] = None


class RecoveryResponse(BaseModel):
    id: int
    patient_id: int
    recovery_stage: str
    recovery_score: float
    days_to_recovery: Optional[int] = None
    notes: Optional[str] = None
    recorded_at: Optional[datetime] = None

    class Config:
        from_attributes = True        