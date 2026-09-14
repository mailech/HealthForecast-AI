from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import os
import joblib
import pandas as pd

from models.risk_model import predict_risk


# ==================================================
# FastAPI Application
# ==================================================

app = FastAPI(
    title="Final Healthcare AI Service",
    version="1.0.0"
)


# ==================================================
# CORS Configuration
# ==================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        "http://localhost:5174",
        "http://127.0.0.1:5174",

        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],

    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================================================
# Load Readmission Model
# ==================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

READMISSION_MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "readmission_model.joblib"
)

readmission_model = None
readmission_model_error = None


try:
    print(
        f"Checking readmission model path: "
        f"{READMISSION_MODEL_PATH}",
        flush=True
    )

    if not os.path.exists(READMISSION_MODEL_PATH):

        readmission_model_error = (
            f"Model file not found: {READMISSION_MODEL_PATH}"
        )

        print(
            f"❌ {readmission_model_error}",
            flush=True
        )

    else:

        readmission_model = joblib.load(
            READMISSION_MODEL_PATH
        )

        print(
            "✅ Readmission model loaded successfully",
            flush=True
        )

except Exception as error:

    readmission_model = None

    readmission_model_error = str(error)

    print(
        f"❌ Error loading readmission model: "
        f"{readmission_model_error}",
        flush=True
    )


# ==================================================
# Request Models
# ==================================================

class RiskRequest(BaseModel):
    age: float
    blood_pressure: float
    blood_sugar: float
    heart_rate: float
    previous_hospitalizations: int = 0
    chronic_disease_count: int = 0


class ReadmissionRequest(BaseModel):
    age: int = Field(..., ge=0, le=120)
    previous_admissions: int = Field(..., ge=0)
    length_of_stay: int = Field(..., ge=0)
    chronic_conditions: int = Field(..., ge=0)


# ==================================================
# Convert Age to Dataset Category
# ==================================================

def convert_age_to_category(age: int) -> str:

    if age < 10:
        return "[0-10)"

    elif age < 20:
        return "[10-20)"

    elif age < 30:
        return "[20-30)"

    elif age < 40:
        return "[30-40)"

    elif age < 50:
        return "[40-50)"

    elif age < 60:
        return "[50-60)"

    elif age < 70:
        return "[60-70)"

    elif age < 80:
        return "[70-80)"

    elif age < 90:
        return "[80-90)"

    else:
        return "[90-100)"


# ==================================================
# Root Route
# ==================================================

@app.get("/")
def root():

    return {
        "success": True,
        "service": "Final Healthcare AI Service",
        "status": "running"
    }


# ==================================================
# Health Route
# ==================================================

@app.get("/health")
def health():

    return {
        "success": True,
        "status": "healthy",
        "readmission_model_loaded": (
            readmission_model is not None
        ),
        "readmission_model_path": READMISSION_MODEL_PATH,
        "readmission_model_error": readmission_model_error
    }


# ==================================================
# Risk Prediction Endpoint
# ==================================================

