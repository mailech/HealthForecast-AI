"""
CLI script to train, evaluate, and save machine learning model artifacts for HealthForecast AI.
"""
import os
import sys
import numpy as np
import pandas as pd
import joblib
import logging

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Target directory for serialized ML artifacts
ML_MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "ml_models")

def train_and_persist_models():
    os.makedirs(ML_MODEL_DIR, exist_ok=True)
    logger.info("Generating dataset based on UCI Diabetes 130-US Hospitals schema...")

    np.random.seed(42)
    n_samples = 1000

    num_inpatient = np.random.poisson(lam=0.7, size=n_samples)
    num_emergency = np.random.poisson(lam=0.4, size=n_samples)
    time_in_hospital = np.random.randint(1, 15, size=n_samples)
    num_lab_procedures = np.random.randint(5, 100, size=n_samples)
    num_medications = np.random.randint(2, 45, size=n_samples)
    age = np.random.randint(20, 90, size=n_samples)
    a1c_high = np.random.choice([0, 1], p=[0.68, 0.32], size=n_samples)

    logits = (
        -2.3
        + 0.88 * num_inpatient
        + 0.68 * num_emergency
        + 0.14 * time_in_hospital
        + 0.045 * num_medications
        + 0.75 * a1c_high
        + 0.018 * (age - 50)
        + np.random.normal(0, 0.45, size=n_samples)
    )
    probs = 1 / (1 + np.exp(-logits))
    y = (probs > 0.45).astype(int)

    X = pd.DataFrame({
        "num_inpatient": num_inpatient,
        "num_emergency": num_emergency,
        "time_in_hospital": time_in_hospital,
        "num_lab_procedures": num_lab_procedures,
        "num_medications": num_medications,
        "age": age,
        "a1c_high": a1c_high
    })

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    logger.info("Training Primary Model: RandomForestClassifier (120 Trees)...")
    rf_model = RandomForestClassifier(n_estimators=120, max_depth=7, random_state=42)
    rf_model.fit(X_train, y_train)

    rf_preds = rf_model.predict(X_test)
    rf_probs = rf_model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, rf_preds)
    auc = roc_auc_score(y_test, rf_probs)
    prec = precision_score(y_test, rf_preds, zero_division=0)
    rec = recall_score(y_test, rf_preds, zero_division=0)
    f1 = f1_score(y_test, rf_preds, zero_division=0)

    logger.info(f"Model Training Results - Accuracy: {acc:.4f}, ROC-AUC: {auc:.4f}, Precision: {prec:.4f}, Recall: {rec:.4f}, F1: {f1:.4f}")

    # Persist serialized model artifacts
    model_filepath = os.path.join(ML_MODEL_DIR, "random_forest_readmission.joblib")
    scaler_filepath = os.path.join(ML_MODEL_DIR, "scaler.joblib")
    metadata_filepath = os.path.join(ML_MODEL_DIR, "metadata.joblib")

    joblib.dump(rf_model, model_filepath)
    joblib.dump(scaler, scaler_filepath)
    joblib.dump({
        "model_name": "RandomForestClassifier (120 Trees)",
        "accuracy": acc,
        "roc_auc": auc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "feature_names": list(X.columns),
        "trained_at": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
    }, metadata_filepath)

    logger.info(f"Model artifacts successfully persisted to {ML_MODEL_DIR}")
    return True

if __name__ == "__main__":
    train_and_persist_models()
