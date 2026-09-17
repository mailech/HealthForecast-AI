from datetime import datetime
from app import db
import enum

class RecommendationPriority(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class RecommendationStatus(enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DISMISSED = "dismissed"

class CareRecommendation(db.Model):
    """Clinical decision support recommendations"""
    __tablename__ = 'care_recommendations'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    admission_id = db.Column(db.Integer, db.ForeignKey('admissions.id'))
    
    recommendation_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    recommendation_type = db.Column(db.String(100))  # follow_up, medication, lifestyle, monitoring
    priority = db.Column(db.Enum(RecommendationPriority), default=RecommendationPriority.MEDIUM)
    status = db.Column(db.Enum(RecommendationStatus), default=RecommendationStatus.PENDING)
    
    # Recommendation details
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    rationale = db.Column(db.Text)
    evidence = db.Column(db.JSON)
    
    # Action items
    action_items = db.Column(db.JSON)
    timeline = db.Column(db.String(100))
    responsible_party = db.Column(db.String(100))
    
    # Risk mitigation
    risk_mitigation = db.Column(db.JSON)
    discharge_support = db.Column(db.JSON)
    
    # Outcome tracking
    outcome = db.Column(db.String(100))
    effectiveness = db.Column(db.Float)
    notes = db.Column(db.Text)
    
    # AI-generated
    ai_generated = db.Column(db.Boolean, default=True)
    confidence_score = db.Column(db.Float)
    model_version = db.Column(db.String(50))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'admission_id': self.admission_id,
            'recommendation_date': self.recommendation_date.isoformat(),
            'recommendation_type': self.recommendation_type,
            'priority': self.priority.value,
            'status': self.status.value,
            'title': self.title,
            'description': self.description,
            'rationale': self.rationale,
            'evidence': self.evidence,
            'action_items': self.action_items,
            'timeline': self.timeline,
            'responsible_party': self.responsible_party,
            'risk_mitigation': self.risk_mitigation,
            'discharge_support': self.discharge_support,
            'outcome': self.outcome,
            'effectiveness': self.effectiveness,
            'notes': self.notes,
            'ai_generated': self.ai_generated,
            'confidence_score': self.confidence_score,
            'model_version': self.model_version,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class FollowUpPlan(db.Model):
    """Follow-up planning for patient care"""
    __tablename__ = 'follow_up_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    admission_id = db.Column(db.Integer, db.ForeignKey('admissions.id'))
    
    plan_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    plan_type = db.Column(db.String(100))  # post_discharge, ongoing, specialist
    
    # Schedule
    follow_up_date = db.Column(db.DateTime)
    follow_up_type = db.Column(db.String(100))  # in_person, telehealth, phone
    location = db.Column(db.String(255))
    department = db.Column(db.String(100))
    provider = db.Column(db.String(100))
    
    # Plan details
    objectives = db.Column(db.JSON)
    assessments = db.Column(db.JSON)
    medications_to_review = db.Column(db.JSON)
    vital_signs_to_monitor = db.Column(db.JSON)
    
    # Risk monitoring
    risk_factors_to_monitor = db.Column(db.JSON)
    warning_signs = db.Column(db.JSON)
    emergency_contacts = db.Column(db.JSON)
    
    # Patient instructions
    patient_instructions = db.Column(db.Text)
    self_care_instructions = db.Column(db.JSON)
    
    # Status
    status = db.Column(db.Enum(RecommendationStatus), default=RecommendationStatus.PENDING)
    completion_date = db.Column(db.DateTime)
    completion_notes = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'admission_id': self.admission_id,
            'plan_date': self.plan_date.isoformat(),
            'plan_type': self.plan_type,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'follow_up_type': self.follow_up_type,
            'location': self.location,
            'department': self.department,
            'provider': self.provider,
            'objectives': self.objectives,
            'assessments': self.assessments,
            'medications_to_review': self.medications_to_review,
            'vital_signs_to_monitor': self.vital_signs_to_monitor,
            'risk_factors_to_monitor': self.risk_factors_to_monitor,
            'warning_signs': self.warning_signs,
            'emergency_contacts': self.emergency_contacts,
            'patient_instructions': self.patient_instructions,
            'self_care_instructions': self.self_care_instructions,
            'status': self.status.value,
            'completion_date': self.completion_date.isoformat() if self.completion_date else None,
            'completion_notes': self.completion_notes,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
