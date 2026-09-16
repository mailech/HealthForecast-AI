#!/usr/bin/env python3
"""
HealthForecast AI - XGBoost 30-Day Hospital Readmission ML Pipeline
Dataset: Diabetes 130-US Hospitals (1999-2008)

Key Updates:
1. Data Preprocessing & Missing Values:
   - Explicitly handles '?' across all features.
   - For 'weight' (>96% missing): parses interval to midpoint numerical value,
     creates an explicit 'weight_was_missing' binary indicator, and imputes
     missing values via median/KNN imputation.
   - For 'payer_code' (~39% missing): applies Mode Imputation ('MC') and categorical encoding.
   - For 'medical_specialty' (~49% missing): applies Mode Imputation ('InternalMedicine')
     and collapses rare specialties into clinical categories.
2. Model Evaluation & Class Imbalance:
   - Focuses optimization on ROC-AUC and Recall (Sensitivity) over deceptive accuracy.
   - Incorporates 'scale_pos_weight' and optional SMOTE for positive class imbalance (<30 day readmission: ~11%).
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.metrics import (
    roc_auc_score,
    recall_score,
    precision_score,
    f1_score,
    accuracy_score,
    classification_report,
    confusion_matrix,
    average_precision_score
)
import xgboost as xgb

try:
    from imblearn.over_sampling import SMOTE
    SMOTE_AVAILABLE = True
except ImportError:
    SMOTE_AVAILABLE = False


def find_dataset_path():
    """Locate diabetic_data.csv in common backend data directory."""
    candidates = [
        "backend/data/diabetic_data.csv",
        "../backend/data/diabetic_data.csv",
        "/app/backend/data/diabetic_data.csv",
        "/app/data/diabetic_data.csv",
        "data/diabetic_data.csv",
        "../data/diabetic_data.csv",
        "diabetic_data.csv"
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    raise FileNotFoundError("Could not find diabetic_data.csv in search paths.")


def parse_weight_interval(val):
    """
    Parse weight intervals such as '[75-100)' to midpoint float 87.5.
    Returns np.nan if missing or invalid.
    """
    if pd.isna(val) or val == '?' or str(val).strip() == '':
        return np.nan
    clean = str(val).replace('[', '').replace(')', '').replace('>', '').replace('<', '').strip()
    if '-' in clean:
        parts = clean.split('-')
        try:
            low = float(parts[0])
            high = float(parts[1])
            return (low + high) / 2.0
        except ValueError:
            return np.nan
    try:
        return float(clean)
    except ValueError:
        return np.nan


def preprocess_data(df, use_knn_for_weight=False):
    """
    Preprocess raw diabetic dataset with explicit missing value imputation.
    """
    print(f"Initial raw dataset shape: {df.shape}")

    # 1. Replace '?' with np.nan across entire dataframe
    df = df.replace('?', np.nan)

    # 2. Inspect missing rates for key columns
    missing_stats = df.isnull().sum() / len(df) * 100
    print("\n--- Missing Value Proportions (Key Columns) ---")
    for col in ['weight', 'payer_code', 'medical_specialty', 'race']:
        if col in df.columns:
            print(f"  {col}: {missing_stats[col]:.2f}% missing")

    # 3. Explicit handling for 'weight'
    # Step 3a: Create explicit missingness indicator
    df['weight_was_missing'] = df['weight'].isna().astype(int)
    # Step 3b: Convert interval to numeric midpoints
    df['weight_numeric'] = df['weight'].apply(parse_weight_interval)
    
    # Step 3c: Impute numeric weight
    if use_knn_for_weight and df['weight_numeric'].notna().sum() > 50:
        print("Applying KNN Imputation on weight using clinical indicators...")
        knn_features = ['time_in_hospital', 'num_lab_procedures', 'num_medications', 'number_diagnoses', 'weight_numeric']
        knn = KNNImputer(n_neighbors=5)
        imputed_vals = knn.fit_transform(df[knn_features])
        df['weight_numeric'] = imputed_vals[:, -1]
    else:
        # Median imputation (75 kg typical for adult diabetic cohort)
        median_weight = df['weight_numeric'].median()
        if pd.isna(median_weight):
            median_weight = 75.0
        print(f"Applying Median Imputation on weight: {median_weight:.1f} kg")
        df['weight_numeric'] = df['weight_numeric'].fillna(median_weight)

    # 4. Explicit handling for 'payer_code' (Mode Imputation)
    mode_payer = df['payer_code'].mode()[0] if not df['payer_code'].dropna().empty else 'MC'
    print(f"Applying Mode Imputation on payer_code: '{mode_payer}'")
    df['payer_code'] = df['payer_code'].fillna(mode_payer)

    # 5. Explicit handling for 'medical_specialty' (Mode Imputation + Grouping)
    mode_specialty = df['medical_specialty'].mode()[0] if not df['medical_specialty'].dropna().empty else 'InternalMedicine'
    print(f"Applying Mode Imputation on medical_specialty: '{mode_specialty}'")
    df['medical_specialty'] = df['medical_specialty'].fillna(mode_specialty)

    # Top specialties grouping (collapse tail into 'Other')
    top_specialties = df['medical_specialty'].value_counts().nlargest(10).index
    df['medical_specialty'] = df['medical_specialty'].apply(lambda x: x if x in top_specialties else 'Other')

    # 6. Explicit handling for 'race' (Mode Imputation)
    mode_race = df['race'].mode()[0] if not df['race'].dropna().empty else 'Caucasian'
    df['race'] = df['race'].fillna(mode_race)

    # 7. Define Binary Target for 30-day Readmission
    # Positive class (1) = Readmitted within 30 days ('<30')
    # Negative class (0) = '>30' or 'NO'
    y = (df['readmitted'] == '<30').astype(int)
    pos_count = (y == 1).sum()
    neg_count = (y == 0).sum()
    print("\n--- Target Class Distribution (30-Day Readmission) ---")
    print(f"  Positive Class (<30 days): {pos_count:,} ({pos_count / len(y) * 100:.2f}%)")
    print(f"  Negative Class (>=30 days / NO): {neg_count:,} ({neg_count / len(y) * 100:.2f}%)")
    print(f"  Severe Imbalance Ratio (Neg / Pos): {neg_count / pos_count:.2f} to 1")

    # 8. Feature Selection & Categorical Encoding
    drop_cols = ['encounter_id', 'patient_nbr', 'weight', 'readmitted']
    X = df.drop(columns=[col for col in drop_cols if col in df.columns])

    # Encode categorical columns
    cat_cols = X.select_dtypes(include=['object']).columns
    encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        encoders[col] = le

    return X, y, neg_count / pos_count


def train_and_evaluate(X, y, scale_pos_weight_val, use_smote=False, epochs=100, learning_rate=0.05):
    """
    Train XGBoost with class imbalance handling and evaluate focused on ROC-AUC and Recall.
    """
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    if use_smote and SMOTE_AVAILABLE:
        print("\nApplying SMOTE (Synthetic Minority Over-sampling Technique) on training set...")
        smote = SMOTE(random_state=42)
        X_train, y_train = smote.fit_resample(X_train, y_train)
        print(f"Training set after SMOTE: {len(y_train):,} rows (Balanced: {(y_train == 1).sum():,} positive, {(y_train == 0).sum():,} negative)")
        current_scale_weight = 1.0  # SMOTE already balanced classes
    else:
        current_scale_weight = scale_pos_weight_val
        print(f"\nConfiguring XGBoost scale_pos_weight = {current_scale_weight:.2f}")

    # Initialize XGBoost Classifier optimized for ROC-AUC / Recall
    model = xgb.XGBClassifier(
        n_estimators=epochs,
        learning_rate=learning_rate,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=current_scale_weight,
        eval_metric='auc',
        random_state=42,
        use_label_encoder=False
    )

    print(f"Training XGBoost model (n_estimators={epochs}, lr={learning_rate})...")
    model.fit(X_train, y_train)

    # Predictions
    y_pred_proba = model.predict_proba(X_test)[:, 1]
    y_pred = model.predict(X_test)

    # Evaluation metrics
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    pr_auc = average_precision_score(y_test, y_pred_proba)
    recall = recall_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    accuracy = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred).tolist()

    print("\n" + "=" * 60)
    print("      HEALTHCARE MODEL EVALUATION: ROC-AUC & RECALL FOCUS")
    print("=" * 60)
    print(f"  * ROC-AUC Score:      {roc_auc:.4f}  <-- Primary Healthcare KPI")
    print(f"  * Sensitivity / Recall: {recall * 100:.2f}% <-- Detects True High-Risk Readmissions")
    print(f"  * PR-AUC (Precision-Recall): {pr_auc:.4f}")
    print(f"  * Precision:           {precision * 100:.2f}%")
    print(f"  * F1-Score:            {f1 * 100:.2f}%")
    print(f"  * Standard Accuracy:   {accuracy * 100:.2f}% (Deceptive due to ~11% positive prevalence)")
    print("\nConfusion Matrix [[TN, FP], [FN, TP]]:")
    print(f"  {cm}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['No Readmission / >30d', '<30d Readmission']))

    metrics = {
        "model_name": "XGBoost - 30-Day Readmission Risk Engine v3.0",
        "imbalance_strategy": "scale_pos_weight" if not use_smote else "SMOTE",
        "scale_pos_weight": round(float(scale_pos_weight_val), 2),
        "primary_metric": "ROC-AUC & Recall",
        "roc_auc": round(float(roc_auc), 4),
        "recall": round(float(recall * 100), 2),
        "precision": round(float(precision * 100), 2),
        "f1_score": round(float(f1 * 100), 2),
        "accuracy": round(float(accuracy * 100), 2),
        "pr_auc": round(float(pr_auc), 4),
        "confusion_matrix": cm,
        "imputation": {
            "weight": "Numeric Midpoint + Missingness Indicator + Median/KNN Imputation",
            "payer_code": "Mode Imputation ('MC')",
            "medical_specialty": "Mode Imputation ('InternalMedicine') + Clinical Grouping"
        }
    }

    return model, metrics


def main():
    csv_path = find_dataset_path()
    print(f"Loading diabetic dataset from: {csv_path}")
    df = pd.read_csv(csv_path)

    X, y, imbalance_ratio = preprocess_data(df)
    _, metrics = train_and_evaluate(
        X, y, scale_pos_weight_val=imbalance_ratio, use_smote=False, epochs=100, learning_rate=0.05
    )

    out_path = os.path.join(os.path.dirname(__file__), "model_metrics.json")
    with open(out_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"\nModel metrics successfully exported to: {out_path}")


if __name__ == "__main__":
    main()
