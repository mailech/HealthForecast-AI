from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel, Field
from app.schemas.prediction import PredictionInput, PredictionResponse, PredictionSave, PredictionInDB, PredictionUpdate
from app.services.prediction_service import PredictionService
from app.services.patient_service import PatientService
from app.services.pdf_service import PDFService
from app.services.audit_service import AuditService
from app.dependencies import RoleChecker, get_current_user, normalize_role
from app.database import treatments_collection, patients_collection

router = APIRouter(prefix="/prediction", tags=["Readmission Risk Prediction"])

# Define access rights
doctor_only = Depends(RoleChecker(allowed_roles=["Doctor"]))
all_roles = Depends(RoleChecker(allowed_roles=["Doctor", "Researcher", "Admin", "SysAdmin"]))

# ─── Simple Prediction Input Schema ──────────────────────────────────────────
class SimplePredictionInput(BaseModel):
    """Simplified prediction input — backend auto-fetches remaining ML features from MongoDB."""
    patient_id: str
    # Vitals (optional — doctor fills what they know)
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    blood_glucose: Optional[float] = None
    hba1c: Optional[float] = None
    heart_rate: Optional[int] = None
    spo2: Optional[float] = None
    body_temperature: Optional[float] = None
    bmi: Optional[float] = None
    cholesterol: Optional[float] = None
    # Conditions
    has_diabetes: Optional[bool] = None
    has_hypertension: Optional[bool] = None
    has_heart_disease: Optional[bool] = None
    other_conditions: Optional[str] = None
    # Clinical notes
    symptoms_notes: Optional[str] = None
    # Override fields (advanced use)
    time_in_hospital: Optional[int] = None
    num_lab_procedures: Optional[int] = None
    num_procedures: Optional[int] = None
    number_diagnoses: Optional[int] = None



# Mapping of common medication names to ML model medication columns
MED_NAME_MAP = {
    "metformin": "metformin", "repaglinide": "repaglinide", "nateglinide": "nateglinide",
    "chlorpropamide": "chlorpropamide", "glimepiride": "glimepiride",
    "acetohexamide": "acetohexamide", "glipizide": "glipizide", "glyburide": "glyburide",
    "tolbutamide": "tolbutamide", "pioglitazone": "pioglitazone", "rosiglitazone": "rosiglitazone",
    "acarbose": "acarbose", "miglitol": "miglitol", "troglitazone": "troglitazone",
    "tolazamide": "tolazamide", "examide": "examide", "citoglipton": "citoglipton",
    "insulin": "insulin", "glyburide-metformin": "glyburide-metformin",
    "glipizide-metformin": "glipizide-metformin", "glimepiride-pioglitazone": "glimepiride-pioglitazone",
    "metformin-rosiglitazone": "metformin-rosiglitazone", "metformin-pioglitazone": "metformin-pioglitazone",
}

@router.post("/simple-predict", response_model=PredictionInDB)
def simple_predict(simple_in: SimplePredictionInput, current_user: dict = Depends(get_current_user)):
    """
    Simplified prediction endpoint. Accepts clinical vitals/conditions from the doctor.
    Backend automatically fetches patient demographics and treatment medications from MongoDB
    to build the full ML feature vector. Doctor does NOT need to fill medication fields manually.
    RESTRICTED TO DOCTOR ROLE ONLY.
    """
    import logging
    logger = logging.getLogger("app.routes.prediction")
    logger.info(f"BACKEND RECEIVED PREDICTION PAYLOAD FROM FRONTEND: {simple_in.model_dump()}")
    print("BACKEND RECEIVED PREDICTION PAYLOAD FROM FRONTEND:", simple_in.model_dump())

    user_role = current_user.get("role", "")
    norm_role = normalize_role(user_role)
    if norm_role != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"{user_role} is not authorized to create predictions. Only Doctors can create AI predictions."
        )

    # 1. Fetch patient record from MongoDB
    patient = patients_collection.find_one({"patient_id": simple_in.patient_id})
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Patient {simple_in.patient_id} not found.")

    # 2. Build age bracket from date_of_birth
    age_bracket = "[50-60)"
    try:
        from datetime import date
        dob_str = patient.get("date_of_birth", "")
        if dob_str:
            dob = date.fromisoformat(dob_str)
            age_years = (date.today() - dob).days // 365
            for lo, hi in [(0,10),(10,20),(20,30),(30,40),(40,50),(50,60),(60,70),(70,80),(80,90),(90,100)]:
                if lo <= age_years < hi:
                    age_bracket = f"[{lo}-{hi})"
                    break
    except Exception:
        pass

    # 3. Derive clinical flags and threshold values
    bp_sys = simple_in.blood_pressure_systolic
    bp_dia = simple_in.blood_pressure_diastolic
    glucose = simple_in.blood_glucose
    hba1c = simple_in.hba1c
    hr = simple_in.heart_rate
    spo2 = simple_in.spo2
    temp = simple_in.body_temperature
    bmi = simple_in.bmi
    cholesterol = simple_in.cholesterol

    notes_text = (str(simple_in.symptoms_notes or "") + " " + str(simple_in.other_conditions or "")).lower()

    has_diabetes_notes = any(w in notes_text for w in ["diabet", "hba1c", "glucose", "hyperglyc"])
    has_hypertension_notes = any(w in notes_text for w in ["hypertens", "high bp", "blood pressure"])
    has_heart_notes = any(w in notes_text for w in ["heart", "cardiac", "tachycardia", "chest pain", "chest discomfort", "coronary"])
    has_fever_notes = any(w in notes_text for w in ["fever", "pyrexia", "high temp", "temperature"])
    has_resp_notes = any(w in notes_text for w in ["oxygen", "hypoxia", "breath", "dyspnea", "spo2", "copd"])

    has_diabetes = bool(simple_in.has_diabetes or has_diabetes_notes or (glucose and glucose >= 180) or (hba1c and hba1c >= 7.0))
    has_hypertension = bool(simple_in.has_hypertension or has_hypertension_notes or (bp_sys and bp_sys >= 140) or (bp_dia and bp_dia >= 90))
    has_heart_disease = bool(simple_in.has_heart_disease or has_heart_notes or (hr and hr >= 100) or (bp_sys and bp_sys >= 150))
    has_fever = bool(has_fever_notes or (temp and temp >= 38.0))
    has_hypoxia = bool(has_resp_notes or (spo2 and spo2 <= 92))

    # ICD-9 diagnosis codes derived from input vitals and conditions
    if has_diabetes or (glucose and glucose >= 180) or (hba1c and hba1c >= 7.0):
        diag_1 = "250.02" if (glucose and glucose >= 250) or (hba1c and hba1c >= 9.0) else "250.01"
    elif has_heart_disease or (bp_sys and bp_sys >= 160) or (hr and hr >= 110):
        diag_1 = "410"
    elif has_hypoxia or has_fever:
        diag_1 = "460"
    elif has_hypertension or (bp_sys and bp_sys >= 140):
        diag_1 = "401"
    elif cholesterol and cholesterol >= 240:
        diag_1 = "272"
    else:
        diag_1 = "401"

    diag_2 = "401" if (has_hypertension or (bp_sys and bp_sys >= 140)) else ("250.01" if has_diabetes else "272")
    diag_3 = "410" if (has_heart_disease or (hr and hr >= 100)) else ("272" if (cholesterol and cholesterol >= 240) else ("460" if (spo2 and spo2 <= 94) else "V58"))

    # Dynamic admission type & source
    is_emergency = bool(
        (bp_sys and bp_sys >= 160) or (bp_dia and bp_dia >= 100) or
        (glucose and glucose >= 250) or (hba1c and hba1c >= 9.0) or
        (spo2 and spo2 <= 90) or (hr and hr >= 110) or has_fever or
        (has_heart_disease and has_diabetes)
    )
    admission_type_id = 1 if is_emergency else 3
    admission_source_id = 7 if is_emergency else 1

    # Dynamic time in hospital
    if simple_in.time_in_hospital is not None:
        time_in_hospital = simple_in.time_in_hospital
    else:
        stay = 2
        if (bp_sys and bp_sys >= 160) or (bp_dia and bp_dia >= 100): stay += 2
        if (glucose and glucose >= 250) or (hba1c and hba1c >= 9.0): stay += 2
        if (spo2 and spo2 <= 92): stay += 2
        if (hr and hr >= 110): stay += 1
        if has_fever: stay += 2
        if has_heart_disease: stay += 1
        if has_diabetes and has_hypertension: stay += 1
        time_in_hospital = min(max(stay, 1), 14)

    # Dynamic num lab procedures
    if simple_in.num_lab_procedures is not None:
        num_lab_procedures = simple_in.num_lab_procedures
    else:
        labs = 25
        if glucose is not None: labs += 10
        if hba1c is not None: labs += 10
        if cholesterol is not None: labs += 10
        if spo2 is not None: labs += 10
        if temp is not None: labs += 10
        if (glucose and glucose >= 200) or (hba1c and hba1c >= 8.5): labs += 15
        if (bp_sys and bp_sys >= 160): labs += 10
        if (spo2 and spo2 <= 92): labs += 10
        if has_fever: labs += 15
        if has_heart_disease: labs += 10
        num_lab_procedures = min(max(labs, 15), 130)

    # Dynamic procedures
    num_procedures = simple_in.num_procedures if simple_in.num_procedures is not None else (
        3 if (has_heart_disease and bp_sys and bp_sys >= 160) else (2 if (has_heart_disease or is_emergency) else (1 if (bp_sys and bp_sys >= 140) else 0))
    )

    # Dynamic number of diagnoses
    if simple_in.number_diagnoses is not None:
        number_diagnoses = simple_in.number_diagnoses
    else:
        diag_count = 1
        if has_diabetes or (glucose and glucose >= 140) or (hba1c and hba1c >= 6.5): diag_count += 1
        if has_hypertension or (bp_sys and bp_sys >= 130) or (bp_dia and bp_dia >= 85): diag_count += 1
        if has_heart_disease or (hr and hr >= 90): diag_count += 1
        if bmi and bmi >= 30: diag_count += 1
        if cholesterol and cholesterol >= 200: diag_count += 1
        if spo2 and spo2 <= 95: diag_count += 1
        if has_fever: diag_count += 1
        if simple_in.other_conditions: diag_count += 1
        if (bp_sys and bp_sys >= 160) or (glucose and glucose >= 250) or (hba1c and hba1c >= 9.0) or (spo2 and spo2 <= 91): diag_count += 3
        number_diagnoses = min(max(diag_count, 2), 16)

    # Severity scoring for prior utilization features
    severity_score = sum([
        bool(bp_sys and bp_sys >= 160),
        bool(bp_dia and bp_dia >= 100),
        bool(glucose and glucose >= 220),
        bool(hba1c and hba1c >= 8.5),
        bool(spo2 and spo2 <= 92),
        bool(hr and hr >= 110),
        bool(has_fever),
        bool(has_heart_disease and has_diabetes),
        bool(bmi and bmi >= 35)
    ])

    if severity_score >= 5:
        number_inpatient = 3
        number_emergency = 2
    elif severity_score >= 3:
        number_inpatient = 2
        number_emergency = 1
    elif severity_score >= 2:
        number_inpatient = 1
        number_emergency = 0
    else:
        number_inpatient = 0
        number_emergency = 0

    # 4. Fetch patient's active treatment medications from MongoDB
    treatments = list(treatments_collection.find({"patient_id": simple_in.patient_id, "status": {"$in": ["Active", "In Progress"]}}).sort("created_at", -1).limit(5))

    # Build medication column dict — all default to "No"
    med_cols = {
        "metformin": "No", "repaglinide": "No", "nateglinide": "No", "chlorpropamide": "No",
        "glimepiride": "No", "acetohexamide": "No", "glipizide": "No", "glyburide": "No",
        "tolbutamide": "No", "pioglitazone": "No", "rosiglitazone": "No", "acarbose": "No",
        "miglitol": "No", "troglitazone": "No", "tolazamide": "No", "examide": "No",
        "citoglipton": "No", "insulin": "No", "glyburide-metformin": "No",
        "glipizide-metformin": "No", "glimepiride-pioglitazone": "No",
        "metformin-rosiglitazone": "No", "metformin-pioglitazone": "No",
    }

    num_med_count = 0
    for treatment in treatments:
        for med in (treatment.get("medications") or []):
            med_name_raw = (med.get("name") or "").lower().strip()
            for key in MED_NAME_MAP:
                if key in med_name_raw:
                    med_col = MED_NAME_MAP[key]
                    med_cols[med_col] = "Steady"
                    num_med_count += 1
                    break

    calc_meds = 0
    if has_diabetes: calc_meds += 2
    if has_hypertension: calc_meds += 2
    if has_heart_disease: calc_meds += 3
    if cholesterol and cholesterol >= 200: calc_meds += 1
    if spo2 and spo2 <= 92: calc_meds += 2
    if (glucose and glucose >= 220) or (hba1c and hba1c >= 8.5): calc_meds += 2
    if (bp_sys and bp_sys >= 160): calc_meds += 2

    num_medications = max(num_med_count, calc_meds if calc_meds > 0 else 2, 2)

    if (glucose and glucose >= 220) or (hba1c and hba1c >= 8.5):
        med_cols["insulin"] = "Up"
        med_cols["metformin"] = "Steady"
        med_cols["glipizide"] = "Steady"
    elif has_diabetes or (glucose and glucose >= 180) or (hba1c and hba1c >= 7.0):
        med_cols["metformin"] = "Steady"

    change = "Ch" if (severity_score >= 2 or (glucose and glucose >= 200) or (hba1c and hba1c >= 8.0) or (bp_sys and bp_sys >= 150)) else "No"
    diabetes_med = "Yes" if (has_diabetes or (glucose and glucose >= 180) or (hba1c and hba1c >= 7.0)) else "No"

    gender = patient.get("gender", "Female")
    gender = "Male" if gender.lower() == "male" else "Female"

    pred_data = {
        "patient_id": simple_in.patient_id,
        "race": "Caucasian",
        "gender": gender,
        "age": age_bracket,
        "admission_type_id": admission_type_id,
        "discharge_disposition_id": 1,
        "admission_source_id": admission_source_id,
        "time_in_hospital": time_in_hospital,
        "num_lab_procedures": num_lab_procedures,
        "num_procedures": num_procedures,
        "num_medications": num_medications,
        "number_outpatient": 0,
        "number_emergency": number_emergency,
        "number_inpatient": number_inpatient,
        "diag_1": diag_1,
        "diag_2": diag_2,
        "diag_3": diag_3,
        "number_diagnoses": number_diagnoses,
        "medical_specialty": "InternalMedicine",
        "change": change,
        "diabetesMed": diabetes_med,
        "medications": med_cols,
    }

    logger.info(f"PROCESSED MODEL INPUT FEATURES for patient '{simple_in.patient_id}': {pred_data}")
    print("PROCESSED MODEL INPUT FEATURES:", pred_data)

    try:
        from app.schemas.prediction import PredictionInput as PI
        prediction_in = PI(**pred_data)
        prediction_result = PredictionService.predict_readmission(prediction_in, current_user["email"])

        logger.info(
            f"MODEL INFERENCE COMPLETED for patient '{simple_in.patient_id}': "
            f"Risk Level={prediction_result.get('risk_level')}, "
            f"Score={prediction_result.get('readmission_risk_score')}, "
            f"Model1 Prob={prediction_result.get('model1_probability')}, "
            f"Model2 Prob={prediction_result.get('model2_probability')}"
        )
        print(f"RAW MODEL OUTPUT: Model1 Prob={prediction_result.get('model1_probability'):.4f}, Model2 Prob={prediction_result.get('model2_probability'):.4f}, Readmission Risk Score={prediction_result.get('readmission_risk_score'):.4f}, Risk Level={prediction_result.get('risk_level')}")

        AuditService.log_event(
            user_id=str(current_user.get("_id")),
            user_email=current_user["email"],
            user_role=current_user.get("role", ""),
            action="PREDICTION_CREATED",
            target_resource=simple_in.patient_id,
            details=f"Created AI prediction for patient {simple_in.patient_id} with risk level {prediction_result.get('risk_level')}"
        )
        return prediction_result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Prediction error: {e}")


