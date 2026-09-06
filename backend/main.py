from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from schemas import (
    PatientData,
    PredictionResponse,
    HealthResponse,
    ModelInfoResponse
)

from model_service import model_service

from database import (
    save_prediction,
    get_history,
    get_stats,
    clear_history
)


# ---------------------------------------------------------
# FastAPI Application
# ---------------------------------------------------------

app = FastAPI(
    title="HealthForecast AI API",
    description=(
        "Hospital readmission prediction API using "
        "Machine Learning and FastAPI."
    ),
    version="1.0.0"
)


# ---------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Root Endpoint
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "service": "HealthForecast AI",
        "status": "running",
        "message": "Hospital Readmission Prediction API",
        "docs": "/docs"
    }


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------

@app.get(
    "/health",
    response_model=HealthResponse
)
def health_check():

    return {
        "status": "healthy",
        "model_loaded": model_service.is_ready(),
        "service": "HealthForecast AI"
    }


# ---------------------------------------------------------
# Prediction Endpoint
# ---------------------------------------------------------

@app.post(
    "/predict",
    response_model=PredictionResponse
)
def predict(patient: PatientData):

    if not model_service.is_ready():

        raise HTTPException(
            status_code=503,
            detail=(
                "ML model is not loaded. "
                "Please train the model first."
            )
        )

    try:

        patient_data = patient.model_dump()

        result = model_service.predict(
            patient_data
        )

        save_prediction(
            patient_data,
            result
        )

        return result

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )


# ---------------------------------------------------------
# Prediction History
# ---------------------------------------------------------

@app.get("/history")
def prediction_history(
    limit: int = Query(
        default=20,
        ge=1,
        le=100
    )
):

    try:

        history = get_history(limit)

        return {
            "count": len(history),
            "records": history
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch history: {str(error)}"
        )


# ---------------------------------------------------------
# Dashboard Statistics
# ---------------------------------------------------------

@app.get("/stats")
def statistics():

    try:

        return get_stats()

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch statistics: {str(error)}"
        )


# ---------------------------------------------------------
# Model Information
# ---------------------------------------------------------

@app.get(
    "/model-info",
    response_model=ModelInfoResponse
)
def model_information():

    try:

        return model_service.get_model_info()

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch model information: {str(error)}"
        )


# ---------------------------------------------------------
# Batch Prediction
# ---------------------------------------------------------

@app.post("/batch-predict")
def batch_predict(
    patients: List[PatientData]
):

    if not model_service.is_ready():

        raise HTTPException(
            status_code=503,
            detail="ML model is not loaded."
        )

    if len(patients) > 100:

        raise HTTPException(
            status_code=400,
            detail="Maximum 100 patients allowed per request."
        )

    results = []

    try:

        for patient in patients:

            patient_data = patient.model_dump()

            result = model_service.predict(
                patient_data
            )

            save_prediction(
                patient_data,
                result
            )

            results.append(result)

        return {
            "count": len(results),
            "results": results
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Batch prediction failed: {str(error)}"
        )


# ---------------------------------------------------------
# Clear Prediction History
# ---------------------------------------------------------

@app.delete("/history")
def delete_history():

    try:

        clear_history()

        return {
            "status": "success",
            "message": "Prediction history cleared."
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to clear history: {str(error)}"
      )
