import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str  # validated against app.core.rbac.Role at the route/service layer
    hospital_id: uuid.UUID | None = None
    patient_id: uuid.UUID | None = None  # required when role="patient"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    role: str
    hospital_id: uuid.UUID | None
    patient_id: uuid.UUID | None
    is_active: bool
    created_at: datetime


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PatientSignupRequest(BaseModel):
    phone_number: str
    password: str


class PatientLoginRequest(BaseModel):
    phone_number: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
