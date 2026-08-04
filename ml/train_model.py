import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib

from generate_data import generate_clinical_dataset

def train_and_export_model():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, 'hospital_readmissions.csv')
    
    if not os.path.exists(data_path):
        print("[!] Dataset not found. Generating fresh dataset...")
        df = generate_clinical_dataset()
    else:
        df = pd.read_csv(data_path)

    feature_cols = [
        'age', 'prior_admissions', 'emergency_visits', 'length_of_stay',
        'charlson_index', 'lace_index', 'hba1c', 'serum_sodium',
        'creatinine', 'polypharmacy_count'
    ]
    
    X = df[feature_cols]
    y = df['readmitted_30d']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=10,
        min_samples_split=4,
        random_state=42,
        class_weight='balanced'
    )
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    y_prob = model.predict_proba(X_test_scaled)[:, 1]
    
    print("\n" + "="*50)
    print(" HEALTHFORECAST AI - ML MODEL PERFORMANCE REPORT")
    print("="*50)
    print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall:    {recall_score(y_test, y_pred):.4f}")
    print(f"F1-Score:  {f1_score(y_test, y_pred):.4f}")
    print(f"ROC-AUC:   {roc_auc_score(y_test, y_prob):.4f}")
    print("="*50 + "\n")
    
    # Target directories
    backend_ml_dir = os.path.abspath(os.path.join(current_dir, '..', 'backend', 'app', 'ml'))
    os.makedirs(backend_ml_dir, exist_ok=True)
    
    model_dst = os.path.join(backend_ml_dir, 'readmission_model.joblib')
    scaler_dst = os.path.join(backend_ml_dir, 'scaler.joblib')
    
    joblib.dump(model, model_dst)
    joblib.dump(scaler, scaler_dst)
    
    # Save local copies as well
    joblib.dump(model, os.path.join(current_dir, 'readmission_model.joblib'))
    joblib.dump(scaler, os.path.join(current_dir, 'scaler.joblib'))
    
    print(f"[+] Saved Model to:  {model_dst}")
    print(f"[+] Saved Scaler to: {scaler_dst}")

if __name__ == '__main__':
    train_and_export_model()
