from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict


class ExtractedClinicalFields(BaseModel):
    patient_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    diagnosis: Optional[str] = None
    department: Optional[str] = None
    prior_admissions: Optional[int] = None
    prior_admissions_source: Optional[str] = None
    length_of_stay: Optional[int] = None
    length_of_stay_source: Optional[str] = None
    admission_date: Optional[str] = None
    discharge_date: Optional[str] = None
    num_lab_procedures: Optional[int] = None
    num_procedures: Optional[int] = None
    num_medications: Optional[int] = None
    number_outpatient: Optional[int] = None
    number_emergency: Optional[int] = None
    max_glu_serum: Optional[str] = None
    A1Cresult: Optional[str] = None
    insulin: Optional[str] = None
    metformin: Optional[str] = None


class FieldConflict(BaseModel):
    field: str
    field_label: str
    existing_value: Any
    report_value: Any


class ClinicalExtractionResponse(BaseModel):
    report_id: int
    patient_id: int
    file_name: str
    file_type: str
    file_size: int
    extracted_fields: ExtractedClinicalFields
    conflicts: list[FieldConflict] = []
    raw_text_snippet: Optional[str] = None


class MedicalReportItem(BaseModel):
    id: int
    patient_id: int
    uploaded_by_id: int
    file_name: str
    file_type: str
    file_size: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
