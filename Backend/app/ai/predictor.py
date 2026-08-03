import os
import logging
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib

logger = logging.getLogger("app.ai.predictor")

MODEL_PATH = os.path.join(os.path.dirname(__file__), "readmission_model.joblib")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.joblib")

def train_default_model():
    """
    Generates synthetic patient records, trains a baseline RandomForest model,
    and saves both the model and the scaler to disk.
    """
    logger.info("Generating synthetic dataset to train the default readmission model...")
    np.random.seed(42)
    
    n_samples = 1000
    
    # Generate synthetic features
    age = np.random.randint(18, 90, size=n_samples)
    gender_numeric = np.random.randint(0, 3, size=n_samples) # Male=0, Female=1, Other=2
    length_of_stay = np.random.randint(1, 20, size=n_samples)
    num_previous_admissions = np.random.randint(0, 6, size=n_samples)
    num_medications = np.random.randint(1, 25, size=n_samples)
    systolic_bp = np.random.randint(90, 180, size=n_samples)
    diastolic_bp = np.random.randint(60, 110, size=n_samples)
    blood_sugar = np.random.uniform(70.0, 250.0, size=n_samples)
    comorbidity_count = np.random.randint(0, 5, size=n_samples)
    
    # Calculate probability of readmission based on logical rules
    # higher age, length of stay, previous admissions, comorbidities, blood sugar -> higher risk
    risk_score = (
        (age / 90.0) * 0.15 +
        (length_of_stay / 20.0) * 0.2 +
        (num_previous_admissions / 5.0) * 0.25 +
        (comorbidity_count / 5.0) * 0.15 +
        (blood_sugar / 250.0) * 0.15 +
        (systolic_bp / 180.0) * 0.1
    )
    
    # Convert risk_score to binary labels with noise
    probabilities = 1.0 / (1.0 + np.exp(-10 * (risk_score - 0.45)))
    readmitted = (np.random.rand(n_samples) < probabilities).astype(int)
    
    df = pd.DataFrame({
        "age": age,
        "gender_numeric": gender_numeric,
        "length_of_stay": length_of_stay,
        "num_previous_admissions": num_previous_admissions,
        "num_medications": num_medications,
        "systolic_bp": systolic_bp,
        "diastolic_bp": diastolic_bp,
        "blood_sugar": blood_sugar,
        "comorbidity_count": comorbidity_count
    })
    
    X = df.values
    y = readmitted
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_scaled, y)
    
    # Save files
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    logger.info(f"Model and scaler trained and saved successfully at {MODEL_PATH} and {SCALER_PATH}")
    return model, scaler

class ReadmissionPredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        
    def load_model(self):
        if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
            logger.info("Model files not found. Initiating auto-training of baseline model...")
            self.model, self.scaler = train_default_model()
        else:
            self.model = joblib.load(MODEL_PATH)
            self.scaler = joblib.load(SCALER_PATH)
            logger.info("Loaded readmission model and scaler successfully.")
            
    def predict(self, data: dict) -> dict:
        """
        Runs prediction.
        Input format:
        {
           "age": int,
           "gender": str,
           "length_of_stay": int,
           "num_previous_admissions": int,
           "num_medications": int,
           "systolic_bp": int,
           "diastolic_bp": int,
           "blood_sugar": float,
           "comorbidity_count": int
        }
        Returns:
        {
           "readmission_risk_score": float (0.0 to 1.0),
           "risk_level": str ("High", "Medium", "Low")
        }
        """
        if self.model is None or self.scaler is None:
            raise ValueError("Predictor model has not been loaded (warmed up).")
            
        gender_map = {"male": 0, "female": 1, "other": 2}
        gender_val = gender_map.get(data.get("gender", "other").lower(), 2)
        
        feature_dict = {
            "age": data["age"],
            "gender_numeric": gender_val,
            "length_of_stay": data["length_of_stay"],
            "num_previous_admissions": data["num_previous_admissions"],
            "num_medications": data["num_medications"],
            "systolic_bp": data["systolic_bp"],
            "diastolic_bp": data["diastolic_bp"],
            "blood_sugar": data["blood_sugar"],
            "comorbidity_count": data["comorbidity_count"]
        }
        
        features_array = np.array([[
            feature_dict["age"],
            feature_dict["gender_numeric"],
            feature_dict["length_of_stay"],
            feature_dict["num_previous_admissions"],
            feature_dict["num_medications"],
            feature_dict["systolic_bp"],
            feature_dict["diastolic_bp"],
            feature_dict["blood_sugar"],
            feature_dict["comorbidity_count"]
        ]])
        
        scaled_features = self.scaler.transform(features_array)
        
        # Predict probability
        proba = self.model.predict_proba(scaled_features)[0][1]
        
        # Categorize risk levels
        if proba >= 0.65:
            risk_level = "High"
        elif proba >= 0.35:
            risk_level = "Medium"
        else:
            risk_level = "Low"
            
        return {
            "readmission_risk_score": float(proba),
            "risk_level": risk_level
        }

predictor_instance = ReadmissionPredictor()
