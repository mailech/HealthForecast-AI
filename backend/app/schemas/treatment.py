from pydantic import BaseModel, ConfigDict


class TreatmentBase(BaseModel):
    patient_id: int
    diagnosis: str
    treatment_plan: str | None = None


class TreatmentCreate(TreatmentBase):
    pass


class TreatmentResponse(TreatmentBase):
    id: int

    model_config = ConfigDict(from_attributes=True)