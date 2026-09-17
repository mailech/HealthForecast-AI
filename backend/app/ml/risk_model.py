"""
Risk Prediction Model for HealthForecast AI
This module contains the ML model for predicting patient risk scores
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
from datetime import datetime

class RiskPredictionModel:
    """Machine learning model for patient risk prediction"""
    
    def __init__(self, model_path=None):
        """Initialize the risk prediction model"""
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.scaler = StandardScaler()
        self.feature_names = [
            'age', 'comorbidity_count', 'medication_count',
            'smoking_status', 'alcohol_consumption', 'exercise_frequency',
            'bmi', 'blood_pressure_systolic', 'blood_pressure_diastolic',
            'heart_rate', 'glucose_level', 'cholesterol_level'
        ]
        self.is_trained = False
        self.model_path = model_path
        
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
    
    def preprocess_features(self, patient_data):
        """Preprocess patient data for prediction"""
        features = []
        
        # Age
        dob = patient_data.get('date_of_birth')
        if dob:
            age = (datetime.now().date() - dob).days // 365
        else:
            age = 50  # default
        features.append(age)
        
        # Comorbidity count
        comorbidities = patient_data.get('medical_history', [])
        comorbidity_count = len(comorbidities) if comorbidities else 0
        features.append(comorbidity_count)
        
        # Medication count
        medications = patient_data.get('medications', [])
        medication_count = len(medications) if medications else 0
        features.append(medication_count)
        
        # Lifestyle factors (encoded)
        smoking_map = {'never': 0, 'former': 1, 'current': 2}
        smoking_status = patient_data.get('smoking_status', 'never')
        features.append(smoking_map.get(smoking_status.lower(), 0))
        
        alcohol_map = {'none': 0, 'light': 1, 'moderate': 2, 'heavy': 3}
        alcohol_consumption = patient_data.get('alcohol_consumption', 'none')
        features.append(alcohol_map.get(alcohol_consumption.lower(), 0))
        
        exercise_map = {'none': 0, 'rare': 1, 'occasional': 2, 'regular': 3}
        exercise_frequency = patient_data.get('exercise_frequency', 'none')
        features.append(exercise_map.get(exercise_frequency.lower(), 0))
        
        # Vital signs (with defaults)
        features.append(patient_data.get('bmi', 25.0))
        features.append(patient_data.get('blood_pressure_systolic', 120))
        features.append(patient_data.get('blood_pressure_diastolic', 80))
        features.append(patient_data.get('heart_rate', 72))
        features.append(patient_data.get('glucose_level', 100))
        features.append(patient_data.get('cholesterol_level', 200))
        
        return np.array([features])
    
    def train(self, X_train, y_train):
        """Train the model with training data"""
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        # Train model
        self.model.fit(X_train_scaled, y_train)
        self.is_trained = True
        
        return self
    
    def predict(self, patient_data):
        """Predict risk score for a patient"""
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        # Preprocess features
        features = self.preprocess_features(patient_data)
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Get prediction probabilities
        probabilities = self.model.predict_proba(features_scaled)[0]
        
        # Calculate risk score (0-100)
        risk_score = probabilities[1] * 100  # Assuming binary classification
        
        # Determine risk category
        if risk_score < 25:
            risk_category = 'low'
        elif risk_score < 50:
            risk_category = 'medium'
        elif risk_score < 75:
            risk_category = 'high'
        else:
            risk_category = 'critical'
        
        # Calculate individual risk factors
        feature_importance = dict(zip(self.feature_names, self.model.feature_importances_))
        
        return {
            'risk_score': round(risk_score, 2),
            'risk_category': risk_category,
            'confidence_score': round(max(probabilities), 2),
            'feature_importance': feature_importance
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
            'model_type': 'RandomForestClassifier',
            'n_estimators': self.model.n_estimators if self.is_trained else None,
            'max_depth': self.model.max_depth if self.is_trained else None,
            'model_path': self.model_path
        }
