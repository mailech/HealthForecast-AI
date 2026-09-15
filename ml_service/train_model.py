import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)

from preprocessing import transform_dataframe, FEATURE_NAMES

def train_and_save_model():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_dir = os.path.dirname(script_dir)
    csv_path = os.path.join(workspace_dir, "backend", "data", "diabetic_data.csv")
    
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Clinical dataset not found at {csv_path}")
        
    print(f"Loading clinical dataset from: {csv_path}")
    raw_df = pd.read_csv(csv_path)
    
    raw_total = len(raw_df)
    raw_counts = raw_df["readmitted"].value_counts().to_dict()
    
    print("\n==========================================================================")
    print("                    DATASET AUDIT & PREPROCESSING                         ")
    print("==========================================================================")
    print(f"Raw Records Count: {raw_total}")
    print(f"Raw Readmitted Counts: {raw_counts}")
    
    # Filter expired & hospice discharge disposition records
    # IDs: 11 (Expired), 13 (Hospice/home), 14 (Hospice/facility), 19 (Expired home), 20 (Expired facility), 21 (Expired unknown)
    expired_hospice_ids = [11, 13, 14, 19, 20, 21]
    filtered_df = raw_df[~raw_df["discharge_disposition_id"].isin(expired_hospice_ids)].copy()
    
    filtered_total = len(filtered_df)
    y = (filtered_df["readmitted"] == "<30").astype(int)
    pos_count = int(y.sum())
    neg_count = int(filtered_total - pos_count)
    pos_pct = round((pos_count / filtered_total) * 100, 2)
    neg_pct = round((neg_count / filtered_total) * 100, 2)
    imbalance_ratio = round(neg_count / max(pos_count, 1), 2)
    
    print(f"\nFiltered Total Records (after removing expired/hospice IDs {expired_hospice_ids}): {filtered_total}")
    print(f"  - Positive Records (Readmitted <30 Days, y=1): {pos_count} ({pos_pct}%)")
    print(f"  - Negative Records (No / >30 Readmission, y=0): {neg_count} ({neg_pct}%)")
    print(f"  - Class Imbalance Ratio (Negative : Positive): {imbalance_ratio}:1")
    
    # Extract 10 genuine numerical / encoded features
    X = transform_dataframe(filtered_df)
    
    print("\nSplitting dataset into 80% train / 20% test (stratified)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("Scaling 10 features with StandardScaler...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Training RandomForestClassifier model (n_estimators=120, max_depth=10, class_weight='balanced')...")
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
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_proba)
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    print("\n==========================================================================")
    print("                 MODEL EVALUATION METRICS (v3.0.0)                        ")
    print("==========================================================================")
    print(f"Accuracy:            {acc:.4f}")
    print(f"Precision (<30):     {prec:.4f}")
    print(f"Recall/Sensitivity:  {rec:.4f}")
    print(f"F1-Score (<30):      {f1:.4f}")
    print(f"ROC-AUC Score:       {auc:.4f}")
    print(f"Confusion Matrix:    TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")
    print("==========================================================================\n")
    
    models_dir = os.path.join(script_dir, "models")
    os.makedirs(models_dir, exist_ok=True)
    model_path = os.path.join(models_dir, "model.pkl")
    scaler_path = os.path.join(models_dir, "scaler.pkl")
    version_path = os.path.join(models_dir, "model_version.json")
    
    joblib.dump(clf, model_path)
    joblib.dump(scaler, scaler_path)
    
    feature_importances = dict(zip(FEATURE_NAMES, clf.feature_importances_.round(4)))
    
    metadata = {
        "model_name": "HealthForecast-RandomForest-Classifier",
        "version": "v3.0.0",
        "dataset": "Diabetes 130-US Hospitals Dataset",
        "training_source": "backend/data/diabetic_data.csv",
        "algorithm": "RandomForestClassifier",
        "n_estimators": 120,
        "max_depth": 10,
        "feature_count": 10,
        "features": FEATURE_NAMES,
        "feature_importances": feature_importances,
        "metrics": {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1": round(float(f1), 4),
            "roc_auc": round(float(auc), 4),
            "confusion_matrix": cm
        },
        "artifact_files": ["model.pkl", "scaler.pkl"]
    }
    
    with open(version_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Saved model artifact to {model_path}")
    print(f"Saved scaler artifact to {scaler_path}")
    print(f"Saved version metadata to {version_path}")
    
    return metadata

if __name__ == "__main__":
    train_and_save_model()
