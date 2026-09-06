from pydantic import BaseModel, Field
from typing import Optional


# ============================================================
# HEALTHFORECAST AI
# API DATA SCHEMAS
# ============================================================


class PatientData(BaseModel):
    """
    Patient information received from the frontend.
    """

    race: Optional[str] = "Caucasian"

    gender: str = Field(
        default="Female",
        description="Patient gender"
    )

    age: float = Field(
        ...,
        ge=0,
        le=100,
        description="Patient age"
    )

    admission_type_id: int = Field(
        default=1,
        ge=1,
        description="Hospital admission type"
    )

    discharge_disposition_id: int = Field(
        default=1,
        ge=1,
        description="Discharge disposition"
    )

    admission_source_id: int = Field(
        default=1,
        ge=1,
        description="Admission source"
    )

    time_in_hospital: int = Field(
        ...,
        ge=1,
        le=30,
        description="Number of days in hospital"
    )

    num_lab_procedures: int = Field(
        default=40,
        ge=0,
        description="Number of laboratory procedures"
    )

    num_procedures: int = Field(
        default=1,
        ge=0,
        description="Number of procedures"
    )

    num_medications: int = Field(
        default=10,
        ge=0,
        description="Number of medications"
    )

    number_outpatient: int = Field(
        default=0,
        ge=0,
        description="Previous outpatient visits"
    )

    number_emergency: int = Field(
        default=0,
        ge=0,
        description="Previous emergency visits"
    )

    number_inpatient: int = Field(
        default=0,
        ge=0,
        description="Previous inpatient visits"
    )

    diag_1: Optional[str] = "250.00"

    diag_2: Optional[str] = "401.9"

    diag_3: Optional[str] = "250.00"

    number_diagnoses: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of diagnoses"
    )

    max_glu_serum: Optional[str] = "None"

    A1Cresult: Optional[str] = "None"

    insulin: Optional[str] = "No"

    change: Optional[str] = "No"

    diabetesMed: Optional[str] = "Yes"


# ============================================================
# PREDICTION RESPONSE
# ============================================================


class PredictionResponse(BaseModel):

    prediction: str

    risk_level: str

    readmission_probability: float

    class_probabilities: dict

    risk_factors: list

    message: str


# ============================================================
# API STATUS RESPONSE
# ============================================================


class HealthResponse(BaseModel):

    status: str

    model_loaded: bool

    service: str


# ============================================================
# MODEL INFORMATION RESPONSE
# ============================================================


class ModelInfoResponse(BaseModel):

    status: str

    model_name: Optional[str] = None

    algorithm: Optional[str] = None

    version: Optional[str] = None

    dataset_rows: Optional[int] = None

    feature_count: Optional[int] = None

    features: Optional[list] = None

    target: Optional[str] = None

    classes: Optional[list] = None

    metrics: Optional[dict] = None
