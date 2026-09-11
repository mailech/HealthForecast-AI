from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict

ALLOWED_GENDERS = {"Female", "Male", "Unknown/Invalid"}

ALLOWED_AGES = {
    "[0-10)", "[10-20)", "[20-30)", "[30-40)", "[40-50)",
    "[50-60)", "[60-70)", "[70-80)", "[80-90)", "[90-100)"
}
ALLOWED_GLU = {"None", "Norm", ">200", ">300"}
ALLOWED_A1C = {"None", "Norm", ">7", ">8"}

class EncounterPredictionRequest(BaseModel):
    race: Optional[str] = Field(default="Caucasian", description="Patient race classification")
    gender: Optional[str] = Field(default="Female", description="Patient biological sex")
    age: Optional[str] = Field(default="[60-70)", description="Patient age bracket")
    
    admission_type_id: Optional[int] = Field(default=1, description="Admission type ID (1=Emergency, 2=Urgent, 3=Elective)")
    admission_source_id: Optional[int] = Field(default=7, description="Admission source ID")
    time_in_hospital: int = Field(default=4, ge=1, le=14, description="Inpatient stay length in days (1 to 14)")
    
    payer_code: Optional[str] = Field(default="MC", description="Payer code")
    medical_specialty: Optional[str] = Field(default="InternalMedicine", description="Medical specialty of admitting physician")
    
    num_lab_procedures: int = Field(default=45, ge=0, description="Total lab procedures during stay")
    num_procedures: int = Field(default=1, ge=0, description="Total non-lab procedures during stay")
    num_medications: int = Field(default=12, ge=0, description="Total distinct medications administered")
    
    number_outpatient: int = Field(default=0, ge=0, description="Number of outpatient visits in past 12 months")
    number_emergency: int = Field(default=0, ge=0, description="Number of emergency room visits in past 12 months")
    number_inpatient: int = Field(default=0, ge=0, description="Number of inpatient admissions in past 12 months")
    
    diag_1: Optional[str] = Field(default="414", description="Primary ICD-9 diagnosis code")
    diag_2: Optional[str] = Field(default="250.00", description="Secondary ICD-9 diagnosis code")
    diag_3: Optional[str] = Field(default="401", description="Tertiary ICD-9 diagnosis code")
    number_diagnoses: int = Field(default=5, ge=1, description="Total recorded diagnosis count")
    
    max_glu_serum: Optional[str] = Field(default="None", description="Glucose serum test result")
    A1Cresult: Optional[str] = Field(default="None", description="A1C test result")
    
    change: Optional[str] = Field(default="No", description="Medication change status ('No' or 'Ch')")
    diabetesMed: Optional[str] = Field(default="Yes", description="Prescribed diabetes medication ('No' or 'Yes')")
    
    insulin: Optional[str] = Field(default="Steady", description="Insulin dosage status")
    metformin: Optional[str] = Field(default="No", description="Metformin dosage status")

    @field_validator("gender")
    @classmethod
    def validate_gender(cls, v):
        if v not in ALLOWED_GENDERS:
            raise ValueError(f"Invalid gender '{v}'. Allowed values: {ALLOWED_GENDERS}")
        return v

    @field_validator("age")
    @classmethod
    def validate_age(cls, v):
        if v not in ALLOWED_AGES:
            raise ValueError(f"Invalid age bracket '{v}'. Allowed values: {ALLOWED_AGES}")
        return v

    @field_validator("max_glu_serum")
    @classmethod
    def validate_glu(cls, v):
        if v not in ALLOWED_GLU:
            raise ValueError(f"Invalid max_glu_serum '{v}'. Allowed values: {ALLOWED_GLU}")
        return v

    @field_validator("A1Cresult")
    @classmethod
    def validate_a1c(cls, v):
        if v not in ALLOWED_A1C:
            raise ValueError(f"Invalid A1Cresult '{v}'. Allowed values: {ALLOWED_A1C}")
        return v

class TopRiskFactorItem(BaseModel):
    feature: str
    value: float
    importance_weight: float

class CDSSRecommendationItem(BaseModel):
    rule_id: str
    category: str
    title: str
    description: str
    disclaimer: str

class PredictionResponse(BaseModel):
    encounter_id: Optional[str] = None
    patient_id: Optional[int] = None
    risk_probability: float = Field(..., description="Calculated model readmission risk probability (0.0 to 1.0)")
    risk_percentage: float = Field(..., description="Risk probability expressed as percentage (0.0% to 100.0%)")
    risk_category: str = Field(..., description="Model risk category ('Low Risk', 'Medium Risk', 'High Risk')")
    prediction: int = Field(..., description="Binary target prediction (1 = early readmission <30d, 0 = no readmission)")
    predicted_class_label: str = Field(..., description="Target class label ('<30' or 'NO/>30')")
    top_risk_factors: List[TopRiskFactorItem]
    cdss_recommendations: List[CDSSRecommendationItem]
    model_name: str
    model_version: str
    timestamp: str
    disclaimer: str

# Legacy DB prediction read model
class PredictionRead(BaseModel):
    id: int
    encounter_id: int
    readmission_risk_score: float
    risk_level: str
    predicted_readmitted: str
    model_version: str
    top_risk_factors: Optional[Any] = None
    clinical_recommendations: Optional[Any] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

