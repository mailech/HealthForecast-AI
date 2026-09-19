from datetime import date, time

from pydantic import BaseModel, ConfigDict, Field


class AppointmentCreate(BaseModel):
    patient_id: int = Field(..., ge=1)
    doctor_id: int = Field(..., ge=1)
    appointment_date: date
    appointment_time: time
    reminder_timing: str | None = Field("At appointment time", max_length=50)
    notes: str | None = Field(None, max_length=2000)


class AppointmentStatusUpdate(BaseModel):
    status: str = Field(..., max_length=20)


class AppointmentReschedule(BaseModel):
    appointment_date: date
    appointment_time: time
    reminder_timing: str | None = Field("At appointment time", max_length=50)
    notes: str | None = Field(None, max_length=2000)


class AppointmentResponse(AppointmentCreate):
    id: int
    status: str
    patient_name: str
    doctor_name: str
    reminder_timing: str | None = "At appointment time"

    model_config = ConfigDict(from_attributes=True)

