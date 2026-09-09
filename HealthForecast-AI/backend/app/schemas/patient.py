from pydantic import BaseModel

class PatientCreate(BaseModel):
    mrn: str
    full_name: str
    age: int
    gender: str = "Unknown"
    diagnosis: str = "Diabetes"
    hospital: str = "Demo Hospital"
    doctor_id: int | None = None
    time_in_hospital: int = 3
    num_lab_procedures: int = 30
    num_procedures: int = 1
    num_medications: int = 8
    number_outpatient: int = 0
    number_emergency: int = 0
    number_inpatient: int = 0
    number_diagnoses: int = 3

class PatientOut(PatientCreate):
    id: int
    dataset_encounter_id: str | None = None
    dataset_patient_nbr: str | None = None
    readmitted: str | None = None
    predicted_readmission_probability: float | None = None
    predicted_risk_category: str | None = None
    model_version: str | None = None
    model_config = {"from_attributes": True}
