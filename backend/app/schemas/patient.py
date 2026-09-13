from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


# ============================================================
# Patient Schemas
# ============================================================

class PatientCreate(BaseModel):
    name: str
    date_of_birth: date | None = None
    gender: str | None = None
    phone: str | None = None
    address: str | None = None
    blood_group: str | None = None
    assigned_doctor_id: int | None = None


class PatientUpdate(BaseModel):
    name: str | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    phone: str | None = None
    address: str | None = None
    blood_group: str | None = None
    assigned_doctor_id: int | None = None


class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    date_of_birth: date | None
    gender: str | None
    phone: str | None
    address: str | None
    blood_group: str | None
    assigned_doctor_id: int | None
    created_at: datetime
    updated_at: datetime


class PatientResearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    age: int | None
    gender: str | None
    blood_group: str | None


# ============================================================
# Medical History Schemas
# ============================================================

class MedicalHistoryCreate(BaseModel):
    diagnosis: str
    description: str | None = None
    diagnosis_date: date | None = None
    notes: str | None = None


class MedicalHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    diagnosis: str
    description: str | None
    diagnosis_date: date | None
    notes: str | None
    created_at: datetime


# ============================================================
# Treatment Schemas
# ============================================================

class TreatmentCreate(BaseModel):
    treatment_name: str
    medication: str | None = None
    dosage: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    outcome: str | None = None
    notes: str | None = None


class TreatmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    treatment_name: str
    medication: str | None
    dosage: str | None
    start_date: date | None
    end_date: date | None
    outcome: str | None
    notes: str | None
    created_at: datetime


# ============================================================
# Admission Schemas
# ============================================================

class AdmissionCreate(BaseModel):
    admission_date: date
    discharge_date: date | None = None
    admission_type: str | None = None
    diagnosis: str | None = None
    discharge_reason: str | None = None
    notes: str | None = None


class AdmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    admission_date: date
    discharge_date: date | None
    admission_type: str | None
    diagnosis: str | None
    discharge_reason: str | None
    notes: str | None
    created_at: datetime


# ============================================================
# Clinical Assessment Schemas
# ============================================================
#
# These fields are aligned with the feature space used by the
# final readmission prediction model.
#
# ClinicalAssessment represents the clinical information that
# will be converted into ML features before prediction.
# ============================================================

class ClinicalAssessmentCreate(BaseModel):
    # --------------------------------------------------------
    # Admission / Hospitalization
    # --------------------------------------------------------

    admission_type_id: int = 1
    discharge_disposition_id: int = 1
    admission_source_id: int = 7
    time_in_hospital: int = 4

    # --------------------------------------------------------
    # Hospital Activity
    # --------------------------------------------------------

    num_lab_procedures: int = 40
    num_procedures: int = 1
    num_medications: int = 12

    # --------------------------------------------------------
    # Previous Healthcare Utilization
    # --------------------------------------------------------

    number_outpatient: int = 0
    number_emergency: int = 0
    number_inpatient: int = 0
    number_diagnoses: int = 5

    # --------------------------------------------------------
    # Laboratory Indicators
    # --------------------------------------------------------

    max_glu_serum: str | None = None
    A1Cresult: str | None = None

    # --------------------------------------------------------
    # Diabetes Medications
    # --------------------------------------------------------

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
    insulin: str = "No"

    # --------------------------------------------------------
    # Combination Diabetes Medications
    # --------------------------------------------------------

    glyburide_metformin: str = "No"
    glipizide_metformin: str = "No"
    glimepiride_pioglitazone: str = "No"
    metformin_rosiglitazone: str = "No"
    metformin_pioglitazone: str = "No"

    # --------------------------------------------------------
    # Medication Management
    # --------------------------------------------------------

    change: str = "No"
    diabetesMed: str = "Yes"

    # --------------------------------------------------------
    # Patient / Clinical Characteristics
    # --------------------------------------------------------

    race: str = "Caucasian"

    diag_1_category: str = "Diabetes"
    diag_2_category: str = "Other"
    diag_3_category: str = "Other"

    # --------------------------------------------------------
    # Engineered Clinical Features
    # --------------------------------------------------------

    prior_utilization: int = 0
    medication_count: int = 0
    medication_changed: int = 0
    diabetes_medication: int = 1
    clinical_activity: int = 53


class ClinicalAssessmentResponse(ClinicalAssessmentCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    patient_id: int
    created_at: datetime
    updated_at: datetime