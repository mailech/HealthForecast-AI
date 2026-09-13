from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.patient import (
    Admission,
    MedicalHistory,
    Patient,
    Treatment,
)
from ..models.clinical_assessment import ClinicalAssessment
from ..models.user import User
from ..schemas.patient import (
    AdmissionCreate,
    AdmissionResponse,
    ClinicalAssessmentCreate,
    ClinicalAssessmentResponse,
    MedicalHistoryCreate,
    MedicalHistoryResponse,
    PatientCreate,
    PatientResearchResponse,
    PatientResponse,
    PatientUpdate,
    TreatmentCreate,
    TreatmentResponse,
)
from ..utils.security import get_current_user


router = APIRouter(
    prefix="/patients",
    tags=["Patient Management"]
)


# ============================================================
# Patient Access Control
# ============================================================

def check_patient_access(
    patient: Patient,
    current_user: User
):
    role = current_user.role.value

    # System administrators have full access.
    if role == "system_admin":
        return

    # Doctors can only access their assigned patients.
    if role == "doctor":
        if patient.assigned_doctor_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this patient"
            )
        return

    # Hospital administrators have view access.
    if role == "hospital_admin":
        return

    # Researchers must use anonymized endpoint.
    if role == "healthcare_researcher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Researchers must use the anonymized patient endpoint"
        )

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have permission to access patient records"
    )


def get_patient_or_404(
    patient_id: int,
    db: Session
) -> Patient:

    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )

    return patient


# ============================================================
# Patient Management
# ============================================================

@router.post(
    "",
    response_model=PatientResponse,
    status_code=status.HTTP_201_CREATED
)
def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = current_user.role.value

    if role not in {"doctor", "system_admin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and system administrators can create patients"
        )

    assigned_doctor_id = patient_data.assigned_doctor_id

    # Doctors automatically become responsible for patients they create.
    if role == "doctor":
        assigned_doctor_id = current_user.id

    # If a system administrator assigns a doctor,
    # verify that the doctor exists and has the correct role.
    if assigned_doctor_id is not None:
        doctor = (
            db.query(User)
            .filter(User.id == assigned_doctor_id)
            .first()
        )

        if doctor is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned doctor not found"
            )

        if doctor.role.value != "doctor":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Assigned user must have doctor role"
            )

    patient = Patient(
        name=patient_data.name,
        date_of_birth=patient_data.date_of_birth,
        gender=patient_data.gender,
        phone=patient_data.phone,
        address=patient_data.address,
        blood_group=patient_data.blood_group,
        assigned_doctor_id=assigned_doctor_id,
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return patient


@router.get(
    "",
    response_model=list[PatientResponse]
)
def get_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    role = current_user.role.value

    if role == "system_admin":
        return db.query(Patient).all()

    if role == "doctor":
        return (
            db.query(Patient)
            .filter(
                Patient.assigned_doctor_id == current_user.id
            )
            .all()
        )

    if role == "hospital_admin":
        return db.query(Patient).all()

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Researchers must use the anonymized patient endpoint"
    )


# ============================================================
# Research / Anonymized Patient Data
# ============================================================

@router.get(
    "/research/anonymized",
    response_model=list[PatientResearchResponse]
)
def get_anonymized_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value != "healthcare_researcher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only healthcare researchers can access this endpoint"
        )

    patients = db.query(Patient).all()

    today = date.today()

    response = []

    for patient in patients:
        age = None

        if patient.date_of_birth:
            age = (
                today.year
                - patient.date_of_birth.year
                - (
                    (today.month, today.day)
                    <
                    (
                        patient.date_of_birth.month,
                        patient.date_of_birth.day
                    )
                )
            )

        response.append(
            PatientResearchResponse(
                id=patient.id,
                age=age,
                gender=patient.gender,
                blood_group=patient.blood_group,
            )
        )

    return response


# ============================================================
# Get Single Patient
# ============================================================

@router.get(
    "/{patient_id}",
    response_model=PatientResponse
)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = get_patient_or_404(
        patient_id,
        db
    )

    check_patient_access(
        patient,
        current_user
    )

    return patient


# ============================================================
# Update Patient
# ============================================================

