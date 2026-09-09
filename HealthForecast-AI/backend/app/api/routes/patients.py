from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models import Patient, Prediction
from app.schemas.patient import PatientCreate, PatientOut

router = APIRouter(prefix="/patients", tags=["Patients"])

def can_access_patient(user, patient):
    # Historical Diabetes 130-US Hospitals encounters are shared across
    # application roles. Researchers receive anonymized patient details,
    # while doctors/administrators can see the prediction attached to each
    # dataset encounter.
    if patient.dataset_encounter_id is not None:
        return user.role in {
            "doctor",
            "hospital_administrator",
            "healthcare_researcher",
            "system_administrator",
        }

    # Keep access to manually created/non-dataset patients restricted.
    if user.role == "doctor":
        return patient.doctor_id == user.id
    if user.role in {"hospital_administrator", "healthcare_researcher"}:
        return patient.hospital == user.hospital
    return user.role == "system_administrator"

def to_output(patient, prediction=None, anonymized=False):
    if anonymized:
        return {
            "id": patient.id, "mrn": "ANONYMIZED", "full_name": "Anonymized Patient", "age": patient.age,
            "gender": patient.gender, "diagnosis": patient.diagnosis, "hospital": "Anonymized", "doctor_id": None,
            "time_in_hospital": patient.time_in_hospital, "num_lab_procedures": patient.num_lab_procedures,
            "num_procedures": patient.num_procedures, "num_medications": patient.num_medications,
            "number_outpatient": patient.number_outpatient, "number_emergency": patient.number_emergency,
            "number_inpatient": patient.number_inpatient, "number_diagnoses": patient.number_diagnoses,
            "dataset_encounter_id": None, "dataset_patient_nbr": None, "readmitted": patient.readmitted,
            "predicted_readmission_probability": prediction.readmission_probability if prediction else None,
            "predicted_risk_category": prediction.risk_category if prediction else None,
            "model_version": prediction.model_version if prediction else None,
        }
    return {
        "id": patient.id, "mrn": patient.mrn, "full_name": patient.full_name, "age": patient.age,
        "gender": patient.gender, "diagnosis": patient.diagnosis, "hospital": patient.hospital,
        "doctor_id": patient.doctor_id, "time_in_hospital": patient.time_in_hospital,
        "num_lab_procedures": patient.num_lab_procedures, "num_procedures": patient.num_procedures,
        "num_medications": patient.num_medications, "number_outpatient": patient.number_outpatient,
        "number_emergency": patient.number_emergency, "number_inpatient": patient.number_inpatient,
        "number_diagnoses": patient.number_diagnoses, "dataset_encounter_id": patient.dataset_encounter_id,
        "dataset_patient_nbr": patient.dataset_patient_nbr, "readmitted": patient.readmitted,
        "predicted_readmission_probability": prediction.readmission_probability if prediction else None,
        "predicted_risk_category": prediction.risk_category if prediction else None,
        "model_version": prediction.model_version if prediction else None,
    }

@router.get("", response_model=list[PatientOut])
def list_patients(skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=500), user=Depends(get_current_user), db: Session=Depends(get_db)):
    q=db.query(Patient)
    if user.role == "doctor":
        q=q.filter((Patient.dataset_encounter_id.isnot(None)) | (Patient.doctor_id==user.id))
    elif user.role in {"hospital_administrator","healthcare_researcher"}:
        q=q.filter((Patient.dataset_encounter_id.isnot(None)) | (Patient.hospital==user.hospital))
    elif user.role != "system_administrator":
        raise HTTPException(403,"Insufficient permissions")
    patients=q.order_by(Patient.id.desc()).offset(skip).limit(limit).all()
    ids=[p.id for p in patients]
    pred_map={}
    if ids:
        for pred in db.query(Prediction).filter(Prediction.patient_id.in_(ids)).order_by(Prediction.id.desc()).all(): pred_map.setdefault(pred.patient_id,pred)
    return [to_output(p,pred_map.get(p.id), user.role=="healthcare_researcher") for p in patients]

@router.get("/{pid}", response_model=PatientOut)
def get_patient(pid:int,user=Depends(get_current_user),db:Session=Depends(get_db)):
    patient=db.get(Patient,pid)
    if not patient: raise HTTPException(404,"Patient not found")
    if not can_access_patient(user,patient): raise HTTPException(403,"Patient is outside your access scope")
    pred=db.query(Prediction).filter(Prediction.patient_id==pid).order_by(Prediction.id.desc()).first()
    return to_output(patient,pred,user.role=="healthcare_researcher")

@router.post("", response_model=PatientOut)
def create_patient(payload:PatientCreate,user=Depends(get_current_user),db:Session=Depends(get_db)):
    if user.role not in {"doctor","hospital_administrator","system_administrator"}: raise HTTPException(403,"Insufficient permissions")
    data=payload.model_dump()
    if user.role in {"doctor","hospital_administrator"}: data.update(hospital=user.hospital)
    if user.role=="doctor": data.update(doctor_id=user.id)
    patient=Patient(**data)
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # Every newly created patient gets a prediction immediately, so the
    # prediction is available to every authorized role without requiring a
    # separate per-user prediction record.
    from app.ml.model_service import model_service
    probability, category, version = model_service.predict({
        "age": patient.age,
        "time_in_hospital": patient.time_in_hospital,
        "num_lab_procedures": patient.num_lab_procedures,
        "num_procedures": patient.num_procedures,
        "num_medications": patient.num_medications,
        "number_outpatient": patient.number_outpatient,
        "number_emergency": patient.number_emergency,
        "number_inpatient": patient.number_inpatient,
        "number_diagnoses": patient.number_diagnoses,
    })
    prediction = Prediction(
        patient_id=patient.id,
        readmission_probability=probability,
        risk_category=category,
        model_version=version,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return to_output(patient, prediction)
