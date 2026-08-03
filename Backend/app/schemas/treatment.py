from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.object_id import PyObjectId

class MedicationSchema(BaseModel):
    name: str
    dosage: str
    frequency: str

class TreatmentBase(BaseModel):
    patient_id: str
    doctor_id: str
    treatment_plan: str
    medications: List[MedicationSchema] = Field(default_factory=list)
    start_date: datetime
    end_date: datetime
    status: str = Field("Active", description="Active, Completed, Discontinued")

class TreatmentCreate(TreatmentBase):
    pass

class TreatmentUpdate(BaseModel):
    doctor_id: Optional[str] = None
    treatment_plan: Optional[str] = None
    medications: Optional[List[MedicationSchema]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None

class TreatmentResponse(TreatmentBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }
