from datetime import datetime
from app import db
import enum

class TimePeriod(enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"

class HospitalPerformance(db.Model):
    """Hospital performance metrics and analytics"""
    __tablename__ = 'hospital_performance'
    
    id = db.Column(db.Integer, primary_key=True)
    hospital_id = db.Column(db.String(50))
    department = db.Column(db.String(100))
    
    report_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    time_period = db.Column(db.Enum(TimePeriod), default=TimePeriod.MONTHLY)
    
    # Readmission metrics
    total_admissions = db.Column(db.Integer)
    total_readmissions = db.Column(db.Integer)
    readmission_rate = db.Column(db.Float)
    readmission_rate_7_day = db.Column(db.Float)
    readmission_rate_30_day = db.Column(db.Float)
    readmission_rate_90_day = db.Column(db.Float)
    
    # Performance metrics
    average_length_of_stay = db.Column(db.Float)
    bed_occupancy_rate = db.Column(db.Float)
    patient_satisfaction_score = db.Column(db.Float)
    
    # Outcome metrics
    mortality_rate = db.Column(db.Float)
    complication_rate = db.Column(db.Float)
    infection_rate = db.Column(db.Float)
    
    # Financial metrics
    cost_per_admission = db.Column(db.Float)
    readmission_cost = db.Column(db.Float)
    
    # Quality metrics
    quality_score = db.Column(db.Float)
    benchmark_comparison = db.Column(db.JSON)
    trends = db.Column(db.JSON)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'hospital_id': self.hospital_id,
            'department': self.department,
            'report_date': self.report_date.isoformat(),
            'time_period': self.time_period.value,
            'total_admissions': self.total_admissions,
            'total_readmissions': self.total_readmissions,
            'readmission_rate': self.readmission_rate,
            'readmission_rate_7_day': self.readmission_rate_7_day,
            'readmission_rate_30_day': self.readmission_rate_30_day,
            'readmission_rate_90_day': self.readmission_rate_90_day,
            'average_length_of_stay': self.average_length_of_stay,
            'bed_occupancy_rate': self.bed_occupancy_rate,
            'patient_satisfaction_score': self.patient_satisfaction_score,
            'mortality_rate': self.mortality_rate,
            'complication_rate': self.complication_rate,
            'infection_rate': self.infection_rate,
            'cost_per_admission': self.cost_per_admission,
            'readmission_cost': self.readmission_cost,
            'quality_score': self.quality_score,
            'benchmark_comparison': self.benchmark_comparison,
            'trends': self.trends,
            'created_at': self.created_at.isoformat()
        }

class PatientOutcome(db.Model):
    """Patient outcome tracking and analysis"""
    __tablename__ = 'patient_outcomes'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    admission_id = db.Column(db.Integer, db.ForeignKey('admissions.id'))
    
    outcome_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    outcome_type = db.Column(db.String(100))
    
    # Outcome metrics
    overall_outcome = db.Column(db.String(100))
    outcome_score = db.Column(db.Float)
    recovery_percentage = db.Column(db.Float)
    
    # Clinical outcomes
    symptom_resolution = db.Column(db.Float)
    functional_improvement = db.Column(db.Float)
    quality_of_life_score = db.Column(db.Float)
    
    # Comparison metrics
    expected_outcome = db.Column(db.String(100))
    outcome_vs_expected = db.Column(db.String(20))  # better, as_expected, worse
    peer_comparison = db.Column(db.JSON)
    
    # Risk factors
    risk_factors_present = db.Column(db.JSON)
    risk_factors_managed = db.Column(db.JSON)
    
    # Follow-up outcomes
    follow_up_compliance = db.Column(db.Float)
    readmission_occurred = db.Column(db.Boolean)
    readmission_date = db.Column(db.DateTime)
    
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'admission_id': self.admission_id,
            'outcome_date': self.outcome_date.isoformat(),
            'outcome_type': self.outcome_type,
            'overall_outcome': self.overall_outcome,
            'outcome_score': self.outcome_score,
            'recovery_percentage': self.recovery_percentage,
            'symptom_resolution': self.symptom_resolution,
            'functional_improvement': self.functional_improvement,
            'quality_of_life_score': self.quality_of_life_score,
            'expected_outcome': self.expected_outcome,
            'outcome_vs_expected': self.outcome_vs_expected,
            'peer_comparison': self.peer_comparison,
            'risk_factors_present': self.risk_factors_present,
            'risk_factors_managed': self.risk_factors_managed,
            'follow_up_compliance': self.follow_up_compliance,
            'readmission_occurred': self.readmission_occurred,
            'readmission_date': self.readmission_date.isoformat() if self.readmission_date else None,
            'notes': self.notes,
            'created_at': self.created_at.isoformat()
        }

class HealthcareTrend(db.Model):
    """Healthcare trend analysis and visualization data"""
    __tablename__ = 'healthcare_trends'
    
    id = db.Column(db.Integer, primary_key=True)
    trend_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    time_period = db.Column(db.Enum(TimePeriod), default=TimePeriod.MONTHLY)
    
    # Trend categories
    trend_category = db.Column(db.String(100))
    trend_name = db.Column(db.String(255))
    trend_description = db.Column(db.Text)
    
    # Trend data
    trend_value = db.Column(db.Float)
    previous_value = db.Column(db.Float)
    change_percentage = db.Column(db.Float)
    trend_direction = db.Column(db.String(20))  # increasing, decreasing, stable
    
    # Historical data
    historical_data = db.Column(db.JSON)
    forecast_data = db.Column(db.JSON)
    
    # Segmentation
    demographic_segments = db.Column(db.JSON)
    geographic_segments = db.Column(db.JSON)
    condition_segments = db.Column(db.JSON)
    
    # Insights
    insights = db.Column(db.JSON)
    recommendations = db.Column(db.JSON)
    
    # Metadata
    data_source = db.Column(db.String(100))
    confidence_level = db.Column(db.Float)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'trend_date': self.trend_date.isoformat(),
            'time_period': self.time_period.value,
            'trend_category': self.trend_category,
            'trend_name': self.trend_name,
            'trend_description': self.trend_description,
            'trend_value': self.trend_value,
            'previous_value': self.previous_value,
            'change_percentage': self.change_percentage,
            'trend_direction': self.trend_direction,
            'historical_data': self.historical_data,
            'forecast_data': self.forecast_data,
            'demographic_segments': self.demographic_segments,
            'geographic_segments': self.geographic_segments,
            'condition_segments': self.condition_segments,
            'insights': self.insights,
            'recommendations': self.recommendations,
            'data_source': self.data_source,
            'confidence_level': self.confidence_level,
            'created_at': self.created_at.isoformat()
        }
