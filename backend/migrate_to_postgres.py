import os
import json
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from app.models.models import UserDB, PatientDB
from app.database.database import Base, SQLALCHEMY_DATABASE_URL
from app.auth.auth import get_password_hash

def migrate():
    print(f"Connecting to {SQLALCHEMY_DATABASE_URL}...")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # Wait for DB to be ready
    retries = 5
    while retries > 0:
        try:
            engine.connect()
            break
        except Exception as e:
            print("Database not ready, waiting...", e)
            time.sleep(2)
            retries -= 1
            
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Determine the absolute path of db_backup.json relative to this script
        base_dir = os.path.dirname(os.path.abspath(__file__))
        backup_file_path = os.path.join(base_dir, "db_backup.json")
        
        if os.path.exists(backup_file_path):
            print(f"Loading backup data from {backup_file_path}...")
            with open(backup_file_path, "r") as f:
                backup = json.load(f)
                
            users = backup.get("users", [])
            print(f"Migrating {len(users)} users from backup...")
            for user_data in users:
                user_data.pop("id", None)
                existing_user = db.query(UserDB).filter(UserDB.email == user_data["email"]).first()
                if not existing_user:
                    if isinstance(user_data.get("created_at"), str):
                        user_data["created_at"] = datetime.fromisoformat(user_data["created_at"])
                    user = UserDB(**user_data)
                    db.add(user)
                    print(f"  Added user: {user_data['email']}")
                else:
                    print(f"  User {user_data['email']} already exists. Skipping.")
                
            patients = backup.get("patients", [])
            print(f"Migrating {len(patients)} patients from backup...")
            for pat_data in patients:
                pat_data.pop("id", None)
                existing_patient = db.query(PatientDB).filter(PatientDB.patient_code == pat_data["patient_code"]).first()
                if not existing_patient:
                    if isinstance(pat_data.get("last_assessed"), str):
                        pat_data["last_assessed"] = datetime.fromisoformat(pat_data["last_assessed"])
                    patient = PatientDB(**pat_data)
                    db.add(patient)
                    print(f"  Added patient: {pat_data['patient_code']}")
                else:
                    print(f"  Patient {pat_data['patient_code']} already exists. Skipping.")
        else:
            print(f"Backup file not found at {backup_file_path}. Skipping backup migration.")

        # System Administrator provisioning
        admin_email = os.environ.get("ADMIN_EMAIL")
        admin_password = os.environ.get("ADMIN_PASSWORD")
        admin_name = os.environ.get("ADMIN_FULL_NAME")
        
        if not admin_email:
            raise ValueError("ADMIN_EMAIL environment variable is missing. Cannot provision or verify System Administrator.")
            
        existing_admin = db.query(UserDB).filter(UserDB.email == admin_email).first()
        if not existing_admin:
            if not admin_password:
                raise ValueError("ADMIN_PASSWORD environment variable is missing. Required for initial System Administrator creation.")
            if not admin_name:
                raise ValueError("ADMIN_FULL_NAME environment variable is missing.")
                
            hashed = get_password_hash(admin_password)
            admin_user = UserDB(
                full_name=admin_name,
                email=admin_email,
                hashed_password=hashed,
                role="System Administrator",
                hospital_name="System"
            )
            db.add(admin_user)
            print(f"Added default System Administrator: {admin_email}")
        else:
            print(f"System Administrator {admin_email} already exists. Skipping.")

        db.commit()
        print("Migration transaction committed successfully!")
        
    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
