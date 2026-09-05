import os
import json
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(
    title="HealthForecast AI - ML Inference Microservice",
    description="Dedicated XGBoost machine learning inference microservice for readmission prediction."
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "healthforecast_model")

model = joblib.load(os.path.join(MODEL_DIR, "xgboost_readmission_model.pkl"))
encoder = joblib.load(os.path.join(MODEL_DIR, "onehot_encoder.pkl"))
scaler = joblib.load(os.path.join(MODEL_DIR, "standard_scaler.pkl"))

with open(os.path.join(MODEL_DIR, "feature_columns.json")) as f:
    feature_info = json.load(f)

categorical_cols = feature_info["categorical_cols"]
numerical_cols = feature_info["numerical_cols"]
final_feature_names = feature_info["final_feature_names"]

class InferenceRequest(BaseModel):
    race: str = "Caucasian"
    gender: str = "Female"
    age: str = "[50-60)"
    admission_type_id: str = "1"
    discharge_disposition_id: str = "1"
    admission_source_id: str = "1"
    time_in_hospital: int = 3
    payer_code: str = "MC"
    medical_specialty: str = "InternalMedicine"
    num_lab_procedures: int = 35
    num_procedures: int = 0
    num_medications: int = 12
    number_outpatient: int = 0
    number_emergency: int = 0
    number_inpatient: int = 0
    number_diagnoses: int = 6
    max_glu_serum: str = "Norm"
    A1Cresult: str = "Norm"
    metformin: str = "No"
    repaglinide: str = "No"
    nateglinide: str = "No"
    chlorpropamide: str = "No"
    glimepiride: str = "No"
    acetohexamide: str = "No"
    glipizide: str = "No"
    glyburide: str = "No"
    tolbutamide: str = "No"
    pioglitazone: str = "No"
    rosiglitazone: str = "No"
    acarbose: str = "No"
    miglitol: str = "No"
    troglitazone: str = "No"
    tolazamide: str = "No"
    examide: str = "No"
    citoglipton: str = "No"
    insulin: str = "No"
    glyburide_metformin: str = "No"
    glipizide_metformin: str = "No"
    glimepiride_pioglitazone: str = "No"
    metformin_rosiglitazone: str = "No"
    metformin_pioglitazone: str = "No"
    change: str = "No"
    diabetesMed: str = "No"
    diag_1_group: str = "Circulatory"
    diag_2_group: str = "Diabetes"
    diag_3_group: str = "Other"

def clean_column_name(name: str) -> str:
    return name.replace("[", "").replace("]", "").replace("<", "lt_")

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "ml_service",
        "model_type": "XGBoost Classifier",
        "model_roc_auc": 0.658,
        "model_recall": 0.59
    }

@app.post("/infer")
def infer(data: InferenceRequest):
    try:
        raw_dict = data.model_dump()
        raw_dict["glyburide-metformin"] = raw_dict.pop("glyburide_metformin")
        raw_dict["glipizide-metformin"] = raw_dict.pop("glipizide_metformin")
        raw_dict["glimepiride-pioglitazone"] = raw_dict.pop("glimepiride_pioglitazone")
        raw_dict["metformin-rosiglitazone"] = raw_dict.pop("metformin_rosiglitazone")
        raw_dict["metformin-pioglitazone"] = raw_dict.pop("metformin_pioglitazone")

        df = pd.DataFrame([raw_dict])

        cat_data = encoder.transform(df[categorical_cols])
        cat_cols_out = encoder.get_feature_names_out(categorical_cols)
        cat_df = pd.DataFrame(cat_data, columns=cat_cols_out)

        num_data = scaler.transform(df[numerical_cols])
        num_df = pd.DataFrame(num_data, columns=numerical_cols)

        final_df = pd.concat([num_df, cat_df], axis=1)
        final_df.columns = [clean_column_name(c) for c in final_df.columns]
        final_df = final_df.reindex(columns=final_feature_names, fill_value=0)

        probability = float(model.predict_proba(final_df)[0][1])
        risk_percentage = round(probability * 100.0, 2)

        if probability >= 0.7:
            risk_class = "CRITICAL"
            prediction = "High Readmission Risk"
        elif probability >= 0.5:
            risk_class = "HIGH"
            prediction = "Elevated Readmission Risk"
        elif probability >= 0.3:
            risk_class = "MEDIUM"
            prediction = "Moderate Readmission Risk"
        else:
            risk_class = "LOW"
            prediction = "Low Readmission Risk"

        return {
            "probability": round(probability, 4),
            "risk_percentage": risk_percentage,
            "risk_class": risk_class,
            "prediction": prediction,
            "model_roc_auc": 0.658,
            "model_recall": 0.59
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
