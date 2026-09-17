from datetime import datetime
from app import db
import enum

class OutcomeStatus(enum.Enum):
    SUCCESSFUL = "successful"
    PARTIAL = "partial"
    UNSUCCESSFUL = "unsuccessful"
    UNKNOWN = "unknown"

class TreatmentOutcome(db.Model):
    """Treatment outcome evaluation model"""
    __tablename__ = 'treatment_outcomes'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    treatment_id = db.Column(db.Integer, db.ForeignKey('treatments.id'))
    admission_id = db.Column(db.Integer, db.ForeignKey('admissions.id'))
    
    evaluation_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    treatment_type = db.Column(db.String(100))
    outcome_status = db.Column(db.Enum(OutcomeStatus), nullable=False)
    
    # Outcome metrics
    effectiveness_score = db.Column(db.Float)  # 0-100
    recovery_rate = db.Column(db.Float)
    symptom_improvement = db.Column(db.Float)
    quality_of_life_change = db.Column(db.Float)
    
    # Time metrics
    time_to_improvement = db.Column(db.Integer)  # days
    time_to_recovery = db.Column(db.Integer)  # days
    
    # Comparison data
    expected_outcome = db.Column(db.String(100))
    outcome_comparison = db.Column(db.String(20))  # better, as_expected, worse
    
    # Additional data
    complications = db.Column(db.JSON)
    side_effects = db.Column(db.JSON)
    patient_satisfaction = db.Column(db.Integer)  # 1-5
    notes = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'treatment_id': self.treatment_id,
            'admission_id': self.admission_id,
            'evaluation_date': self.evaluation_date.isoformat(),
            'treatment_type': self.treatment_type,
            'outcome_status': self.outcome_status.value,
            'effectiveness_score': self.effectiveness_score,
            'recovery_rate': self.recovery_rate,
            'symptom_improvement': self.symptom_improvement,
            'quality_of_life_change': self.quality_of_life_change,
            'time_to_improvement': self.time_to_improvement,
            'time_to_recovery': self.time_to_recovery,
            'expected_outcome': self.expected_outcome,
            'outcome_comparison': self.outcome_comparison,
            'complications': self.complications,
            'side_effects': self.side_effects,
            'patient_satisfaction': self.patient_satisfaction,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }

class MedicationEffectiveness(db.Model):
    """Medication effectiveness tracking model"""
    __tablename__ = 'medication_effectiveness'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    treatment_id = db.Column(db.Integer, db.ForeignKey('treatments.id'))
    
    medication_name = db.Column(db.String(255), nullable=False)
    medication_type = db.Column(db.String(100))
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime)
    
    # Effectiveness metrics
    effectiveness_score = db.Column(db.Float)  # 0-100
    adherence_rate = db.Column(db.Float)  # 0-100
    response_rate = db.Column(db.Float)
    
    # Clinical metrics
    symptom_relief = db.Column(db.Float)
    biomarker_improvement = db.Column(db.JSON)
    vital_signs_change = db.Column(db.JSON)
    
    # Safety metrics
    side_effects = db.Column(db.JSON)
    adverse_events = db.Column(db.JSON)
    drug_interactions = db.Column(db.JSON)
    
    # Comparison
    alternative_medications = db.Column(db.JSON)
    comparative_effectiveness = db.Column(db.JSON)
    
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'treatment_id': self.treatment_id,
            'medication_name': self.medication_name,
            'medication_type': self.medication_type,
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'effectiveness_score': self.effectiveness_score,
            'adherence_rate': self.adherence_rate,
            'response_rate': self.response_rate,
            'symptom_relief': self.symptom_relief,
            'biomarker_improvement': self.biomarker_improvement,
            'vital_signs_change': self.vital_signs_change,
            'side_effects': self.side_effects,
            'adverse_events': self.adverse_events,
            'drug_interactions': self.drug_interactions,
            'alternative_medications': self.alternative_medications,
            'comparative_effectiveness': self.comparative_effectiveness,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }
