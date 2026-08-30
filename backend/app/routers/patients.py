import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Union
from app.database import get_db
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.admission import Admission
from app.models.medication import Medication
from app.schemas.patient import (
    PatientResponse, PatientCreate, PatientUpdate, AnonymizedPatientResponse, PatientWithAdmissionCreate
)
from app.middleware.auth import get_current_user

from app.ml.predictor import predictor

router = APIRouter(prefix="/patients", tags=["Patient Management"])

def calculate_patient_risk_prediction(data: PatientWithAdmissionCreate):
    """
    AI Clinical Risk Score Engine:
    Uses trained RandomForest Machine Learning Model (Diabetes 130-US Hospitals)
    to compute continuous risk score (0-100%), risk category, and 30-day readmission forecast.
    """
    risk_score, risk_category, readmitted, _ = predictor.predict(data)
    return risk_score, risk_category, readmitted


@router.get("", response_model=Union[List[PatientResponse], List[AnonymizedPatientResponse]])
def get_patients(
    search: Optional[str] = None,
    risk_category: Optional[str] = None,
    readmitted: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Patient)

    if current_user.role == UserRole.DOCTOR.value:
        query = query.filter(Patient.assigned_doctor_id == current_user.id)

    if search:
        search_term = f"%{search}%"
        if current_user.role == UserRole.RESEARCHER.value:
            query = query.filter(Patient.patient_nbr.cast(str).like(search_term))
        else:
            query = query.filter(
                (Patient.first_name.ilike(search_term)) |
                (Patient.last_name.ilike(search_term)) |
                (Patient.patient_nbr.cast(str).like(search_term))
            )

    patients = query.order_by(Patient.id.desc()).offset(offset).limit(limit).all()

    results = []
    for p in patients:
        latest_adm = db.query(Admission).filter(Admission.patient_id == p.id).order_by(Admission.admission_date.desc()).first()
        
        l_score = latest_adm.risk_score if latest_adm else 0.0
        l_cat = latest_adm.risk_category if latest_adm else "Low"
        l_status = latest_adm.readmitted if latest_adm else "NO"

        if risk_category and l_cat != risk_category:
            continue
        if readmitted and l_status != readmitted:
            continue

        if current_user.role == UserRole.RESEARCHER.value:
            results.append(AnonymizedPatientResponse(
                id=p.id,
                patient_nbr=p.patient_nbr,
                race=p.race,
                gender=p.gender,
                age=p.age,
                latest_risk_score=l_score,
                latest_risk_category=l_cat,
                latest_readmission_status=l_status
            ))
        else:
            doc_name = p.assigned_doctor.full_name if p.assigned_doctor else "Unassigned"
            res = PatientResponse.from_orm(p)
            res.latest_risk_score = l_score
            res.latest_risk_category = l_cat
            res.latest_readmission_status = l_status
            res.assigned_doctor_name = doc_name
            results.append(res)

    return results

@router.get("/{patient_id}", response_model=Union[PatientResponse, AnonymizedPatientResponse])
def get_patient_detail(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if current_user.role == UserRole.DOCTOR.value and patient.assigned_doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied. You can only view assigned patients.")

    latest_adm = db.query(Admission).filter(Admission.patient_id == patient.id).order_by(Admission.admission_date.desc()).first()
    l_score = latest_adm.risk_score if latest_adm else 0.0
    l_cat = latest_adm.risk_category if latest_adm else "Low"
    l_status = latest_adm.readmitted if latest_adm else "NO"

    if current_user.role == UserRole.RESEARCHER.value:
        return AnonymizedPatientResponse(
            id=patient.id,
            patient_nbr=patient.patient_nbr,
            race=patient.race,
            gender=patient.gender,
            age=patient.age,
            latest_risk_score=l_score,
            latest_risk_category=l_cat,
            latest_readmission_status=l_status
        )
    else:
        doc_name = patient.assigned_doctor.full_name if patient.assigned_doctor else "Unassigned"
        res = PatientResponse.from_orm(patient)
        res.latest_risk_score = l_score
        res.latest_risk_category = l_cat
        res.latest_readmission_status = l_status
        res.assigned_doctor_name = doc_name
        return res

@router.post("/with-admission", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient_with_admission(
    payload: PatientWithAdmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.SYSTEM_ADMIN.value, UserRole.HOSPITAL_ADMIN.value, UserRole.DOCTOR.value]:
        raise HTTPException(status_code=403, detail="Permission denied to add patient records")

    existing = db.query(Patient).filter(Patient.patient_nbr == payload.patient_nbr).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Patient number #{payload.patient_nbr} already exists")

    # Default doctor to current user if doctor role, or passed doctor
    assigned_doc = payload.assigned_doctor_id or (current_user.id if current_user.role == UserRole.DOCTOR.value else None)

    # 1. Create Patient
    patient = Patient(
        patient_nbr=payload.patient_nbr,
        first_name=payload.first_name,
        last_name=payload.last_name,
        race=payload.race,
        gender=payload.gender,
        age=payload.age,
        weight=payload.weight,
        payer_code=payload.payer_code,
        assigned_doctor_id=assigned_doc
    )
    db.add(patient)
    db.flush()

    # 2. Compute AI Risk Prediction & Readmission Probability
    risk_score, risk_category, readmitted = calculate_patient_risk_prediction(payload)

    # 3. Create Admission Record
    encounter_id = payload.patient_nbr + random.randint(1000, 9999)
    adm_date = datetime.utcnow()
    disch_date = adm_date + timedelta(days=payload.time_in_hospital)

    admission = Admission(
        encounter_id=encounter_id,
        patient_id=patient.id,
        admission_type=payload.admission_type,
        discharge_disposition="Discharged to home",
        admission_source="Emergency Room",
        time_in_hospital=payload.time_in_hospital,
        medical_specialty=payload.medical_specialty,
        num_lab_procedures=payload.num_lab_procedures,
        num_procedures=payload.num_procedures,
        num_medications=payload.num_medications,
        number_outpatient=payload.number_outpatient,
        number_emergency=payload.number_emergency,
        number_inpatient=payload.number_inpatient,
        diag_1=payload.diag_1,
        diag_2=payload.diag_2,
        diag_3=payload.diag_3,
        number_diagnoses=3,
        max_glu_serum=payload.max_glu_serum,
        A1Cresult=payload.A1Cresult,
        change=payload.change,
        diabetesMed=payload.diabetesMed,
        risk_score=risk_score,
        risk_category=risk_category,
        readmitted=readmitted,
        admission_date=adm_date,
        discharge_date=disch_date
    )
    db.add(admission)
    db.flush()

    # 4. Add Medications
    for med_in in payload.medications:
        med = Medication(
            admission_id=admission.id,
            medication_name=med_in.medication_name,
            dosage_status=med_in.dosage_status
        )
        db.add(med)

    db.commit()
    db.refresh(patient)

    res = PatientResponse.from_orm(patient)
    res.latest_risk_score = risk_score
    res.latest_risk_category = risk_category
    res.latest_readmission_status = readmitted
    res.assigned_doctor_name = current_user.full_name if current_user else "Unassigned"
    return res
