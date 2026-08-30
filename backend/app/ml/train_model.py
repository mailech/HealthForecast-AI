import os
import json
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
)
from sklearn.preprocessing import LabelEncoder

def train_readmission_model(
    csv_path: str = "d:/Infosys Internship project/HealthForecast AI/diabetic_data.csv",
    output_dir: str = None
):
    if output_dir is None:
        output_dir = os.path.dirname(os.path.abspath(__file__))
    
    os.makedirs(output_dir, exist_ok=True)
    model_file_path = os.path.join(output_dir, "readmission_model.joblib")
    metrics_file_path = os.path.join(output_dir, "model_metrics.json")
    
    print(f"Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)
    print(f"Dataset shape: {df.shape}")
    
    # 1. Clean missing values
    df.replace("?", np.nan, inplace=True)
    
    # 2. Define target variables
    # Binary target: 1 if readmitted <30 days, else 0
    df["target_30days"] = (df["readmitted"] == "<30").astype(int)
    
    # 3. Preprocess Age bracket
    age_map = {
        "[0-10)": 5, "[10-20)": 15, "[20-30)": 25, "[30-40)": 35, "[40-50)": 45,
        "[50-60)": 55, "[60-70)": 65, "[70-80)": 75, "[80-90)": 85, "[90-100)": 95
    }
    df["age_num"] = df["age"].map(age_map).fillna(65)
    
    # 4. Select features
    numeric_features = [
        "time_in_hospital", "num_lab_procedures", "num_procedures",
        "num_medications", "number_outpatient", "number_emergency",
        "number_inpatient", "number_diagnoses", "age_num"
    ]
    
    categorical_features = [
        "race", "gender", "max_glu_serum", "A1Cresult", "metformin",
        "glipizide", "glyburide", "pioglitazone", "rosiglitazone", "insulin",
        "change", "diabetesMed"
    ]
    
    # Fill missing categorical values with 'Unknown'
    for col in categorical_features:
        df[col] = df[col].fillna("Unknown")
        
    # Label encode categorical features
    encoders = {}
    encoded_cat_df = pd.DataFrame()
    for col in categorical_features:
        le = LabelEncoder()
        encoded_cat_df[col + "_enc"] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
        
    # Combine features
    X = pd.concat([df[numeric_features].reset_index(drop=True), encoded_cat_df.reset_index(drop=True)], axis=1)
    y = df["target_30days"]
    
    feature_names = list(X.columns)
    
    print(f"Features count: {len(feature_names)}")
    print(f"Target distribution (<30 readmissions): {y.value_counts().to_dict()}")
    
    # 5. Train / Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # 6. Train RandomForestClassifier
    print("Training RandomForestClassifier model...")
    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=14,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)
    
    # 7. Evaluate Model
    y_pred = clf.predict(X_test)
    y_proba = clf.predict_proba(X_test)[:, 1]
    
    acc = round(float(accuracy_score(y_test, y_pred)), 4)
    prec = round(float(precision_score(y_test, y_pred, zero_division=0)), 4)
    rec = round(float(recall_score(y_test, y_pred, zero_division=0)), 4)
    f1 = round(float(f1_score(y_test, y_pred, zero_division=0)), 4)
    auc = round(float(roc_auc_score(y_test, y_proba)), 4)
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    # Feature importances
    importances = clf.feature_importances_
    feat_imp = []
    readable_name_map = {
        "number_inpatient": "Prior Inpatient Visits",
        "time_in_hospital": "Hospitalization Duration (Days)",
        "num_lab_procedures": "Lab Procedures Count",
        "num_medications": "Medications Count",
        "number_emergency": "Emergency Visits Count",
        "number_outpatient": "Outpatient Visits Count",
        "number_diagnoses": "Number of Diagnoses",
        "age_num": "Patient Age Bracket",
        "num_procedures": "Clinical Procedures Count",
        "A1Cresult_enc": "HbA1c Test Results",
        "max_glu_serum_enc": "Glucose Serum Results",
        "insulin_enc": "Insulin Dosage Regimen",
        "metformin_enc": "Metformin Prescription",
        "change_enc": "Medication Dosage Change",
        "diabetesMed_enc": "Diabetes Medication Prescribed"
    }
    
    for name, imp in zip(feature_names, importances):
        readable = readable_name_map.get(name, name.replace("_enc", "").capitalize())
        feat_imp.append({"feature": readable, "raw_name": name, "importance": round(float(imp), 4)})
        
    feat_imp = sorted(feat_imp, key=lambda x: x["importance"], reverse=True)[:10]
    
    metrics = {
        "model_name": "RandomForest Clinical Readmission Classifier",
        "dataset": "Diabetes 130-US Hospitals (101,766 records)",
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1_score": f1,
        "roc_auc": auc,
        "confusion_matrix": cm,
        "feature_importances": feat_imp,
        "sample_size": len(df),
        "test_size": len(X_test)
    }
    
    print("\n--- Model Evaluation Results ---")
    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall:    {rec * 100:.2f}%")
    print(f"F1 Score:  {f1 * 100:.2f}%")
    print(f"ROC-AUC:   {auc * 100:.2f}%")
    
    # Save model pipeline bundle
    bundle = {
        "model": clf,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "encoders": encoders,
        "feature_names": feature_names
    }
    
    joblib.dump(bundle, model_file_path)
    with open(metrics_file_path, "w") as f:
        json.dump(metrics, f, indent=2)
        
    print(f"Saved trained model to: {model_file_path}")
    print(f"Saved evaluation metrics to: {metrics_file_path}")
    return metrics

if __name__ == "__main__":
    train_readmission_model()
