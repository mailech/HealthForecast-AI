"""Initialize database, seed users, import dataset, and train ML models."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.auth.security import get_password_hash
from app.database import Base, SessionLocal, engine
from app.ml.predictor import DataPreprocessor, ModelTrainer
from app.models.user import User, UserRole
from app.services.prediction_service import DatasetService


def seed_users(db):
    users = [
        ("doctor1", "doctor@healthforecast.com", "Dr. Sarah Johnson", UserRole.DOCTOR, "Cardiology", "doctor123"),
        ("admin1", "admin@healthforecast.com", "Hospital Admin", UserRole.HOSPITAL_ADMIN, "Administration", "admin123"),
        ("researcher1", "research@healthforecast.com", "Dr. Research Analyst", UserRole.RESEARCHER, "Research", "research123"),
        ("sysadmin", "sysadmin@healthforecast.com", "System Administrator", UserRole.SYSTEM_ADMIN, "IT", "sysadmin123"),
    ]
    for username, email, full_name, role, dept, password in users:
        if not db.query(User).filter(User.username == username).first():
            db.add(User(
                email=email,
                username=username,
                hashed_password=get_password_hash(password),
                full_name=full_name,
                role=role,
                department=dept,
            ))
    db.commit()
    print("[OK] Users seeded")


def assign_patients_to_doctor(db):
    doctor = db.query(User).filter(User.username == "doctor1").first()
    if doctor:
        from app.models.patient import Patient
        patients = db.query(Patient).limit(100).all()
        for p in patients:
            p.assigned_doctor_id = doctor.id
        db.commit()
        print(f"[OK] Assigned {len(patients)} patients to doctor1")


def main():
    print("Initializing HealthForecast AI...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        seed_users(db)

        dataset_path = Path(__file__).parent / "data" / "diabetic_data.csv"
        if dataset_path.exists():
            result = DatasetService.load_and_import(db, limit=500)
            print(f"[OK] Imported {result['imported']} patients from dataset")
            assign_patients_to_doctor(db)

            print("Training ML models (20k sample for faster startup)...")
            df = DataPreprocessor.load_dataset(str(dataset_path))
            if len(df) > 20000:
                df = df.sample(n=20000, random_state=42)
            trainer = ModelTrainer(model_dir=str(Path(__file__).parent / "models"))
            rf = trainer.train(df, "random_forest")
            xgb = trainer.train(df, "xgboost")
            print(f"[OK] Random Forest - Accuracy: {rf['accuracy']:.4f}, ROC-AUC: {rf['roc_auc']:.4f}")
            print(f"[OK] XGBoost - Accuracy: {xgb['accuracy']:.4f}, ROC-AUC: {xgb['roc_auc']:.4f}")
        else:
            print("[WARN] Dataset not found. Run download_dataset.py first.")

        print("\nDefault login credentials:")
        print("  Doctor:     doctor1 / doctor123")
        print("  Admin:      admin1 / admin123")
        print("  Researcher: researcher1 / research123")
        print("  Sys Admin:  sysadmin / sysadmin123")
    finally:
        db.close()


if __name__ == "__main__":
    main()
