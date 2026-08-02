from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MedicationSchema(BaseModel):
    id: int
    medication_name: str
    dosage_status: str

    class Config:
        from_attributes = True

class MedicationCreate(BaseModel):
    medication_name: str
    dosage_status: str = "Steady"

class AdmissionSchema(BaseModel):
    id: int
    encounter_id: int
    patient_id: int
    admission_type: str
    discharge_disposition: str
    admission_source: str
    time_in_hospital: int
    medical_specialty: Optional[str] = None
    num_lab_procedures: int
    num_procedures: int
    num_medications: int
    number_outpatient: int
    number_emergency: int
    number_inpatient: int
    diag_1: Optional[str] = None
    diag_2: Optional[str] = None
    diag_3: Optional[str] = None
    number_diagnoses: int
    max_glu_serum: str
    A1Cresult: str
    change: str
    diabetesMed: str
    risk_score: float
    risk_category: str
    readmitted: str
    admission_date: datetime
    discharge_date: datetime
    medications: List[MedicationSchema] = []

    class Config:
        from_attributes = True

class PatientBase(BaseModel):
    patient_nbr: int
    first_name: str
    last_name: str
    race: str
    gender: str
    age: str
    weight: Optional[str] = None
    payer_code: Optional[str] = None
    assigned_doctor_id: Optional[int] = None

class PatientCreate(PatientBase):
    pass

class PatientWithAdmissionCreate(BaseModel):
    patient_nbr: int
    first_name: str
    last_name: str
    race: str
    gender: str
    age: str
    weight: Optional[str] = "[50-75kg)"
    payer_code: Optional[str] = "MC"
    assigned_doctor_id: Optional[int] = None
    
    # Admission Clinical History Features
    admission_type: str = "Emergency"
    medical_specialty: str = "InternalMedicine"
    time_in_hospital: int = 4
    num_lab_procedures: int = 45
    num_procedures: int = 1
    num_medications: int = 12
    number_outpatient: int = 0
    number_emergency: int = 0
    number_inpatient: int = 1
    diag_1: str = "250.00 Diabetes Mellitus"
    diag_2: Optional[str] = "401.90 Essential Hypertension"
    diag_3: Optional[str] = "414.01 Coronary Atherosclerosis"
    max_glu_serum: str = "Norm" # Norm, >200, >300, None
    A1Cresult: str = ">8" # Norm, >7, >8, None
    change: str = "Ch" # Ch, No
    diabetesMed: str = "Yes" # Yes, No
    medications: List[MedicationCreate] = []

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    race: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[str] = None
    assigned_doctor_id: Optional[int] = None

class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    latest_risk_score: Optional[float] = 0.0
    latest_risk_category: Optional[str] = "Low"
    latest_readmission_status: Optional[str] = "NO"
    assigned_doctor_name: Optional[str] = None
    admissions: List[AdmissionSchema] = []

    class Config:
        from_attributes = True

class AnonymizedPatientResponse(BaseModel):
    id: int
    patient_nbr: int
    race: str
    gender: str
    age: str
    latest_risk_score: Optional[float] = 0.0
    latest_risk_category: Optional[str] = "Low"
    latest_readmission_status: Optional[str] = "NO"

    class Config:
        from_attributes = True
