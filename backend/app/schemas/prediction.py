from pydantic import BaseModel, ConfigDict, Field


class PredictionCreate(BaseModel):
    patient_id: int = Field(..., ge=1)

    race: str = "Caucasian"
    gender: str = "Male"
    age: str = "[50-60]"

    admission_type_id: int = 1
    discharge_disposition_id: int = 1
    admission_source_id: int = 1

    time_in_hospital: int = Field(3, ge=1, le=30)
    num_lab_procedures: int = Field(40, ge=0, le=200)
    num_procedures: int = Field(1, ge=0, le=20)
    num_medications: int = Field(10, ge=0, le=100)

    number_outpatient: int = Field(0, ge=0)
    number_emergency: int = Field(0, ge=0)
    number_inpatient: int = Field(0, ge=0)

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


class PredictionResponse(BaseModel):
    id: int
    patient_id: int
    readmission_risk_score: float
    risk_category: str
    model_version: str
    probabilities: dict[str, float] = {}
    patient_name: str | None = None

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