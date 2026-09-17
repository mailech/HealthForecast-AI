"""
Database initialization script for HealthForecast AI
Run this script to create the database tables and seed initial data
"""
import os
import sys
from datetime import datetime

# Add the parent directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User, UserRole
from app.models.patient import Patient, Gender
from config import get_config

def init_database():
    """Initialize the database with tables and seed data"""
    app = create_app(get_config('development'))
    
    with app.app_context():
        # Create all tables
        print("Creating database tables...")
        db.create_all()
        print("Database tables created successfully.")
        
        # Seed initial data
        seed_data()
        
        print("\nDatabase initialization completed successfully!")

def seed_data():
    """Seed initial data for testing"""
    print("\nSeeding initial data...")
    
    # Check if admin user already exists
    admin_user = User.query.filter_by(username='admin').first()
    if not admin_user:
        print("Creating admin user...")
        admin_user = User(
            email='admin@healthforecast.ai',
            username='admin',
            first_name='System',
            last_name='Administrator',
            role=UserRole.SYSTEM_ADMINISTRATOR,
            is_active=True,
            is_verified=True
        )
        admin_user.set_password('admin123')  # Change this in production!
        db.session.add(admin_user)
        print("Admin user created: username=admin, password=admin123")
    else:
        print("Admin user already exists.")
    
    # Create test doctor
    doctor_user = User.query.filter_by(username='doctor').first()
    if not doctor_user:
        print("Creating test doctor...")
        doctor_user = User(
            email='doctor@healthforecast.ai',
            username='doctor',
            first_name='John',
            last_name='Smith',
            role=UserRole.DOCTOR,
            is_active=True,
            is_verified=True
        )
        doctor_user.set_password('doctor123')
        db.session.add(doctor_user)
        print("Test doctor created: username=doctor, password=doctor123")
    else:
        print("Test doctor already exists.")
    
    # Create test hospital administrator
    admin_user_hospital = User.query.filter_by(username='hospital_admin').first()
    if not admin_user_hospital:
        print("Creating test hospital administrator...")
        admin_user_hospital = User(
            email='hospital_admin@healthforecast.ai',
            username='hospital_admin',
            first_name='Jane',
            last_name='Doe',
            role=UserRole.HOSPITAL_ADMINISTRATOR,
            is_active=True,
            is_verified=True
        )
        admin_user_hospital.set_password('hospital123')
        db.session.add(admin_user_hospital)
        print("Test hospital administrator created: username=hospital_admin, password=hospital123")
    else:
        print("Test hospital administrator already exists.")
    
    # Create test healthcare researcher
    researcher_user = User.query.filter_by(username='researcher').first()
    if not researcher_user:
        print("Creating test healthcare researcher...")
        researcher_user = User(
            email='researcher@healthforecast.ai',
            username='researcher',
            first_name='Robert',
            last_name='Johnson',
            role=UserRole.HEALTHCARE_RESEARCHER,
            is_active=True,
            is_verified=True
        )
        researcher_user.set_password('researcher123')
        db.session.add(researcher_user)
        print("Test healthcare researcher created: username=researcher, password=researcher123")
    else:
        print("Test healthcare researcher already exists.")
    
    # Create test patient
    test_patient = Patient.query.filter_by(patient_id='PTNTEST12345').first()
    if not test_patient:
        print("Creating test patient...")
        test_patient = Patient(
            patient_id='PTNTEST12345',
            first_name='Test',
            last_name='Patient',
            date_of_birth=datetime(1980, 1, 1).date(),
            gender=Gender.MALE,
            phone='555-1234',
            email='test.patient@example.com',
            address='123 Test Street, Test City, TC 12345',
            smoking_status='former',
            alcohol_consumption='none',
            exercise_frequency='regular',
            is_active=True
        )
        db.session.add(test_patient)
        print("Test patient created: patient_id=PTNTEST12345")
        
        # Assign test patient to test doctor
        if doctor_user:
            doctor_user.assigned_patients.append(test_patient)
            print("Test patient assigned to test doctor.")
    else:
        print("Test patient already exists.")
    
    db.session.commit()
    print("\nInitial data seeded successfully!")

if __name__ == '__main__':
    init_database()
