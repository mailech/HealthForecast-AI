from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None


# User Request Schemas
class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255, example="Dr. Alex Vance")
    email: EmailStr = Field(..., example="alex.vance@hospital.org")
    phone: Optional[str] = Field(None, example="+1234567890")
    password: str = Field(..., min_length=8, max_length=100, example="StrongPassword123!")
    role: UserRole = Field(default=UserRole.DOCTOR, example=UserRole.DOCTOR)


class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="alex.vance@hospital.org")
    password: str = Field(..., example="StrongPassword123!")


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None)
    password: Optional[str] = Field(None, min_length=8)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


# User Response Schema
class UserResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True