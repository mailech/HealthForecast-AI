import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, precision_score, recall_score

def generate_synthetic_clinical_data(n_samples=2500, random_state=42):
    np.random.seed(random_state)
    
    age = np.random.randint(18, 90, size=n_samples)
    glucose = np.random.normal(130, 45, size=n_samples).clip(70, 400)
    bp_systolic = np.random.normal(135, 20, size=n_samples).clip(90, 200)
    bp_diastolic = np.random.normal(85, 12, size=n_samples).clip(60, 130)
    bmi = np.random.normal(27.5, 6, size=n_samples).clip(15, 55)
    previous_admissions = np.random.poisson(1.5, size=n_samples).clip(0, 15)
    
    # Calculate readmission risk target probability
    logits = (
        -4.2
        + 0.035 * (age - 50)
        + 0.022 * (glucose - 100)
        + 0.025 * (bp_systolic - 120)
        + 0.03 * (bmi - 25)
        + 0.65 * previous_admissions
    )
    prob = 1 / (1 + np.exp(-logits))
    readmitted = (prob > np.random.uniform(0, 1, size=n_samples)).astype(int)
    
    df = pd.DataFrame({
        "age": age,
        "glucose": glucose,
        "bp_systolic": bp_systolic,
        "bp_diastolic": bp_diastolic,
        "bmi": bmi,
        "previous_admissions": previous_admissions,
        "readmitted": readmitted
    })
    
    return df

def train_and_save_model():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("Generating synthetic clinical dataset...")
    df = generate_synthetic_clinical_data(n_samples=3000)
    
    feature_cols = ["age", "glucose", "bp_systolic", "bp_diastolic", "bmi", "previous_admissions"]
    X = df[feature_cols]
    y = df["readmitted"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Preprocessing & scaling clinical features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Training RandomForestClassifier model ensemble...")
    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=10,
        random_state=42,
        class_weight="balanced"
    )
    clf.fit(X_train_scaled, y_train)
    
    y_pred = clf.predict(X_test_scaled)
    y_proba = clf.predict_proba(X_test_scaled)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    precision = precision_score(y_test, y_pred)
    recall = recall_score(y_test, y_pred)
    
    print(f"Model Training Metrics:")
    print(f"  - Accuracy:  {acc:.4f}")
    print(f"  - ROC-AUC:   {auc:.4f}")
    print(f"  - Precision: {precision:.4f}")
    print(f"  - Recall:    {recall:.4f}")
    
    model_path = os.path.join(script_dir, "model.pkl")
    scaler_path = os.path.join(script_dir, "scaler.pkl")
    version_path = os.path.join(script_dir, "model_version.json")
    
    joblib.dump(clf, model_path)
    joblib.dump(scaler, scaler_path)
    
    feature_importances = dict(zip(feature_cols, clf.feature_importances_.round(4)))
    
    metadata = {
        "model_name": "HealthForecast-RandomForest-Classifier",
        "version": "v2.4.0",
        "algorithm": "RandomForestClassifier",
        "n_estimators": 120,
        "features": feature_cols,
        "feature_importances": feature_importances,
        "metrics": {
            "accuracy": round(float(acc), 4),
            "roc_auc": round(float(auc), 4),
            "precision": round(float(precision), 4),
            "recall": round(float(recall), 4)
        },
        "artifact_files": ["model.pkl", "scaler.pkl"]
    }
    
    with open(version_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Saved model artifact to {model_path}")
    print(f"Saved scaler artifact to {scaler_path}")
    print(f"Saved version metadata to {version_path}")

if __name__ == "__main__":
    train_and_save_model()