@app.post("/predict-risk")
def predict_risk_endpoint(request: RiskRequest):

    try:

        result = predict_risk(
            age=request.age,
            blood_pressure=request.blood_pressure,
            blood_sugar=request.blood_sugar,
            heart_rate=request.heart_rate,
            previous_hospitalizations=(
                request.previous_hospitalizations
            ),
            chronic_disease_count=(
                request.chronic_disease_count
            )
        )

        return {
            "success": True,
            "model": "Logistic Regression",
            "prediction_result": result
        }

    except Exception as error:

        print(
            f"❌ Risk prediction error: {error}",
            flush=True
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ==================================================
# Readmission Prediction Endpoint
# ==================================================

@app.post("/predict-readmission")
def predict_readmission(request: ReadmissionRequest):

    # Check whether model is loaded

    if readmission_model is None:

        raise HTTPException(
            status_code=500,
            detail=(
                "Readmission model is not loaded. "
                f"Reason: {readmission_model_error}"
            )
        )

    try:

        # ------------------------------------------
        # Convert age
        # ------------------------------------------

        age_category = convert_age_to_category(
            request.age
        )

        # ------------------------------------------
        # Prepare model input
        # ------------------------------------------

        input_data = {

            "race": "Caucasian",

            "gender": "Female",

            "age": age_category,

            "admission_type_id": 1,

            "discharge_disposition_id": 1,

            "admission_source_id": 1,

            "time_in_hospital": request.length_of_stay,

            "num_lab_procedures": 40,

            "num_procedures": 1,

            "num_medications": 10,

            "number_outpatient": 0,

            "number_emergency": 0,

            "number_inpatient": request.previous_admissions,

            "number_diagnoses": request.chronic_conditions,

            "max_glu_serum": "None",

            "A1Cresult": "None",

            "metformin": "No",

            "repaglinide": "No",

            "nateglinide": "No",

            "chlorpropamide": "No",

            "glimepiride": "No",

            "acetohexamide": "No",

            "glipizide": "No",

            "glyburide": "No",

            "tolbutamide": "No",

            "pioglitazone": "No",

            "rosiglitazone": "No",

            "acarbose": "No",

            "miglitol": "No",

            "troglitazone": "No",

            "tolazamide": "No",

            "examide": "No",

            "citoglipton": "No",

            "glyburide-metformin": "No",

            "glipizide-metformin": "No",

            "glimepiride-pioglitazone": "No",

            "metformin-rosiglitazone": "No",

            "metformin-pioglitazone": "No",

            "insulin": "No",

            "change": "No",

            "diabetesMed": "No"
        }

        input_df = pd.DataFrame([input_data])

        print(
            "Readmission input data:",
            input_data,
            flush=True
        )

        # ------------------------------------------
        # Model prediction
        # ------------------------------------------

        prediction = int(
            readmission_model.predict(input_df)[0]
        )

        # ------------------------------------------
        # Prediction probability
        # ------------------------------------------

        probability = float(prediction)

        if hasattr(readmission_model, "predict_proba"):

            probabilities = readmission_model.predict_proba(
                input_df
            )[0]

            classes = getattr(
                readmission_model,
                "classes_",
                None
            )

            if classes is not None and 1 in classes:

                class_index = list(classes).index(1)

                probability = float(
                    probabilities[class_index]
                )

            elif len(probabilities) > 1:

                probability = float(
                    probabilities[1]
                )

            else:

                probability = float(
                    probabilities[0]
                )

        # ------------------------------------------
        # Risk score
        # ------------------------------------------

        risk_score = round(
            probability * 100,
            2
        )

        # ------------------------------------------
        # Risk level
        # ------------------------------------------

        if risk_score >= 70:

            risk_level = "High"

        elif risk_score >= 40:

            risk_level = "Medium"

        else:

            risk_level = "Low"

        # ------------------------------------------
        # Recommendation
        # ------------------------------------------

        if risk_level == "High":

            recommendation = (
                "Patient may require closer monitoring "
                "and follow-up after discharge."
            )

        elif risk_level == "Medium":

            recommendation = (
                "Patient may benefit from additional "
                "monitoring and scheduled follow-up."
            )

        else:

            recommendation = (
                "Continue routine clinical monitoring "
                "and standard follow-up."
            )

        # ------------------------------------------
        # Response
        # ------------------------------------------

        return {

            "success": True,

            "model": (
                "Logistic Regression trained on "
                "Diabetes 130-US Hospitals dataset"
            ),

            "prediction_result": {

                "readmission_prediction": prediction,

                "readmission_probability": risk_score,

                "risk_score": risk_score,

                "risk_level": risk_level,

                "recommendation": recommendation

            }

        }

    except Exception as error:

        print(
            f"❌ Readmission prediction error: {error}",
            flush=True
        )

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )