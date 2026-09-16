import os
import sys
from datetime import datetime, timedelta

# Adjust path to import from app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import (
    users_collection,
    patients_collection,
    medical_histories_collection,
    predictions_collection,
    treatments_collection,
    init_db
)
from app.utils.security import get_password_hash
from app.ai.predictor import predictor_instance

def seed():
    print("Initializing Database connection and warming model...")
    init_db()
    predictor_instance.load_model()
    
    print("Seeding Users...")
    users = [
        {
            "email": "doctor@hospital.com",
            "full_name": "Dr. Sarah Connor",
            "role": "Doctor",
            "hospital": "General Hospital",
            "hashed_password": get_password_hash("Password123"),
            "created_at": datetime.utcnow(),
            "is_active": True,
            "must_change_password": False
        },
        {
            "email": "researcher@hospital.com",
            "full_name": "Dr. Miles Dyson",
            "role": "Researcher",
            "hospital": "Cyberdyne Lab",
            "hashed_password": get_password_hash("Password123"),
            "created_at": datetime.utcnow(),
            "is_active": True,
            "must_change_password": False
        },
        {
            "email": "admin@hospital.com",
            "full_name": "Admin Officer John Connor",
            "role": "Admin",
            "hospital": "General Hospital",
            "hashed_password": get_password_hash("Password123"),
            "created_at": datetime.utcnow(),
            "is_active": True,
            "must_change_password": False
        },
        {
            "email": "sysadmin@hospital.com",
            "full_name": "System Administrator",
            "role": "SysAdmin",
            "hospital": "IT Headquarters",
            "hashed_password": get_password_hash("Password123"),
            "created_at": datetime.utcnow(),
            "is_active": True,
            "must_change_password": False
        }
    ]
    for u in users:
        users_collection.update_one(
            {"email": u["email"]},
            {"$set": u},
            upsert=True
        )
    
    print("Database seeding updated with 4 standard roles successfully.")

if __name__ == "__main__":
    seed()
