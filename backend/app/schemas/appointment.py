from datetime import date, time

from pydantic import BaseModel, ConfigDict, Field


class AppointmentCreate(BaseModel):
    patient_id: int = Field(..., ge=1)
    doctor_id: int = Field(..., ge=1)
    appointment_date: date
    appointment_time: time
    notes: str | None = Field(None, max_length=2000)


class AppointmentResponse(AppointmentCreate):
    id: int
    status: str
    patient_name: str
    doctor_name: str

    model_config = ConfigDict(from_attributes=True)
