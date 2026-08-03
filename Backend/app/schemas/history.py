from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.object_id import PyObjectId

class MedicalHistoryBase(BaseModel):
    patient_id: str = Field(..., description="Unique Patient Identifier")
    admission_date: datetime
    discharge_date: datetime
    primary_diagnosis: str
    comorbidities: List[str] = Field(default_factory=list)
    length_of_stay: int = Field(..., description="Length of stay in days")
    num_previous_admissions: int = Field(0, description="Number of previous admissions")
    num_medications: int = Field(0, description="Number of prescribed medications")
    systolic_bp: int = Field(..., description="Systolic blood pressure")
    diastolic_bp: int = Field(..., description="Diastolic blood pressure")
    blood_sugar: float = Field(..., description="Blood sugar level")
    notes: Optional[str] = None

class MedicalHistoryCreate(MedicalHistoryBase):
    pass

class MedicalHistoryUpdate(BaseModel):
    admission_date: Optional[datetime] = None
    discharge_date: Optional[datetime] = None
    primary_diagnosis: Optional[str] = None
    comorbidities: Optional[List[str]] = None
    length_of_stay: Optional[int] = None
    num_previous_admissions: Optional[int] = None
    num_medications: Optional[int] = None
    systolic_bp: Optional[int] = None
    diastolic_bp: Optional[int] = None
    blood_sugar: Optional[float] = None
    notes: Optional[str] = None

class MedicalHistoryResponse(MedicalHistoryBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }
