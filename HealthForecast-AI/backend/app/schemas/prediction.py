from pydantic import BaseModel,Field
class PredictionRequest(BaseModel):
    age:int=Field(ge=0,le=120); time_in_hospital:int=Field(ge=0); num_lab_procedures:int=Field(ge=0); num_procedures:int=Field(ge=0)
    num_medications:int=Field(ge=0); number_outpatient:int=Field(ge=0); number_emergency:int=Field(ge=0); number_inpatient:int=Field(ge=0); number_diagnoses:int=Field(ge=0)
class PredictionOut(BaseModel):
    patient_id:int|None=None; readmission_probability:float; risk_category:str; model_version:str