@router.put(
    "/{patient_id}",
    response_model=PatientResponse
)
def update_patient(
    patient_id: int,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = get_patient_or_404(
        patient_id,
        db
    )

    check_patient_access(
        patient,
        current_user
    )

    role = current_user.role.value

    if role not in {"doctor", "system_admin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and system administrators can modify patient records"
        )

    update_data = patient_data.model_dump(
        exclude_unset=True
    )

    # Doctors cannot reassign patients.
    if role == "doctor":
        update_data.pop(
            "assigned_doctor_id",
            None
        )

    if "assigned_doctor_id" in update_data:
        doctor_id = update_data["assigned_doctor_id"]

        if doctor_id is not None:
            doctor = (
                db.query(User)
                .filter(User.id == doctor_id)
                .first()
            )

            if doctor is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Assigned doctor not found"
                )

            if doctor.role.value != "doctor":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Assigned user must have doctor role"
                )

    for field, value in update_data.items():
        setattr(
            patient,
            field,
            value
        )

    patient.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(patient)

    return patient


# ============================================================
# Delete Patient
# ============================================================

@router.delete(
    "/{patient_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value != "system_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system administrators can delete patient records"
        )

    patient = get_patient_or_404(
        patient_id,
        db
    )

    db.delete(patient)
    db.commit()

    return None


# ============================================================
# Clinical Assessment
# ============================================================