@router.post("/predict", response_model=PredictionInDB)
def predict_risk(prediction_in: PredictionInput, current_user: dict = Depends(get_current_user)):
    """
    Inputs clinical metrics to classify a patient's readmission risk score and level.
    RESTRICTED TO DOCTOR ROLE ONLY!
    """
    user_role = current_user.get("role", "")
    norm_role = normalize_role(user_role)
    if norm_role != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"{user_role} is not authorized to create predictions. Only Doctors can create AI predictions."
        )

    try:
        prediction_result = PredictionService.predict_readmission(prediction_in, current_user["email"])
        
        # Log audit event
        AuditService.log_event(
            user_id=str(current_user.get("_id")),
            user_email=current_user["email"],
            user_role=current_user.get("role", ""),
            action="PREDICTION_CREATED",
            target_resource=prediction_in.patient_id,
            details=f"Created AI prediction for patient {prediction_in.patient_id} with risk level {prediction_result.get('risk_level')}"
        )
        return prediction_result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Prediction error: {e}"
        )

@router.post("", response_model=PredictionInDB)
def save_prediction(prediction_save: PredictionSave, current_user: dict = Depends(get_current_user)):
    """
    Persists a risk prediction analysis to the database history logs.
    Restricted to Doctor.
    """
    user_role = current_user.get("role", "")
    if normalize_role(user_role) != "doctor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Doctors are authorized to save predictions."
        )

    try:
        features_used = prediction_save.features_used or {
            "patient_id": prediction_save.patient_id,
            "prediction_date": prediction_save.prediction_date.isoformat() if prediction_save.prediction_date else None,
            "predicted_by": prediction_save.predicted_by,
        }
        res = PredictionService.save_prediction(prediction_save, features_used=features_used)
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to persist prediction record: {e}"
        )

