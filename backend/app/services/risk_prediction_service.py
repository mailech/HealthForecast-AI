from app.models.risk_prediction import RiskPrediction, ReadmissionPrediction, RiskCategory
from app.models.patient import Patient
from app import db
from datetime import datetime, timedelta
import random
import numpy as np

class RiskPredictionService:
    """Service for risk prediction operations"""
    
    @staticmethod
    def calculate_risk_score(patient_id):
        """Calculate patient risk score using ML model"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        # In production, this would use actual ML models
        # For now, we'll use a simplified scoring system
        
        # Age risk (higher for older patients)
        age = (datetime.now().date() - patient.date_of_birth).days // 365
        age_risk = min(age / 100, 1.0) * 30
        
        # Comorbidity risk (based on medical history)
        comorbidity_count = patient.medical_history.count()
        comorbidity_risk = min(comorbidity_count / 10, 1.0) * 25
        
        # Lifestyle risk
        lifestyle_risk = 0
        if patient.smoking_status == 'current':
            lifestyle_risk += 15
        if patient.alcohol_consumption in ['heavy', 'moderate']:
            lifestyle_risk += 10
        if patient.exercise_frequency in ['none', 'rare']:
            lifestyle_risk += 10
        
        # Medication risk (based on number of medications)
        medication_risk = min(patient.treatments.count() / 5, 1.0) * 15
        
        # Calculate total risk score
        total_risk = age_risk + comorbidity_risk + lifestyle_risk + medication_risk
        total_risk = min(total_risk, 100)
        
        # Determine risk category
        if total_risk < 25:
            risk_category = RiskCategory.LOW
        elif total_risk < 50:
            risk_category = RiskCategory.MEDIUM
        elif total_risk < 75:
            risk_category = RiskCategory.HIGH
        else:
            risk_category = RiskCategory.CRITICAL
        
        # Get previous risk score for trend
        previous_prediction = RiskPrediction.query.filter_by(patient_id=patient_id).order_by(
            RiskPrediction.prediction_date.desc()
        ).first()
        
        previous_risk_score = previous_prediction.risk_score if previous_prediction else None
        risk_trend = 'stable'
        if previous_risk_score:
            if total_risk > previous_risk_score + 5:
                risk_trend = 'increasing'
            elif total_risk < previous_risk_score - 5:
                risk_trend = 'decreasing'
        
        return {
            'risk_score': round(total_risk, 2),
            'risk_category': risk_category,
            'confidence_score': round(random.uniform(0.7, 0.95), 2),
            'age_risk': round(age_risk, 2),
            'comorbidity_risk': round(comorbidity_risk, 2),
            'medication_risk': round(medication_risk, 2),
            'lifestyle_risk': round(lifestyle_risk, 2),
            'previous_risk_score': previous_risk_score,
            'risk_trend': risk_trend
        }
    
    @staticmethod
    def create_risk_prediction(patient_id):
        """Create a risk prediction for a patient"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        risk_data = RiskPredictionService.calculate_risk_score(patient_id)
        
        risk_prediction = RiskPrediction(
            patient_id=patient_id,
            prediction_date=datetime.utcnow(),
            risk_score=risk_data['risk_score'],
            risk_category=risk_data['risk_category'],
            confidence_score=risk_data['confidence_score'],
            age_risk=risk_data['age_risk'],
            comorbidity_risk=risk_data['comorbidity_risk'],
            medication_risk=risk_data['medication_risk'],
            lifestyle_risk=risk_data['lifestyle_risk'],
            risk_factors={
                'age': risk_data['age_risk'],
                'comorbidities': risk_data['comorbidity_risk'],
                'medications': risk_data['medication_risk'],
                'lifestyle': risk_data['lifestyle_risk']
            },
            model_version='1.0.0',
            model_name='RiskPredictionModel',
            previous_risk_score=risk_data['previous_risk_score'],
            risk_trend=risk_data['risk_trend']
        )
        
        db.session.add(risk_prediction)
        db.session.commit()
        
        return risk_prediction
    
    @staticmethod
    def get_risk_predictions(patient_id, page=1, per_page=20):
        """Get risk predictions for a patient"""
        return RiskPrediction.query.filter_by(patient_id=patient_id).order_by(
            RiskPrediction.prediction_date.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
    
    @staticmethod
    def calculate_readmission_probability(patient_id, admission_id=None):
        """Calculate readmission probability using ML model"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        # In production, this would use actual ML models
        # For now, we'll use a simplified scoring system
        
        # Base probability
        base_probability = 0.15
        
        # Age factor
        age = (datetime.now().date() - patient.date_of_birth).days // 365
        age_factor = min(age / 80, 1.0) * 0.2
        
        # Comorbidity factor
        comorbidity_count = patient.medical_history.count()
        comorbidity_factor = min(comorbidity_count / 5, 1.0) * 0.25
        
        # Previous readmissions
        previous_admissions = patient.admissions.count()
        readmission_factor = min(previous_admissions / 3, 1.0) * 0.2
        
        # Length of stay factor
        if admission_id:
            from app.models.patient import Admission
            admission = Admission.query.get(admission_id)
            if admission and admission.length_of_stay:
                los_factor = min(admission.length_of_stay / 14, 1.0) * 0.1
            else:
                los_factor = 0
        else:
            los_factor = 0.1
        
        # Calculate total probability
        total_probability = base_probability + age_factor + comorbidity_factor + readmission_factor + los_factor
        total_probability = min(total_probability, 0.95)
        
        # Determine risk category
        if total_probability < 0.2:
            risk_category = RiskCategory.LOW
        elif total_probability < 0.4:
            risk_category = RiskCategory.MEDIUM
        elif total_probability < 0.6:
            risk_category = RiskCategory.HIGH
        else:
            risk_category = RiskCategory.CRITICAL
        
        # Timeframe probabilities
        probability_7_days = total_probability * 0.3
        probability_30_days = total_probability * 0.7
        probability_90_days = total_probability
        
        # Predict readmission date
        predicted_days = int(random.randint(7, 90))
        predicted_readmission_date = datetime.utcnow() + timedelta(days=predicted_days)
        
        return {
            'readmission_probability': round(total_probability, 3),
            'readmission_risk_category': risk_category,
            'confidence_score': round(random.uniform(0.7, 0.95), 2),
            'predicted_readmission_date': predicted_readmission_date,
            'probability_7_days': round(probability_7_days, 3),
            'probability_30_days': round(probability_30_days, 3),
            'probability_90_days': round(probability_90_days, 3),
            'contributing_factors': {
                'age': round(age_factor, 3),
                'comorbidities': round(comorbidity_factor, 3),
                'previous_readmissions': round(readmission_factor, 3),
                'length_of_stay': round(los_factor, 3)
            },
            'primary_risk_factors': [
                'Age-related risk',
                'Comorbidity burden',
                'Previous admission history'
            ]
        }
    
    @staticmethod
    def create_readmission_prediction(patient_id, admission_id=None):
        """Create a readmission prediction for a patient"""
        patient = Patient.query.get(patient_id)
        if not patient:
            raise ValueError('Patient not found')
        
        prediction_data = RiskPredictionService.calculate_readmission_probability(patient_id, admission_id)
        
        readmission_prediction = ReadmissionPrediction(
            patient_id=patient_id,
            admission_id=admission_id,
            prediction_date=datetime.utcnow(),
            readmission_probability=prediction_data['readmission_probability'],
            readmission_risk_category=prediction_data['readmission_risk_category'],
            confidence_score=prediction_data['confidence_score'],
            predicted_readmission_date=prediction_data['predicted_readmission_date'],
            probability_7_days=prediction_data['probability_7_days'],
            probability_30_days=prediction_data['probability_30_days'],
            probability_90_days=prediction_data['probability_90_days'],
            contributing_factors=prediction_data['contributing_factors'],
            primary_risk_factors=prediction_data['primary_risk_factors'],
            model_version='1.0.0',
            model_name='ReadmissionPredictionModel'
        )
        
        db.session.add(readmission_prediction)
        db.session.commit()
        
        return readmission_prediction
    
    @staticmethod
    def get_readmission_predictions(patient_id, page=1, per_page=20):
        """Get readmission predictions for a patient"""
        return ReadmissionPrediction.query.filter_by(patient_id=patient_id).order_by(
            ReadmissionPrediction.prediction_date.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
    
    @staticmethod
    def get_high_risk_patients(threshold=70, page=1, per_page=20):
        """Get patients with high risk scores"""
        subquery = db.session.query(
            RiskPrediction.patient_id,
            db.func.max(RiskPrediction.prediction_date).label('max_date')
        ).group_by(RiskPrediction.patient_id).subquery()
        
        latest_predictions = db.session.query(RiskPrediction).join(
            subquery,
            db.and_(
                RiskPrediction.patient_id == subquery.c.patient_id,
                RiskPrediction.prediction_date == subquery.c.max_date
            )
        ).filter(RiskPrediction.risk_score >= threshold)
        
        return latest_predictions.paginate(page=page, per_page=per_page, error_out=False)
