from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

# ==========================================
# AUTH SCHEMAS
# ==========================================
class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "Doctor"  # "Doctor" or "Hospital Administrator"

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    role: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    role: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    username: Optional[str] = None
    role: Optional[str] = None


# ==========================================
# PATIENT & ML INPUT SCHEMAS (EXACT 46 FIELDS)
# ==========================================
class PatientData(BaseModel):
    race: str = "Caucasian"
    gender: str = "Female"
    age: str = "[50-60)"
    admission_type_id: str = "1"
    discharge_disposition_id: str = "1"
    admission_source_id: str = "1"
    time_in_hospital: int = 3
    payer_code: str = "MC"
    medical_specialty: str = "InternalMedicine"
    num_lab_procedures: int = 35
    num_procedures: int = 0
    num_medications: int = 12
    number_outpatient: int = 0
    number_emergency: int = 0
    number_inpatient: int = 0
    number_diagnoses: int = 6
    max_glu_serum: str = "Norm"
    A1Cresult: str = "Norm"
    metformin: str = "No"
    repaglinide: str = "No"
    nateglinide: str = "No"
    chlorpropamide: str = "No"
    glimepiride: str = "No"
    acetohexamide: str = "No"
    glipizide: str = "No"
    glyburide: str = "No"
    tolbutamide: str = "No"
    pioglitazone: str = "No"
    rosiglitazone: str = "No"
    acarbose: str = "No"
    miglitol: str = "No"
    troglitazone: str = "No"
    tolazamide: str = "No"
    examide: str = "No"
    citoglipton: str = "No"
    insulin: str = "No"
    glyburide_metformin: str = "No"
    glipizide_metformin: str = "No"
    glimepiride_pioglitazone: str = "No"
    metformin_rosiglitazone: str = "No"
    metformin_pioglitazone: str = "No"
    change: str = "No"
    diabetesMed: str = "No"
    diag_1_group: str = "Circulatory"
    diag_2_group: str = "Diabetes"
    diag_3_group: str = "Other"

class PatientCreate(PatientData):
    patient_name: Optional[str] = "Anonymous Patient"

class PatientOut(BaseModel):
    id: int
    patient_name: str
    age: str
    gender: str
    race: str
    time_in_hospital: int
    num_medications: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PredictionRequest(PatientData):
    patient_name: Optional[str] = "Anonymous Patient"
    patient_id: Optional[int] = None

class PredictionOut(BaseModel):
    id: Optional[int] = None
    patient_id: Optional[int] = None
    patient_name: Optional[str] = None
    probability: float
    risk_percentage: float
    risk_class: str
    prediction: str
    predicted_by: Optional[str] = None
    created_at: Optional[datetime] = None
    note: str = "This prediction is intended for academic decision-support demonstration and is not a medical diagnosis."

    model_config = ConfigDict(from_attributes=True)

class DashboardStats(BaseModel):
    total_patients: int
    total_predictions: int
    high_risk_predictions: int
    lower_risk_predictions: int
    model_roc_auc: float = 0.658
    model_recall: float = 0.59