@router.get("/patient/{patient_id}", response_model=List[PredictionInDB], dependencies=[all_roles])
def get_patient_predictions(patient_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieves all readmission predictions calculated for a patient.
    """
    return PredictionService.get_predictions_by_patient(patient_id)

@router.get("/{prediction_id}/pdf", dependencies=[all_roles])
def download_prediction_pdf(prediction_id: str, current_user: dict = Depends(get_current_user)):
    """
    Generates and downloads a formal PDF report for a saved prediction record.
    """
    pred = PredictionService.get_by_id(prediction_id)
    if not pred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found."
        )

    patient = None
    if pred.get("patient_id"):
        patient = PatientService.get_by_id(pred.get("patient_id"))

    pdf_bytes = PDFService.generate_prediction_pdf(pred, patient)

    AuditService.log_event(
        user_id=str(current_user.get("_id")),
        user_email=current_user["email"],
        user_role=current_user.get("role", ""),
        action="PREDICTION_PDF_DOWNLOADED",
        target_resource=prediction_id,
        details=f"Downloaded prediction PDF report for prediction ID {prediction_id}"
    )

    filename = f"health_prediction_report_{pred.get('patient_id', 'record')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.get("/{prediction_id}", response_model=PredictionInDB, dependencies=[all_roles])
def get_prediction_by_id(prediction_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieves a single prediction record by ID.
    """
    pred = PredictionService.get_by_id(prediction_id)
    if not pred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found."
        )
    
    AuditService.log_event(
        user_id=str(current_user.get("_id")),
        user_email=current_user["email"],
        user_role=current_user.get("role", ""),
        action="PREDICTION_VIEWED",
        target_resource=prediction_id,
        details=f"Viewed prediction ID {prediction_id}"
    )
    return pred

@router.get("", response_model=List[PredictionInDB], dependencies=[all_roles])
def list_predictions(skip: int = 0, limit: int = 100):
    """
    Lists historical readmission predictions.
    """
    return PredictionService.get_all_predictions(skip=skip, limit=limit)

@router.patch("/{prediction_id}", response_model=PredictionInDB, dependencies=[doctor_only])
def update_prediction(prediction_id: str, update_in: PredictionUpdate):
    """
    Partially updates a saved prediction record.
    """
    update_data = update_in.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided to update."
        )
    updated = PredictionService.update_prediction(prediction_id, update_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found or update failed."
        )
    return updated

@router.delete("/{prediction_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[doctor_only])
def delete_prediction(prediction_id: str):
    """
    Deletes a prediction record from the database.
    """
    # Safe check: do not delete if linked to active treatment
    linked_treatment = treatments_collection.find_one({"prediction_id": prediction_id})
    if linked_treatment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete prediction that is currently linked to a treatment record. Delete or unlink the treatment first."
        )

    success = PredictionService.delete_prediction(prediction_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found or delete failed."
        )
