from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class RiskFactorWeight(BaseModel):
    factor: str
    weight: float
    description: str

class ClinicalRecommendationItem(BaseModel):
    category: str
    action: str
    priority: str  # High, Medium, Low

class PredictionRequest(BaseModel):
    patient_id: Optional[int] = None
    age: int = Field(..., ge=0, le=120)
    time_in_hospital: int = Field(..., ge=1, le=100)
    num_lab_procedures: int = Field(..., ge=0, le=200)
    num_procedures: int = Field(..., ge=0, le=50)
    num_medications: int = Field(..., ge=0, le=100)
    number_outpatient: int = Field(0, ge=0)
    number_emergency: int = Field(0, ge=0)
    number_inpatient: int = Field(0, ge=0)
    number_diagnoses: int = Field(1, ge=1)
    a1c_result: str = Field("None", description="None, Norm, >7, >8")
    max_glu_serum: str = Field("None", description="None, Norm, >200, >300")
    diabetes_med: str = Field("Yes", description="Yes, No")
    change_med: str = Field("No", description="No, Ch")
    primary_diagnosis: Optional[str] = "Diabetes Mellitus"

class PatientRiskPredictionResponse(BaseModel):
    id: Optional[int] = None
    patient_id: int
    patient_name: Optional[str] = None
    patient_nbr: Optional[str] = None
    risk_score: float  # 0.0 to 100.0
    risk_level: str  # High, Medium, Low
    readmission_probability: float  # 0.0 to 1.0
    confidence_score: float  # 0.0 to 100.0
    model_name: str
    risk_factors: List[RiskFactorWeight]
    clinical_recommendations: List[ClinicalRecommendationItem]
    created_at: Optional[datetime] = None

    class Config:
        orm_mode = True

class ModelMetricBenchmark(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    is_primary: bool = False

class ConfusionMatrixData(BaseModel):
    true_positive: int
    true_negative: int
    false_positive: int
    false_negative: int

class ROCPoint(BaseModel):
    fpr: float  # False Positive Rate
    tpr: float  # True Positive Rate

class FeatureImportanceItem(BaseModel):
    feature: str
    importance: float
    category: str

class ModelValidationMetricsResponse(BaseModel):
    primary_model: str
    overall_accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    calibration_score: float
    dataset_size: int
    test_split_size: int
    confusion_matrix: ConfusionMatrixData
    roc_curve: List[ROCPoint]
    feature_importances: List[FeatureImportanceItem]
    model_benchmarks: List[ModelMetricBenchmark]
    last_evaluated_at: str
