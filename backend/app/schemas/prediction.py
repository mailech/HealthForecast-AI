from typing import Union
from pydantic import BaseModel, ConfigDict, Field, field_validator


def convert_age_to_bracket(val: Union[int, float, str]) -> str:
    """Normalize numeric age or string to the age bracket string expected by ML model."""
    if isinstance(val, (int, float)):
        age_int = int(val)
    elif isinstance(val, str) and val.strip().isdigit():
        age_int = int(val.strip())
    else:
        val_str = str(val).strip()
        if val_str.endswith("]"):
            val_str = val_str[:-1] + ")"
        return val_str

    if age_int < 10:
        return "[0-10)"
    elif age_int < 20:
        return "[10-20)"
    elif age_int < 30:
        return "[20-30)"
    elif age_int < 40:
        return "[30-40)"
    elif age_int < 50:
        return "[40-50)"
    elif age_int < 60:
        return "[50-60)"
    elif age_int < 70:
        return "[60-70)"
    elif age_int < 80:
        return "[70-80)"
    elif age_int < 90:
        return "[80-90)"
    else:
        return "[90-100)"


class PredictionCreate(BaseModel):
    patient_id: int = Field(..., ge=1)

    race: str = "Caucasian"
    gender: str = "Male"
    age: Union[int, str] = "[50-60)"

    admission_type_id: int = 1
    discharge_disposition_id: int = 1
    admission_source_id: int = 1

    time_in_hospital: int = Field(3, ge=1, le=30)
    length_of_stay: Union[int, None] = None
    num_lab_procedures: int = Field(40, ge=0, le=200)
    num_procedures: int = Field(1, ge=0, le=20)
    num_medications: int = Field(10, ge=0, le=100)

    number_outpatient: int = Field(0, ge=0)
    number_emergency: int = Field(0, ge=0)
    number_inpatient: int = Field(0, ge=0)
    prior_admissions: Union[int, None] = None

    diag_1: str = "250.83"
    diag_2: str = "276"
    diag_3: str = "250"

    number_diagnoses: int = 5

    max_glu_serum: str = "None"
    A1Cresult: str = "None"

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

    @field_validator("age", mode="before")
    @classmethod
    def normalize_age_field(cls, v):
        return convert_age_to_bracket(v)

    @field_validator("diag_1", "diag_2", "diag_3", mode="before")
    @classmethod
    def normalize_diag_fields(cls, v):
        if v is None:
            return "250.83"
        return str(v).strip()


class PredictionResponse(BaseModel):
    id: int
    patient_id: int
    readmission_risk_score: float
    risk_category: str
    model_version: str
    probabilities: dict[str, float] = {}
    patient_name: str | None = None
    created_at: Union[str, None] = None
    prior_admissions: int | None = None
    length_of_stay: int | None = None

    model_config = ConfigDict(
        from_attributes=True,
        protected_namespaces=()
    )


class PredictionSummary(BaseModel):
    total_predictions: int = 0
    high_risk_predictions: int = 0
    medium_risk_predictions: int = 0
    low_risk_predictions: int = 0
    average_risk_score: float = 0.0
    readmission_rate: float = 0.0