"""
Initialize SQLite database with schema and seed data
"""
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Set environment variables inline
os.environ['DATABASE_URL'] = 'sqlite:///./healthforecast_ai.db'
os.environ['SECRET_KEY'] = 'dev-secret-key-change-in-production-12345'
os.environ['ALGORITHM'] = 'HS256'
os.environ['ACCESS_TOKEN_EXPIRE_MINUTES'] = '30'

from app.core.database import engine, Base, SessionLocal
from app.models import user, role, patient, medical_history, admission, treatment, audit_log
from app.core.security import get_password_hash
from datetime import datetime, date

def init_database():
    """Create all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")

def seed_data():
    """Insert seed data"""
    db = SessionLocal()
    try:
        print("Seeding data...")
        
        # Check if data already exists
        if db.query(role.Role).count() > 0:
            print("Data already seeded. Skipping...")
            return
        
        # Create Roles
        roles_data = [
            {'name': 'System Administrator', 'description': 'Full system access including user and role management'},
            {'name': 'Doctor', 'description': 'Access to patient records, medical history, and risk reports'},
            {'name': 'Hospital Administrator', 'description': 'Access to hospital dashboards, analytics, and reports'},
            {'name': 'Healthcare Researcher', 'description': 'Access to anonymized datasets and research reports'}
        ]
        
        for role_data in roles_data:
            role_obj = role.Role(**role_data)
            db.add(role_obj)
        
        db.commit()
        print("Roles created")
        
        # Get role IDs
        roles = db.query(role.Role).all()
        role_map = {r.name: r.id for r in roles}
        
        # Create Users
        password_hash = get_password_hash('Admin@123')
        users_data = [
            {
                'email': 'admin@healthforecast.ai',
                'username': 'admin',
                'hashed_password': password_hash,
                'full_name': 'System Administrator',
                'role_id': role_map['System Administrator'],
                'is_active': True
            },
            {
                'email': 'doctor@healthforecast.ai',
                'username': 'doctor',
                'hashed_password': password_hash,
                'full_name': 'Dr. Sarah Johnson',
                'role_id': role_map['Doctor'],
                'is_active': True
            },
            {
                'email': 'hospital_admin@healthforecast.ai',
                'username': 'hospital_admin',
                'hashed_password': password_hash,
                'full_name': 'Michael Chen',
                'role_id': role_map['Hospital Administrator'],
                'is_active': True
            },
            {
                'email': 'researcher@healthforecast.ai',
                'username': 'researcher',
                'hashed_password': password_hash,
                'full_name': 'Dr. Emily Davis',
                'role_id': role_map['Healthcare Researcher'],
                'is_active': True
            }
        ]
        
        for user_data in users_data:
            user_obj = user.User(**user_data)
            db.add(user_obj)
        
        db.commit()
        print("Users created")
        
        # Create Sample Patients
        patients_data = [
            {
                'patient_id': 'PAT001',
                'first_name': 'John',
                'last_name': 'Smith',
                'date_of_birth': date(1980, 5, 15),
                'gender': 'Male',
                'phone': '555-0101',
                'email': 'john.smith@email.com',
                'address': '123 Main St',
                'city': 'Springfield',
                'state': 'IL',
                'zip_code': '62701',
                'emergency_contact_name': 'Jane Smith',
                'emergency_contact_phone': '555-0102',
                'is_active': True
            },
            {
                'patient_id': 'PAT002',
                'first_name': 'Mary',
                'last_name': 'Johnson',
                'date_of_birth': date(1975, 8, 22),
                'gender': 'Female',
                'phone': '555-0201',
                'email': 'mary.johnson@email.com',
                'address': '456 Oak Ave',
                'city': 'Chicago',
                'state': 'IL',
                'zip_code': '60601',
                'emergency_contact_name': 'Robert Johnson',
                'emergency_contact_phone': '555-0202',
                'is_active': True
            }
        ]
        
        for patient_data in patients_data:
            patient_obj = patient.Patient(**patient_data)
            db.add(patient_obj)
        
        db.commit()
        print("Patients created")
        
        # Create Medical History
        patients = db.query(patient.Patient).all()
        for p in patients:
            history = medical_history.MedicalHistory(
                patient_id=p.id,
                condition='Type 2 Diabetes',
                diagnosis_date=datetime(2020, 1, 1),
                status='Active',
                notes='Managed with medication'
            )
            db.add(history)
        
        db.commit()
        print("Medical history created")
        
        # Create Admissions
        for p in patients:
            admission_obj = admission.Admission(
                patient_id=p.id,
                admission_number=f'ADM_{p.patient_id}',
                admission_date=date(2023, 1, 15),
                discharge_date=date(2023, 1, 20),
                admission_type='Emergency',
                department='Internal Medicine',
                room_number='301',
                attending_physician='Dr. Sarah Johnson',
                diagnosis='Diabetic complications',
                discharge_diagnosis='Resolved',
                length_of_stay=5,
                readmission_flag='No'
            )
            db.add(admission_obj)
        
        db.commit()
        print("Admissions created")
        
        print("Seed data completed successfully!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
    seed_data()
    print("\nDatabase initialization complete!")
    print("\nDefault credentials:")
    print("  admin@healthforecast.ai / Admin@123")
    print("  doctor@healthforecast.ai / Doctor@123")