@router.post(
    "/{patient_id}/clinical-assessment",
    response_model=ClinicalAssessmentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_clinical_assessment(
    patient_id: int,
    assessment_data: ClinicalAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create the clinical assessment used as input for
    the readmission prediction pipeline.
    """

    patient = get_patient_or_404(
        patient_id,
        db
    )

    check_patient_access(
        patient,
        current_user
    )

    # Only doctors and system administrators can create
    # or modify clinical assessment information.
    if current_user.role.value not in {
        "doctor",
        "system_admin"
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and system administrators can create clinical assessments"
        )

    # One clinical assessment per patient.
    existing_assessment = (
        db.query(ClinicalAssessment)
        .filter(
            ClinicalAssessment.patient_id == patient.id
        )
        .first()
    )

    if existing_assessment is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Clinical assessment already exists for this patient. Use the update endpoint."
        )

    assessment = ClinicalAssessment(
        patient_id=patient.id,

        admission_type_id=assessment_data.admission_type_id,
        discharge_disposition_id=assessment_data.discharge_disposition_id,
        admission_source_id=assessment_data.admission_source_id,
        time_in_hospital=assessment_data.time_in_hospital,

        num_lab_procedures=assessment_data.num_lab_procedures,
        num_procedures=assessment_data.num_procedures,
        num_medications=assessment_data.num_medications,

        number_outpatient=assessment_data.number_outpatient,
        number_emergency=assessment_data.number_emergency,
        number_inpatient=assessment_data.number_inpatient,
        number_diagnoses=assessment_data.number_diagnoses,

        max_glu_serum=assessment_data.max_glu_serum,
        A1Cresult=assessment_data.A1Cresult,

        metformin=assessment_data.metformin,
        repaglinide=assessment_data.repaglinide,
        nateglinide=assessment_data.nateglinide,
        chlorpropamide=assessment_data.chlorpropamide,
        glimepiride=assessment_data.glimepiride,
        acetohexamide=assessment_data.acetohexamide,
        glipizide=assessment_data.glipizide,
        glyburide=assessment_data.glyburide,
        tolbutamide=assessment_data.tolbutamide,
        pioglitazone=assessment_data.pioglitazone,
        rosiglitazone=assessment_data.rosiglitazone,
        acarbose=assessment_data.acarbose,
        miglitol=assessment_data.miglitol,
        troglitazone=assessment_data.troglitazone,
        tolazamide=assessment_data.tolazamide,
        insulin=assessment_data.insulin,

        glyburide_metformin=assessment_data.glyburide_metformin,
        glipizide_metformin=assessment_data.glipizide_metformin,
        glimepiride_pioglitazone=assessment_data.glimepiride_pioglitazone,
        metformin_rosiglitazone=assessment_data.metformin_rosiglitazone,
        metformin_pioglitazone=assessment_data.metformin_pioglitazone,

        change=assessment_data.change,
        diabetesMed=assessment_data.diabetesMed,

        race=assessment_data.race,
        diag_1_category=assessment_data.diag_1_category,
        diag_2_category=assessment_data.diag_2_category,
        diag_3_category=assessment_data.diag_3_category,

        prior_utilization=assessment_data.prior_utilization,
        medication_count=assessment_data.medication_count,
        medication_changed=assessment_data.medication_changed,
        diabetes_medication=assessment_data.diabetes_medication,
        clinical_activity=assessment_data.clinical_activity,
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return assessment


@router.get(
    "/{patient_id}/clinical-assessment",
    response_model=ClinicalAssessmentResponse
)
def get_clinical_assessment(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve the clinical assessment for a patient.
    """

    patient = get_patient_or_404(
        patient_id,
        db
    )

    check_patient_access(
        patient,
        current_user
    )

    assessment = (
        db.query(ClinicalAssessment)
        .filter(
            ClinicalAssessment.patient_id == patient.id
        )
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinical assessment not found for this patient"
        )

    return assessment


@router.put(
    "/{patient_id}/clinical-assessment",
    response_model=ClinicalAssessmentResponse
)
def update_clinical_assessment(
    patient_id: int,
    assessment_data: ClinicalAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update the clinical assessment for a patient.
    """

    patient = get_patient_or_404(
        patient_id,
        db
    )

    check_patient_access(
        patient,
        current_user
    )

    if current_user.role.value not in {
        "doctor",
        "system_admin"
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and system administrators can modify clinical assessments"
        )

    assessment = (
        db.query(ClinicalAssessment)
        .filter(
            ClinicalAssessment.patient_id == patient.id
        )
        .first()
    )

    if assessment is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinical assessment not found for this patient"
        )

    update_data = assessment_data.model_dump()

    for field, value in update_data.items():
        setattr(
            assessment,
            field,
            value
        )

    assessment.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(assessment)

    return assessment


# ============================================================
# Medical History
# ============================================================

@router.post(
    "/{patient_id}/medical-history",
    response_model=MedicalHistoryResponse,
    status_code=status.HTTP_201_CREATED
)
def create_medical_history(
    patient_id: int,
    history_data: MedicalHistoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = get_patient_or_404(
        patient_id,
        db
    )

    check_patient_access(
        patient,
        current_user
    )

    if current_user.role.value not in {
        "doctor",
        "system_admin"
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and system administrators can add medical history"
        )

    history = MedicalHistory(
        patient_id=patient.id,
        diagnosis=history_data.diagnosis,
        description=history_data.description,
        diagnosis_date=history_data.diagnosis_date,
        notes=history_data.notes,
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return history


@router.get(
    "/{patient_id}/medical-history",
    response_model=list[MedicalHistoryResponse]
)
def get_medical_history(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = get_patient_or_404(
        patient_id,
        db
    )

    check_patient_access(
        patient,
        current_user
    )

    return (
        db.query(MedicalHistory)
        .filter(
            MedicalHistory.patient_id == patient.id
        )
        .all()
    )


# ============================================================
# Treatments
# ============================================================

@router.post(
    "/{patient_id}/treatments",
    response_model=TreatmentResponse,
    status_code=status.HTTP_201_CREATED
)
def create_treatment(
    patient_id: int,
    treatment_data: TreatmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = get_patient_or_404(
        patient_id,
        db
    )

    check_patient_access(
        patient,
        current_user
    )

    if current_user.role.value not in {
        "doctor",
        "system_admin"
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and system administrators can add treatments"
        )

    treatment = Treatment(
        patient_id=patient.id,
        treatment_name=treatment_data.treatment_name,
        medication=treatment_data.medication,
        dosage=treatment_data.dosage,
        start_date=treatment_data.start_date,
        end_date=treatment_data.end_date,
        outcome=treatment_data.outcome,
        notes=treatment_data.notes,
    )

    db.add(treatment)
    db.commit()
    db.refresh(treatment)

    return treatment


@router.get(
    "/{patient_id}/treatments",
    response_model=list[TreatmentResponse]
)
def get_treatments(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = get_patient_or_404(
        patient_id,
        db
    )

    check_patient_access(
        patient,
        current_user
    )

    return (
        db.query(Treatment)
        .filter(
            Treatment.patient_id == patient.id
        )
        .all()
    )


# ============================================================
# Admissions
# ============================================================

@router.post(
    "/{patient_id}/admissions",
    response_model=AdmissionResponse,
    status_code=status.HTTP_201_CREATED
)
def create_admission(
    patient_id: int,
    admission_data: AdmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = get_patient_or_404(
        patient_id,
        db
    )

    check_patient_access(
        patient,
        current_user
    )

    if current_user.role.value not in {
        "doctor",
        "system_admin"
    }:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only doctors and system administrators can add admission records"
        )

    admission = Admission(
        patient_id=patient.id,
        admission_date=admission_data.admission_date,
        discharge_date=admission_data.discharge_date,
        admission_type=admission_data.admission_type,
        diagnosis=admission_data.diagnosis,
        discharge_reason=admission_data.discharge_reason,
        notes=admission_data.notes,
    )

    db.add(admission)
    db.commit()
    db.refresh(admission)

    return admission


@router.get(
    "/{patient_id}/admissions",
    response_model=list[AdmissionResponse]
)
def get_admissions(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = get_patient_or_404(
        patient_id,
        db
    )

    check_patient_access(
        patient,
        current_user
    )

    return (
        db.query(Admission)
        .filter(
            Admission.patient_id == patient.id
        )
        .all()
    )