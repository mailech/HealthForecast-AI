from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
from app.schemas.object_id import PyObjectId

class PatientBase(BaseModel):
    patient_id: str = Field(..., description="Unique Patient Identifier (e.g. PAT-10001)")
    first_name: str
    last_name: str
    date_of_birth: str = Field(..., description="Date of birth (YYYY-MM-DD)")
    gender: str = Field(..., description="Gender (Male, Female, Other)")
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    hospital: str

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    hospital: Optional[str] = None

class PatientResponse(PatientBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }
