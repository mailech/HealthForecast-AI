from fastapi import FastAPI
from auth import router as auth_router
from patients import router as patients_router

app = FastAPI(
    title="HealthForecast API",
    description="Hospital Readmission Preiction & patient Risk Intelligence API",
    version="1.0.0"
)

app.include_router(auth_router)
app.include_router(patients_router)

@app.get("/")
def home():
    return {
        "status":"online",
        "message":"Welcome to HealthForecast AI API System!"
    }

@app.get("/api/v1/health-check")
def health_check():
    return{"status":"Healthy", "database":"connected (Mock)"}

