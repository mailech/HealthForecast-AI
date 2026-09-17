"""
Readmission Prediction Model for HealthForecast AI
This module contains the ML model for predicting hospital readmissions
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
from datetime import datetime, timedelta

class ReadmissionPredictionModel:
    """Machine learning model for hospital readmission prediction"""
    
    def __init__(self, model_path=None):
        """Initialize the readmission prediction model"""
        self.model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.feature_names = [
            'age', 'length_of_stay', 'previous_admissions',
            'comorbidity_count', 'emergency_admission',
            'procedure_count', 'medication_count',
            'discharge_to_home', 'follow_up_scheduled',
            'chronic_condition_count', 'lab_abnormalities'
        ]
        self.is_trained = False
        self.model_path = model_path
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
    
    def preprocess_features(self, admission_data, patient_data):
        """Preprocess admission and patient data for prediction"""
        features = []
        
        # Age
        dob = patient_data.get('date_of_birth')
        if dob:
            age = (datetime.now().date() - dob).days // 365
        else:
            age = 50  # default
        features.append(age)
        
        # Length of stay
        los = admission_data.get('length_of_stay', 3)
        features.append(los)
        
        # Previous admissions
        previous_admissions = patient_data.get('previous_admissions', 0)
        features.append(previous_admissions)
        
        # Comorbidity count
        comorbidities = patient_data.get('medical_history', [])
        comorbidity_count = len(comorbidities) if comorbidities else 0
        features.append(comorbidity_count)
        
        # Emergency admission (binary)
        admission_type = admission_data.get('admission_type', 'elective')
        emergency = 1 if admission_type.lower() == 'emergency' else 0
        features.append(emergency)
        
        # Procedure count
        procedures = admission_data.get('procedures', [])
        procedure_count = len(procedures) if procedures else 0
        features.append(procedure_count)
        
        # Medication count
        medications = admission_data.get('medications', [])
        medication_count = len(medications) if medications else 0
        features.append(medication_count)
        
        # Discharge to home (binary)
        discharge_disposition = admission_data.get('discharge_disposition', 'home')
        discharge_home = 1 if discharge_disposition.lower() == 'home' else 0
        features.append(discharge_home)
        
        # Follow-up scheduled (binary)
        follow_up = admission_data.get('follow_up_scheduled', False)
        follow_up_scheduled = 1 if follow_up else 0
        features.append(follow_up_scheduled)
        
        # Chronic condition count
        chronic_conditions = [
            cond for cond in comorbidities 
            if isinstance(cond, dict) and cond.get('status') == 'chronic'
        ]
        chronic_count = len(chronic_conditions)
        features.append(chronic_count)
        
        # Lab abnormalities (simulated)
        lab_abnormalities = admission_data.get('lab_abnormalities', 0)
        features.append(lab_abnormalities)
        
        return np.array([features])
    
    def train(self, X_train, y_train):
        """Train the model with training data"""
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        self.is_trained = True
        
        return self
    
    def predict(self, admission_data, patient_data):
        """Predict readmission probability for a patient"""
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        # Preprocess features
        features = self.preprocess_features(admission_data, patient_data)
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Get prediction probabilities
        probabilities = self.model.predict_proba(features_scaled)[0]
        
        # Calculate readmission probability (0-1)
        readmission_probability = probabilities[1]
        
        # Determine risk category
        if readmission_probability < 0.2:
            risk_category = 'low'
        elif readmission_probability < 0.4:
            risk_category = 'medium'
        elif readmission_probability < 0.6:
            risk_category = 'high'
        else:
            risk_category = 'critical'
        
        # Calculate timeframe probabilities
        probability_7_days = readmission_probability * 0.3
        probability_30_days = readmission_probability * 0.7
        probability_90_days = readmission_probability
        
        # Predict readmission date
        if readmission_probability > 0.3:
            predicted_days = int(np.random.exponential(scale=30)) + 7
            predicted_days = min(predicted_days, 90)
            predicted_readmission_date = datetime.utcnow() + timedelta(days=predicted_days)
        else:
            predicted_readmission_date = None
        
        # Calculate contributing factors
        feature_importance = dict(zip(self.feature_names, self.model.feature_importances_))
        
        # Identify primary risk factors
        sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
        primary_risk_factors = [f[0] for f in sorted_features[:3]]
        
        return {
            'readmission_probability': round(readmission_probability, 3),
            'readmission_risk_category': risk_category,
            'confidence_score': round(max(probabilities), 2),
            'predicted_readmission_date': predicted_readmission_date,
            'probability_7_days': round(probability_7_days, 3),
            'probability_30_days': round(probability_30_days, 3),
            'probability_90_days': round(probability_90_days, 3),
            'contributing_factors': feature_importance,
            'primary_risk_factors': primary_risk_factors
        }
    
    def save_model(self, path):
        """Save the trained model to disk"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'is_trained': self.is_trained
        }
        joblib.dump(model_data, path)
        self.model_path = path
    
    def load_model(self, path):
        """Load a trained model from disk"""
        model_data = joblib.load(path)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        self.is_trained = model_data['is_trained']
        self.model_path = path
    
    def get_model_info(self):
        """Get information about the model"""
        return {
            'is_trained': self.is_trained,
            'feature_names': self.feature_names,
            'model_type': 'GradientBoostingClassifier',
            'n_estimators': self.model.n_estimators if self.is_trained else None,
            'learning_rate': self.model.learning_rate if self.is_trained else None,
            'max_depth': self.model.max_depth if self.is_trained else None,
            'model_path': self.model_path
        }
