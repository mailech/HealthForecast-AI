from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import Base, engine, SessionLocal
from app.ml.model_service import model_service

@asynccontextmanager
async def lifespan(app):
    Base.metadata.create_all(bind=engine)
    # Seed the four required accounts. Dataset import and model training are
    # performed directly in this process so Windows/Python 3.14 path issues
    # do not occur.
    try:
        from app.core.security import hash_password
        from app.models import User, Patient
        from app.scripts_helpers import import_dataset_if_needed
        accounts = [
            ("System Administrator", "systemadmin@gmail.com", "SystemAdmin@123", "system_administrator"),
            ("Hospital Administrator", "hospitaladministration@gmail.com", "HospitalAdmin@123", "hospital_administrator"),
            ("Doctor", "doctor@gmail.com", "Doctor@123", "doctor"),
            ("Healthcare Researcher", "hospitalresearcher@gmail.com", "Researcher@123", "healthcare_researcher"),
        ]
        db = SessionLocal()
        try:
            for name, email, password, role in accounts:
                u = db.query(User).filter(User.email == email).first()
                if not u:
                    u = User(full_name=name, email=email, password_hash=hash_password(password), role=role, hospital="Demo Hospital", is_active=True)
                    db.add(u)
                else:
                    u.full_name=name; u.password_hash=hash_password(password); u.role=role; u.hospital="Demo Hospital"; u.is_active=True
            db.commit()
        finally:
            db.close()
        import_dataset_if_needed()
    except Exception as exc:
        print(f"Initialization warning: {exc}")
    model_service.load_or_train()
    try:
        from app.services.prediction_population import ensure_dataset_predictions
        db = SessionLocal()
        try:
            count = ensure_dataset_predictions(db)
            print(f"Dataset predictions ready: {count} patient predictions")
        finally:
            db.close()
    except Exception as exc:
        print(f"Prediction initialization warning: {exc}")
    yield

app=FastAPI(title="HealthForecast AI API", version="2.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.routes import auth, patients, predictions, treatments, analytics, users, model, reports, admin
for r in [auth, patients, predictions, treatments, analytics, users, model, reports, admin]:
    app.include_router(r.router, prefix="/api/v1")

@app.get("/health")
def health():
    return {"status":"ok", "service":"healthforecast-backend", "model_ready": model_service.model is not None}
