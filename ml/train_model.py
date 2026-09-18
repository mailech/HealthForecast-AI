import os
import pandas as pd
import numpy as np
import json
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
import joblib

def train_and_export_model():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, 'dataset_diabetes', 'diabetic_data.csv')

    if not os.path.exists(data_path):
        raise FileNotFoundError(f"[!] Real Dataset not found at {data_path}. Please download the UCI dataset.")

    print("[*] Loading real dataset...")
    df = pd.read_csv(data_path, na_values="?")

    # Target definition: Readmitted within 30 days
    df['target'] = (df['readmitted'] == '<30').astype(int)

    # Feature selection based on available data and clinical relevance
    features = [
        'time_in_hospital',
        'num_lab_procedures',
        'num_procedures',
        'num_medications',
        'number_outpatient',
        'number_emergency',
        'number_inpatient',
        'number_diagnoses'
    ]

    print("[*] Preprocessing data...")
    X = df[features].fillna(0)
    y = df['target']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    print("[*] Training models...")

    # Random Forest
    rf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, class_weight='balanced')
    rf.fit(X_train_scaled, y_train)
    rf_prob = rf.predict_proba(X_test_scaled)[:, 1]
    rf_auc = roc_auc_score(y_test, rf_prob)

    # XGBoost
    xgb = XGBClassifier(n_estimators=100, max_depth=6, random_state=42, scale_pos_weight=(len(y_train)-sum(y_train))/sum(y_train))
    xgb.fit(X_train_scaled, y_train)
    xgb_prob = xgb.predict_proba(X_test_scaled)[:, 1]
    xgb_auc = roc_auc_score(y_test, xgb_prob)

    print(f"Random Forest AUC: {rf_auc:.4f}")
    print(f"XGBoost AUC:       {xgb_auc:.4f}")

    best_model = xgb if xgb_auc > rf_auc else rf
    best_prob = xgb_prob if xgb_auc > rf_auc else rf_prob
    best_pred = (best_prob > 0.5).astype(int)
    model_name = "XGBoost" if xgb_auc > rf_auc else "Random Forest"

    print("\n" + "="*50)
    print(" HEALTHFORECAST AI - ML MODEL PERFORMANCE REPORT")
    print("="*50)
    print(f"Selected Model: {model_name}")
    print(f"Accuracy:  {accuracy_score(y_test, best_pred):.4f}")
    print(f"Precision: {precision_score(y_test, best_pred):.4f}")
    print(f"Recall:    {recall_score(y_test, best_pred):.4f}")
    print(f"F1-Score:  {f1_score(y_test, best_pred):.4f}")
    print(f"ROC-AUC:   {roc_auc_score(y_test, best_prob):.4f}")
    print(f"Confusion Matrix:\n{confusion_matrix(y_test, best_pred)}")
    print("="*50 + "\n")

    # Threshold derivation (configurable)
    # Low risk < 0.4, Medium risk 0.4 - 0.7, High risk > 0.7

    metadata = {
        "model_name": model_name,
        "model_version": "1.0.0",
        "training_date": pd.Timestamp.now().isoformat(),
        "features": features,
        "metrics": {
            "accuracy": accuracy_score(y_test, best_pred),
            "precision": precision_score(y_test, best_pred),
            "recall": recall_score(y_test, best_pred),
            "f1": f1_score(y_test, best_pred),
            "roc_auc": roc_auc_score(y_test, best_prob)
        },
        "thresholds": {
            "low_medium": 0.4,
            "medium_high": 0.7
        }
    }

    backend_ml_dir = os.path.abspath(os.path.join(current_dir, '..', 'backend', 'app', 'ml'))
    os.makedirs(backend_ml_dir, exist_ok=True)

    model_dst = os.path.join(backend_ml_dir, 'readmission_model.joblib')
    scaler_dst = os.path.join(backend_ml_dir, 'scaler.joblib')
    meta_dst = os.path.join(backend_ml_dir, 'metadata.json')

    joblib.dump(best_model, model_dst)
    joblib.dump(scaler, scaler_dst)
    with open(meta_dst, 'w') as f:
        json.dump(metadata, f, indent=4)

    print(f"[+] Saved Model to:  {model_dst}")
    print(f"[+] Saved Scaler to: {scaler_dst}")
    print(f"[+] Saved Meta to:   {meta_dst}")

if __name__ == '__main__':
    train_and_export_model()
