from pydantic import BaseModel
class TreatmentCreate(BaseModel):
    patient_id:int; treatment_name:str; medication:str=""; start_date:str; end_date:str|None=None
    outcome:str="Ongoing"; recovery_score:float=0; effectiveness_score:float=0; notes:str=""
class TreatmentOut(TreatmentCreate):
    id:int
    model_config={"from_attributes":True}
