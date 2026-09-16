from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.schemas.object_id import PyObjectId

class MedicationSchema(BaseModel):
    name: str
    dosage: str
    frequency: str
    status: Optional[str] = Field("Active", description="Active, Discontinued, Paused, Completed")
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: Optional[str] = None

class TreatmentBase(BaseModel):
    patient_id: str
    prediction_id: Optional[str] = Field(default=None, description="ID of the prediction this treatment is linked to")
    doctor_id: str
    treatment_plan: str
    medications: List[MedicationSchema] = Field(default_factory=list)
    start_date: datetime
    end_date: datetime
    status: str = Field("Active", description="Active, In Progress, Completed, Pending Follow-up, Discontinued, Cancelled, Paused")
    diagnosis: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    recovery_percentage: Optional[int] = Field(default=0, ge=0, le=100)
    notes: Optional[str] = None
    monitoring_parameters: Optional[str] = Field(default=None, description="Clinical parameters to monitor during treatment")

class TreatmentCreate(TreatmentBase):
    pass

class TreatmentUpdate(BaseModel):
    prediction_id: Optional[str] = None
    doctor_id: Optional[str] = None
    treatment_plan: Optional[str] = None
    medications: Optional[List[MedicationSchema]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    diagnosis: Optional[str] = None
    follow_up_date: Optional[datetime] = None
    recovery_percentage: Optional[int] = Field(default=None, ge=0, le=100)
    notes: Optional[str] = None
    monitoring_parameters: Optional[str] = None

class TreatmentResponse(TreatmentBase):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }
