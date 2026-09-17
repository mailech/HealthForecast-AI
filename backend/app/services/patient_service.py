from app.models.patient import Patient, MedicalHistory, Admission, Treatment, Gender
from app import db
from datetime import datetime
import uuid

class PatientService:
    """Service for patient management operations"""
    
    @staticmethod
    def create_patient(data):
        """Create a new patient"""
        # Generate unique patient ID
        patient_id = f"PTN{uuid.uuid4().hex[:10].upper()}"
        
        patient = Patient(
            patient_id=patient_id,
            first_name=data['first_name'],
            last_name=data['last_name'],
            date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date(),
            gender=Gender(data['gender']),
            phone=data.get('phone'),
            email=data.get('email'),
            address=data.get('address'),
            emergency_contact=data.get('emergency_contact'),
            insurance_info=data.get('insurance_info'),
            social_security_number=data.get('social_security_number'),
            smoking_status=data.get('smoking_status'),
            alcohol_consumption=data.get('alcohol_consumption'),
            exercise_frequency=data.get('exercise_frequency')
        )
        
        db.session.add(patient)
        db.session.commit()
        
        return patient
    
    @staticmethod
    def get_patient(patient_id):
        """Get patient by ID"""
        return Patient.query.get(patient_id)
    
    @staticmethod
    def get_patient_by_patient_id(patient_id):
        """Get patient by patient_id string"""
        return Patient.query.filter_by(patient_id=patient_id).first()
    
    @staticmethod
    def get_all_patients(page=1, per_page=20, search=None):
        """Get all patients with pagination and search"""
        query = Patient.query
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Patient.first_name.ilike(search_term)) |
                (Patient.last_name.ilike(search_term)) |
                (Patient.patient_id.ilike(search_term))
            )
        
        return query.order_by(Patient.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
    
    @staticmethod
    def update_patient(patient_id, data):
        """Update patient information"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        # Update fields
        if 'first_name' in data:
            patient.first_name = data['first_name']
        if 'last_name' in data:
            patient.last_name = data['last_name']
        if 'date_of_birth' in data:
            patient.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        if 'gender' in data:
            patient.gender = Gender(data['gender'])
        if 'phone' in data:
            patient.phone = data['phone']
        if 'email' in data:
            patient.email = data['email']
        if 'address' in data:
            patient.address = data['address']
        if 'emergency_contact' in data:
            patient.emergency_contact = data['emergency_contact']
        if 'insurance_info' in data:
            patient.insurance_info = data['insurance_info']
        if 'social_security_number' in data:
            patient.social_security_number = data['social_security_number']
        if 'smoking_status' in data:
            patient.smoking_status = data['smoking_status']
        if 'alcohol_consumption' in data:
            patient.alcohol_consumption = data['alcohol_consumption']
        if 'exercise_frequency' in data:
            patient.exercise_frequency = data['exercise_frequency']
        if 'is_active' in data:
            patient.is_active = data['is_active']
        
        patient.updated_at = datetime.utcnow()
        db.session.commit()
        
        return patient
    
    @staticmethod
    def delete_patient(patient_id):
        """Delete a patient"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        db.session.delete(patient)
        db.session.commit()
        
        return True
    
    @staticmethod
    def add_medical_history(patient_id, data):
        """Add medical history entry"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        medical_history = MedicalHistory(
            patient_id=patient_id,
            condition=data['condition'],
            diagnosis_date=datetime.strptime(data['diagnosis_date'], '%Y-%m-%d').date() if data.get('diagnosis_date') else None,
            status=data.get('status'),
            severity=data.get('severity'),
            notes=data.get('notes')
        )
        
        db.session.add(medical_history)
        db.session.commit()
        
        return medical_history
    
    @staticmethod
    def get_medical_history(patient_id):
        """Get patient medical history"""
        return MedicalHistory.query.filter_by(patient_id=patient_id).order_by(
            MedicalHistory.diagnosis_date.desc()
        ).all()
    
    @staticmethod
    def add_admission(patient_id, data):
        """Add hospital admission"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        admission_id = f"ADM{uuid.uuid4().hex[:10].upper()}"
        
        admission = Admission(
            patient_id=patient_id,
            admission_id=admission_id,
            admission_date=datetime.strptime(data['admission_date'], '%Y-%m-%d %H:%M:%S'),
            admission_type=data.get('admission_type'),
            department=data.get('department'),
            room_number=data.get('room_number'),
            attending_physician=data.get('attending_physician'),
            primary_diagnosis=data.get('primary_diagnosis'),
            secondary_diagnoses=data.get('secondary_diagnoses'),
            procedures=data.get('procedures'),
            status=data.get('status')
        )
        
        db.session.add(admission)
        db.session.commit()
        
        return admission
    
    @staticmethod
    def get_admissions(patient_id):
        """Get patient admissions"""
        return Admission.query.filter_by(patient_id=patient_id).order_by(
            Admission.admission_date.desc()
        ).all()
    
    @staticmethod
    def add_treatment(patient_id, data):
        """Add treatment record"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        treatment = Treatment(
            patient_id=patient_id,
            admission_id=data.get('admission_id'),
            treatment_name=data['treatment_name'],
            treatment_type=data.get('treatment_type'),
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d %H:%M:%S'),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d %H:%M:%S') if data.get('end_date') else None,
            medication=data.get('medication'),
            dosage=data.get('dosage'),
            frequency=data.get('frequency'),
            prescribing_physician=data.get('prescribing_physician'),
            notes=data.get('notes'),
            outcome=data.get('outcome')
        )
        
        db.session.add(treatment)
        db.session.commit()
        
        return treatment
    
    @staticmethod
    def get_treatments(patient_id):
        """Get patient treatments"""
        return Treatment.query.filter_by(patient_id=patient_id).order_by(
            Treatment.start_date.desc()
        ).all()
