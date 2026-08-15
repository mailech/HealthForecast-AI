from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


# =========================
# USER SCHEMAS
# =========================

class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


# =========================
# PATIENT SCHEMAS
# =========================

class PatientCreate(BaseModel):

    name: str
    age: int
    gender: str
    disease: str
    risk: str
    status: str

    admission_date: Optional[date] = None
    notes: Optional[str] = None


class PatientUpdate(BaseModel):

    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    disease: Optional[str] = None
    risk: Optional[str] = None
    status: Optional[str] = None
    admission_date: Optional[date] = None
    notes: Optional[str] = None


class PatientResponse(BaseModel):

    id: int
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


# =========================
# PREDICTION SCHEMAS
# =========================

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