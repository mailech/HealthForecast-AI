from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class EncounterBase(BaseModel):
    encounter_id: str
    patient_id: int
    admission_type_id: Optional[int] = 1
    discharge_disposition_id: Optional[int] = 1
    admission_source_id: Optional[int] = 7
    time_in_hospital: int = 3
    payer_code: Optional[str] = "?"
    medical_specialty: Optional[str] = "InternalMedicine"
    
    num_lab_procedures: int = 40
    num_procedures: int = 0
    num_medications: int = 15
    number_outpatient: int = 0
    number_emergency: int = 0
    number_inpatient: int = 0
    
    diag_1: Optional[str] = "250.00"
    diag_2: Optional[str] = "401.9"
    diag_3: Optional[str] = "272.4"
    number_diagnoses: int = 9
    
    max_glu_serum: Optional[str] = "None"
    a1c_result: Optional[str] = "None"
    
    metformin: Optional[str] = "No"
    repaglinide: Optional[str] = "No"
    nateglinide: Optional[str] = "No"
    chlorpropamide: Optional[str] = "No"
    glimepiride: Optional[str] = "No"
    acetohexamide: Optional[str] = "No"
    glipizide: Optional[str] = "No"
    glyburide: Optional[str] = "No"
    tolbutamide: Optional[str] = "No"
    pioglitazone: Optional[str] = "No"
    rosiglitazone: Optional[str] = "No"
    acarbose: Optional[str] = "No"
    miglitol: Optional[str] = "No"
    troglitazone: Optional[str] = "No"
    tolazamide: Optional[str] = "No"
    examide: Optional[str] = "No"
    citoglipton: Optional[str] = "No"
    insulin: Optional[str] = "No"
    glyburide_metformin: Optional[str] = "No"
    glipizide_metformin: Optional[str] = "No"
    glimepiride_pioglitazone: Optional[str] = "No"
    metformin_rosiglitazone: Optional[str] = "No"
    metformin_pioglitazone: Optional[str] = "No"
    
    change_status: Optional[str] = "No"
    diabetes_med: Optional[str] = "No"
    actual_readmitted: Optional[str] = "NO"

class EncounterCreate(EncounterBase):
    pass

class EncounterRead(EncounterBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
