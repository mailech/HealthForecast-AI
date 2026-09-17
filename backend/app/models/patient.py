from datetime import datetime
from app import db
import enum

class Gender(enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class AdmissionStatus(enum.Enum):
    ADMITTED = "admitted"
    DISCHARGED = "discharged"
    TRANSFERRED = "transferred"
    DECEASED = "deceased"

class Patient(db.Model):
    """Patient model for storing patient information"""
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date, nullable=False)
    gender = db.Column(db.Enum(Gender), nullable=False)
    phone = db.Column(db.String(20))
    email = db.Column(db.String(255))
    address = db.Column(db.Text)
    emergency_contact = db.Column(db.JSON)
    insurance_info = db.Column(db.JSON)
    social_security_number = db.Column(db.String(11))  # Encrypted in production
    
    # Lifestyle data
    smoking_status = db.Column(db.String(50))
    alcohol_consumption = db.Column(db.String(50))
    exercise_frequency = db.Column(db.String(50))
    
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    medical_history = db.relationship('MedicalHistory', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    admissions = db.relationship('Admission', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    treatments = db.relationship('Treatment', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    risk_predictions = db.relationship('RiskPrediction', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    readmission_predictions = db.relationship('ReadmissionPrediction', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    treatment_outcomes = db.relationship('TreatmentOutcome', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    care_recommendations = db.relationship('CareRecommendation', backref='patient', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_sensitive=False):
        """Convert patient to dictionary"""
        data = {
            'id': self.id,
            'patient_id': self.patient_id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender.value,
            'phone': self.phone,
            'email': self.email,
            'address': self.address,
            'emergency_contact': self.emergency_contact,
            'insurance_info': self.insurance_info,
            'smoking_status': self.smoking_status,
            'alcohol_consumption': self.alcohol_consumption,
            'exercise_frequency': self.exercise_frequency,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
        
        if include_sensitive:
            data['social_security_number'] = self.social_security_number
        
        return data
    
    def __repr__(self):
        return f'<Patient {self.patient_id}>'

# Association table for patient-doctor assignments
patient_assignments = db.Table('patient_assignments',
    db.Column('patient_id', db.Integer, db.ForeignKey('patients.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('assigned_at', db.DateTime, default=datetime.utcnow)
)

class MedicalHistory(db.Model):
    """Medical history model"""
    __tablename__ = 'medical_history'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    condition = db.Column(db.String(255), nullable=False)
    diagnosis_date = db.Column(db.Date)
    status = db.Column(db.String(50))  # active, resolved, chronic
    severity = db.Column(db.String(50))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'condition': self.condition,
            'diagnosis_date': self.diagnosis_date.isoformat() if self.diagnosis_date else None,
            'status': self.status,
            'severity': self.severity,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }

class Admission(db.Model):
    """Hospital admission model"""
    __tablename__ = 'admissions'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    admission_id = db.Column(db.String(50), unique=True, nullable=False)
    admission_date = db.Column(db.DateTime, nullable=False)
    discharge_date = db.Column(db.DateTime)
    admission_type = db.Column(db.String(50))  # emergency, elective, transfer
    department = db.Column(db.String(100))
    room_number = db.Column(db.String(20))
    attending_physician = db.Column(db.String(100))
    primary_diagnosis = db.Column(db.String(255))
    secondary_diagnoses = db.Column(db.JSON)
    procedures = db.Column(db.JSON)
    status = db.Column(db.Enum(AdmissionStatus), default=AdmissionStatus.ADMITTED)
    discharge_reason = db.Column(db.String(100))
    length_of_stay = db.Column(db.Integer)  # in days
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'admission_id': self.admission_id,
            'admission_date': self.admission_date.isoformat(),
            'discharge_date': self.discharge_date.isoformat() if self.discharge_date else None,
            'admission_type': self.admission_type,
            'department': self.department,
            'room_number': self.room_number,
            'attending_physician': self.attending_physician,
            'primary_diagnosis': self.primary_diagnosis,
            'secondary_diagnoses': self.secondary_diagnoses,
            'procedures': self.procedures,
            'status': self.status.value,
            'discharge_reason': self.discharge_reason,
            'length_of_stay': self.length_of_stay,
            'created_at': self.created_at.isoformat()
        }

class Treatment(db.Model):
    """Treatment model"""
    __tablename__ = 'treatments'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    admission_id = db.Column(db.Integer, db.ForeignKey('admissions.id'))
    treatment_name = db.Column(db.String(255), nullable=False)
    treatment_type = db.Column(db.String(100))
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime)
    medication = db.Column(db.JSON)
    dosage = db.Column(db.String(100))
    frequency = db.Column(db.String(100))
    prescribing_physician = db.Column(db.String(100))
    notes = db.Column(db.Text)
    outcome = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'admission_id': self.admission_id,
            'treatment_name': self.treatment_name,
            'treatment_type': self.treatment_type,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'medication': self.medication,
            'dosage': self.dosage,
            'frequency': self.frequency,
            'prescribing_physician': self.prescribing_physician,
            'notes': self.notes,
            'outcome': self.outcome,
            'created_at': self.created_at.isoformat()
        }
