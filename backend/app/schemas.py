from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, Literal
from datetime import date, datetime


# ============================================================
# USER SCHEMAS
# ============================================================

class UserCreate(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=6,
        max_length=72
    )


class UserLogin(BaseModel):

    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=72
    )


class UserResponse(BaseModel):

    id: int
    name: str
    email: str
    role: str

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# ADMIN USER MANAGEMENT
# ============================================================

class AdminUserCreate(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    password: str = Field(
        min_length=6,
        max_length=72
    )

    role: Literal[
        "doctor",
        "staff",
        "researcher"
    ]


# ============================================================
# PATIENT SCHEMAS
# ============================================================

class PatientCreate(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=100
    )

    age: int = Field(
        ge=0,
        le=120
    )

    gender: str = Field(
        min_length=1,
        max_length=30
    )

    disease: str = Field(
        min_length=1,
        max_length=100
    )

    risk: Literal[
        "Low",
        "Medium",
        "High"
    ]

    status: str = Field(
        min_length=1,
        max_length=50
    )

    admission_date: Optional[date] = None

    notes: Optional[str] = Field(
        default=None,
        max_length=1000
    )

    user_id: Optional[int] = Field(
        default=None,
        ge=1
    )


class PatientUpdate(BaseModel):

    name: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    age: Optional[int] = Field(
        default=None,
        ge=0,
        le=120
    )

    gender: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=30
    )

    disease: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100
    )

    risk: Optional[
        Literal[
            "Low",
            "Medium",
            "High"
        ]
    ] = None

    status: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=50
    )

    admission_date: Optional[date] = None

    notes: Optional[str] = Field(
        default=None,
        max_length=1000
    )

    user_id: Optional[int] = Field(
        default=None,
        ge=1
    )


class PatientResponse(BaseModel):

    id: int

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

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# PREDICTION SCHEMAS
# ============================================================

class PredictionRequest(BaseModel):

    patient_id: int = Field(
        ge=1
    )


class PredictionResponse(BaseModel):

    id: int
    patient_id: int
    risk_score: float
    risk_level: str
    recommendation: str

    created_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# TREATMENT SCHEMAS
# ============================================================

class TreatmentCreate(BaseModel):

    patient_id: int = Field(
        ge=1
    )

    treatment_name: str = Field(
        min_length=1,
        max_length=150
    )

    outcome: str = Field(
        min_length=1,
        max_length=100
    )

    effectiveness_score: float = Field(
        ge=0,
        le=100
    )

    notes: Optional[str] = Field(
        default=None,
        max_length=1000
    )


class TreatmentResponse(BaseModel):

    id: int
    patient_id: int
    treatment_name: str
    outcome: str
    effectiveness_score: float
    notes: Optional[str] = None
    recorded_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# MEDICATION SCHEMAS
# ============================================================

class MedicationCreate(BaseModel):

    patient_id: int = Field(
        ge=1
    )

    medication_name: str = Field(
        min_length=1,
        max_length=150
    )

    outcome: str = Field(
        min_length=1,
        max_length=100
    )

    effectiveness_score: float = Field(
        ge=0,
        le=100
    )

    notes: Optional[str] = Field(
        default=None,
        max_length=1000
    )


class MedicationResponse(BaseModel):

    id: int
    patient_id: int
    medication_name: str
    outcome: str
    effectiveness_score: float
    notes: Optional[str] = None
    recorded_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# RECOVERY SCHEMAS
# ============================================================

class RecoveryCreate(BaseModel):

    patient_id: int = Field(
        ge=1
    )

    recovery_stage: str = Field(
        min_length=1,
        max_length=100
    )

    recovery_score: float = Field(
        ge=0,
        le=100
    )

    days_to_recovery: Optional[int] = Field(
        default=None,
        ge=0,
        le=3650
    )

    notes: Optional[str] = Field(
        default=None,
        max_length=1000
    )


class RecoveryResponse(BaseModel):

    id: int
    patient_id: int
    recovery_stage: str
    recovery_score: float
    days_to_recovery: Optional[int] = None
    notes: Optional[str] = None
    recorded_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# RESEARCHER SAFE RESPONSE
# ============================================================

class ResearchSummaryResponse(BaseModel):

    total_patients: int = Field(
        ge=0
    )

    high_risk_patients: int = Field(
        ge=0
    )

    total_predictions: int = Field(
        ge=0
    )

    average_risk_score: float = Field(
        ge=0,
        le=100
    ) 