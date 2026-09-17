from datetime import datetime
from app import db
import enum

class RiskCategory(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class RiskPrediction(db.Model):
    """Patient risk prediction model"""
    __tablename__ = 'risk_predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    prediction_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    risk_score = db.Column(db.Float, nullable=False)  # 0-100
    risk_category = db.Column(db.Enum(RiskCategory), nullable=False)
    confidence_score = db.Column(db.Float)  # 0-1
    
    # Risk factors
    age_risk = db.Column(db.Float)
    comorbidity_risk = db.Column(db.Float)
    medication_risk = db.Column(db.Float)
    vital_signs_risk = db.Column(db.Float)
    lifestyle_risk = db.Column(db.Float)
    
    # Additional factors
    risk_factors = db.Column(db.JSON)
    model_version = db.Column(db.String(50))
    model_name = db.Column(db.String(100))
    
    # Trend tracking
    previous_risk_score = db.Column(db.Float)
    risk_trend = db.Column(db.String(20))  # increasing, decreasing, stable
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'prediction_date': self.prediction_date.isoformat(),
            'risk_score': self.risk_score,
            'risk_category': self.risk_category.value,
            'confidence_score': self.confidence_score,
            'age_risk': self.age_risk,
            'comorbidity_risk': self.comorbidity_risk,
            'medication_risk': self.medication_risk,
            'vital_signs_risk': self.vital_signs_risk,
            'lifestyle_risk': self.lifestyle_risk,
            'risk_factors': self.risk_factors,
            'model_version': self.model_version,
            'model_name': self.model_name,
            'previous_risk_score': self.previous_risk_score,
            'risk_trend': self.risk_trend,
            'created_at': self.created_at.isoformat()
        }

class ReadmissionPrediction(db.Model):
    """Readmission prediction model"""
    __tablename__ = 'readmission_predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    admission_id = db.Column(db.Integer, db.ForeignKey('admissions.id'))
    prediction_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Prediction results
    readmission_probability = db.Column(db.Float, nullable=False)  # 0-1
    readmission_risk_category = db.Column(db.Enum(RiskCategory), nullable=False)
    confidence_score = db.Column(db.Float)  # 0-1
    predicted_readmission_date = db.Column(db.DateTime)
    
    # Timeframe predictions
    probability_7_days = db.Column(db.Float)
    probability_30_days = db.Column(db.Float)
    probability_90_days = db.Column(db.Float)
    
    # Contributing factors
    contributing_factors = db.Column(db.JSON)
    primary_risk_factors = db.Column(db.JSON)
    
    # Model information
    model_version = db.Column(db.String(50))
    model_name = db.Column(db.String(100))
    
    # Actual outcome (for model evaluation)
    actual_readmission = db.Column(db.Boolean)
    actual_readmission_date = db.Column(db.DateTime)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'admission_id': self.admission_id,
            'prediction_date': self.prediction_date.isoformat(),
            'readmission_probability': self.readmission_probability,
            'readmission_risk_category': self.readmission_risk_category.value,
            'confidence_score': self.confidence_score,
            'predicted_readmission_date': self.predicted_readmission_date.isoformat() if self.predicted_readmission_date else None,
            'probability_7_days': self.probability_7_days,
            'probability_30_days': self.probability_30_days,
            'probability_90_days': self.probability_90_days,
            'contributing_factors': self.contributing_factors,
            'primary_risk_factors': self.primary_risk_factors,
            'model_version': self.model_version,
            'model_name': self.model_name,
            'actual_readmission': self.actual_readmission,
            'actual_readmission_date': self.actual_readmission_date.isoformat() if self.actual_readmission_date else None,
            'created_at': self.created_at.isoformat()
        }
