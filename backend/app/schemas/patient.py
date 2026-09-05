from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class PatientBase(BaseModel):
    patient_id: str
    full_name: Optional[str] = None
    race: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[str] = None
    weight: Optional[str] = None
    admission_type_id: Optional[int] = None
    discharge_disposition_id: Optional[int] = None
    admission_source_id: Optional[int] = None
    time_in_hospital: Optional[int] = None
    payer_code: Optional[str] = None
    medical_specialty: Optional[str] = None
    num_lab_procedures: Optional[int] = None
    num_procedures: Optional[int] = None
    num_medications: Optional[int] = None
    number_outpatient: Optional[int] = None
    number_emergency: Optional[int] = None
    number_inpatient: Optional[int] = None
    number_diagnoses: Optional[int] = None
    max_glu_serum: Optional[str] = None
    a1cresult: Optional[str] = None
    change: Optional[str] = None
    diabetes_med: Optional[str] = None
    readmitted: Optional[str] = None
    diag_1: Optional[str] = None
    diag_2: Optional[str] = None
    diag_3: Optional[str] = None


class PatientCreate(PatientBase):
    assigned_doctor_id: Optional[int] = None


class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    assigned_doctor_id: Optional[int] = None
    time_in_hospital: Optional[int] = None
    num_medications: Optional[int] = None
    number_diagnoses: Optional[int] = None


class PatientResponse(PatientBase):
    id: int
    assigned_doctor_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MedicalHistoryCreate(BaseModel):
    condition: str
    diagnosis_code: Optional[str] = None
    notes: Optional[str] = None


class MedicalHistoryResponse(MedicalHistoryCreate):
    id: int
    patient_id: int
    recorded_at: datetime

    class Config:
        from_attributes = True


class TreatmentCreate(BaseModel):
    medication: str
    dosage: Optional[str] = None
    status: Optional[str] = "active"
    outcome: Optional[str] = None


class TreatmentResponse(TreatmentCreate):
    id: int
    patient_id: int
    start_date: datetime

    class Config:
        from_attributes = True


class AdmissionCreate(BaseModel):
    admission_type: str
    discharge_disposition: Optional[str] = None
    length_of_stay: int
    readmitted_within_30: bool = False


class AdmissionResponse(AdmissionCreate):
    id: int
    patient_id: int
    admission_date: datetime

    class Config:
        from_attributes = True


class PatientDetailResponse(PatientResponse):
    medical_history: List[MedicalHistoryResponse] = []
    treatments: List[TreatmentResponse] = []
    admissions: List[AdmissionResponse] = []

    class Config:
        from_attributes = True
