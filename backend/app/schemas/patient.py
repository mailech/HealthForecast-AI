import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class PatientCreate(BaseModel):
    mrn: str
    full_name: str
    date_of_birth: date
    gender: str
    race: str | None = None
    hospital_id: uuid.UUID | None = None
    phone_number: str | None = None


class PatientOut(BaseModel):
    """Full record — Doctor (assigned only) / Hospital Admin / System Admin."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    mrn: str
    full_name: str
    date_of_birth: date
    gender: str
    race: str | None
    hospital_id: uuid.UUID | None
    phone_number: str | None
    created_at: datetime


class PatientAnonymizedOut(BaseModel):
    """No name/MRN/DOB — what the Healthcare Researcher role is allowed to see,
    per the Access Matrix ('Anonymized Only'). Age band instead of DOB."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    age_band: str
    gender: str
    race: str | None
    hospital_id: uuid.UUID | None


class AdmissionCreate(BaseModel):
    patient_id: uuid.UUID
    admitted_on: date
    discharged_on: date | None = None
    admission_type: str | None = None
    discharge_disposition: str | None = None
    primary_diagnosis: str | None = None
    time_in_hospital: int | None = None
    num_lab_procedures: int | None = None
    num_procedures: int | None = None
    num_medications: int | None = None
    number_outpatient: int | None = None
    number_emergency: int | None = None
    number_inpatient: int | None = None
    number_diagnoses: int | None = None


class AdmissionOut(AdmissionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime


class RiskScoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: uuid.UUID
    patient_id: uuid.UUID
    admission_id: uuid.UUID
    readmission_probability: float
    risk_category: str
    model_version: str
    confidence_score: float | None
    generated_at: datetime


class BillCreate(BaseModel):
    admission_id: uuid.UUID
    room_charges: float = 0
    procedure_charges: float = 0
    medication_charges: float = 0
    lab_charges: float = 0
    other_charges: float = 0
    insurance_covered: float = 0
    status: str = "pending"
    issued_on: date
    due_on: date | None = None


class BillOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    patient_id: uuid.UUID
    admission_id: uuid.UUID
    room_charges: float
    procedure_charges: float
    medication_charges: float
    lab_charges: float
    other_charges: float
    insurance_covered: float
    total_amount: float
    patient_responsibility: float
    status: str
    issued_on: date
    due_on: date | None
