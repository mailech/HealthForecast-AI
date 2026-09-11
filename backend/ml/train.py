import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg') # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

# Ensure backend root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    roc_curve, precision_recall_curve
)

from app.core.config import settings
from ml.preprocessing import HealthForecastPreprocessor

ML_DIR = os.path.join(BASE_DIR, "ml")
MODELS_DIR = os.path.join(ML_DIR, "models")
PLOTS_DIR = os.path.join(ML_DIR, "plots")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(PLOTS_DIR, exist_ok=True)

def calculate_detailed_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> dict:
    """Calculate all required clinical & classification metrics."""
    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0) # Sensitivity
    f1 = f1_score(y_true, y_pred, zero_division=0)
    roc_auc = roc_auc_score(y_true, y_prob)
    pr_auc = average_precision_score(y_true, y_prob)
    
    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()
    
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    
    return {
        "accuracy": float(acc),
        "precision": float(prec),
        "recall_sensitivity": float(rec),
        "f1_score": float(f1),
        "roc_auc": float(roc_auc),
        "pr_auc": float(pr_auc),
        "specificity": float(specificity),
        "false_positive_rate": float(fpr),
        "confusion_matrix": {
            "tn": int(tn), "fp": int(fp),
            "fn": int(fn), "tp": int(tp)
        }
    }

def train_and_evaluate_models():
    print("================================================================================")
    print("HEALTHFORECAST AI — STEP 3: MODEL TRAINING & CLINICAL EVALUATION")
    print("================================================================================")
    
    # 1. Preprocessing & Grouped Split
    print("1. Loading raw dataset and applying HealthForecastPreprocessor...")
    preprocessor = HealthForecastPreprocessor()
    df_cleaned = preprocessor.load_and_clean_raw_dataset(settings.DATASET_PATH)
    
    print(f"Total Eligible Encounters (Filtered Expired/Hospice): {len(df_cleaned):,}")
    print("Splitting dataset using GroupShuffleSplit on 'patient_nbr' (80% Train / 20% Test)...")
    train_df, test_df = preprocessor.split_data_by_patient_group(df_cleaned, test_size=0.20, random_state=42)
    
    print(f"  - Train Encounters: {len(train_df):,} (Unique Patients: {train_df['patient_nbr'].nunique():,})")
    print(f"  - Test Encounters : {len(test_df):,} (Unique Patients: {test_df['patient_nbr'].nunique():,})")
    
    # Verify 0 patient overlap
    overlap = set(train_df['patient_nbr']).intersection(set(test_df['patient_nbr']))
    assert len(overlap) == 0, "Patient leakage detected!"
    print("  - Patient Leakage Status: VERIFIED CLEAN (0 patient overlap)")
    
    # Fit preprocessor on train_df, transform test_df
    X_train, y_train, feature_names = preprocessor.fit_transform(train_df)
    X_test, y_test = preprocessor.transform(test_df)
    
    print(f"Feature Matrix Shape: Train={X_train.shape}, Test={X_test.shape}")
    print(f"Train Target Balance: Class 0={(y_train==0).sum():,}, Class 1={(y_train==1).sum():,}")
    
    # Save preprocessor artifact
    preprocessor_path = os.path.join(MODELS_DIR, "preprocessor.joblib")
    preprocessor.save(preprocessor_path)
    print(f"Saved Preprocessor Artifact to: {preprocessor_path}")
    
    # Calculate class weight ratio for XGBoost scale_pos_weight
    neg_count, pos_count = (y_train == 0).sum(), (y_train == 1).sum()
    scale_pos_weight = neg_count / pos_count
    print(f"Imbalance Ratio (Class 0 / Class 1): {scale_pos_weight:.2f}")
    
    # 2. Train Model 1: Random Forest Classifier
    print("\n2. Training Model 1: Random Forest Classifier...")
    rf_model = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=10,
        min_samples_leaf=5,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    rf_model.fit(X_train, y_train)
    rf_path = os.path.join(MODELS_DIR, "random_forest_model.joblib")
    joblib.dump(rf_model, rf_path)
    print(f"Saved Random Forest Model to: {rf_path}")
    
    # 3. Train Model 2: XGBoost Classifier
    print("\n3. Training Model 2: XGBoost Classifier...")
    xgb_model = XGBClassifier(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric='logloss',
        n_jobs=-1
    )
    xgb_model.fit(X_train, y_train)
    xgb_path = os.path.join(MODELS_DIR, "xgboost_model.joblib")
    joblib.dump(xgb_model, xgb_path)
    print(f"Saved XGBoost Model to: {xgb_path}")
    
    # 4. Evaluate Models on Test Set
    print("\n4. Evaluating Models on Completely Untouched Test Set...")
    
    # RF Predictions
    rf_prob = rf_model.predict_proba(X_test)[:, 1]
    rf_pred = (rf_prob >= 0.50).astype(int)
    rf_metrics = calculate_detailed_metrics(y_test, rf_pred, rf_prob)
    
    # XGB Predictions
    xgb_prob = xgb_model.predict_proba(X_test)[:, 1]
    xgb_pred = (xgb_prob >= 0.50).astype(int)
    xgb_metrics = calculate_detailed_metrics(y_test, xgb_pred, xgb_prob)
    
    print("\n--- MODEL PERFORMANCE COMPARISON SUMMARY ---")
    print(f"{'Metric':<25} {'Random Forest':<18} {'XGBoost':<18}")
    print("-" * 65)
    print(f"{'Accuracy':<25} {rf_metrics['accuracy']:<18.4f} {xgb_metrics['accuracy']:<18.4f}")
    print(f"{'Precision (Class 1)':<25} {rf_metrics['precision']:<18.4f} {xgb_metrics['precision']:<18.4f}")
    print(f"{'Recall / Sensitivity (<30)':<25} {rf_metrics['recall_sensitivity']:<18.4f} {xgb_metrics['recall_sensitivity']:<18.4f}")
    print(f"{'F1-Score (<30)':<25} {rf_metrics['f1_score']:<18.4f} {xgb_metrics['f1_score']:<18.4f}")
    print(f"{'ROC-AUC':<25} {rf_metrics['roc_auc']:<18.4f} {xgb_metrics['roc_auc']:<18.4f}")
    print(f"{'PR-AUC':<25} {rf_metrics['pr_auc']:<18.4f} {xgb_metrics['pr_auc']:<18.4f}")
    print(f"{'Specificity':<25} {rf_metrics['specificity']:<18.4f} {xgb_metrics['specificity']:<18.4f}")
    print(f"{'False Positive Rate':<25} {rf_metrics['false_positive_rate']:<18.4f} {xgb_metrics['false_positive_rate']:<18.4f}")
    print("-" * 65)
    
    # 5. Generate Visualizations
    print("\n5. Generating Visualization Charts...")
    sns.set_theme(style="darkgrid")
    
    # ROC Curves
    plt.figure(figsize=(8, 6))
    rf_fpr, rf_tpr, _ = roc_curve(y_test, rf_prob)
    xgb_fpr, xgb_tpr, _ = roc_curve(y_test, xgb_prob)
    plt.plot(rf_fpr, rf_tpr, label=f"Random Forest (AUC = {rf_metrics['roc_auc']:.3f})", color="#0284c7", lw=2)
    plt.plot(xgb_fpr, xgb_tpr, label=f"XGBoost (AUC = {xgb_metrics['roc_auc']:.3f})", color="#059669", lw=2)
    plt.plot([0, 1], [0, 1], 'k--', label="Chance Baseline (AUC = 0.500)")
    plt.xlabel("False Positive Rate (1 - Specificity)")
    plt.ylabel("True Positive Rate (Recall / Sensitivity)")
    plt.title("ROC Curve Comparison — 30-Day Readmission Risk")
    plt.legend(loc="lower right")
    plt.tight_layout()
    roc_plot_path = os.path.join(PLOTS_DIR, "roc_curves.png")
    plt.savefig(roc_plot_path, dpi=300)
    plt.close()
    
    # Precision-Recall Curves
    plt.figure(figsize=(8, 6))
    rf_p, rf_r, _ = precision_recall_curve(y_test, rf_prob)
    xgb_p, xgb_r, _ = precision_recall_curve(y_test, xgb_prob)
    plt.plot(rf_r, rf_p, label=f"Random Forest (PR-AUC = {rf_metrics['pr_auc']:.3f})", color="#0284c7", lw=2)
    plt.plot(xgb_r, xgb_p, label=f"XGBoost (PR-AUC = {xgb_metrics['pr_auc']:.3f})", color="#059669", lw=2)
    baseline_pr = (y_test == 1).mean()
    plt.axhline(baseline_pr, color='k', linestyle='--', label=f"Baseline Prevalance ({baseline_pr:.3f})")
    plt.xlabel("Recall / Sensitivity (Class 1)")
    plt.ylabel("Precision (Class 1)")
    plt.title("Precision-Recall Curve Comparison — Early Readmission (<30d)")
    plt.legend(loc="upper right")
    plt.tight_layout()
    pr_plot_path = os.path.join(PLOTS_DIR, "pr_curves.png")
    plt.savefig(pr_plot_path, dpi=300)
    plt.close()
    
    # Confusion Matrices Heatmap
    fig, axes = plt.subplots(1, 2, figsize=(12, 5))
    sns.heatmap(confusion_matrix(y_test, rf_pred), annot=True, fmt="d", cmap="Blues", ax=axes[0],
                xticklabels=["No Early Readmit", "Readmit <30d"], yticklabels=["No Early Readmit", "Readmit <30d"])
    axes[0].set_title(f"Random Forest Confusion Matrix\nSensitivity = {rf_metrics['recall_sensitivity']:.2%}")
    axes[0].set_ylabel("Actual Outcome")
    axes[0].set_xlabel("Predicted Label")
    
    sns.heatmap(confusion_matrix(y_test, xgb_pred), annot=True, fmt="d", cmap="Greens", ax=axes[1],
                xticklabels=["No Early Readmit", "Readmit <30d"], yticklabels=["No Early Readmit", "Readmit <30d"])
    axes[1].set_title(f"XGBoost Confusion Matrix\nSensitivity = {xgb_metrics['recall_sensitivity']:.2%}")
    axes[1].set_ylabel("Actual Outcome")
    axes[1].set_xlabel("Predicted Label")
    plt.tight_layout()
    cm_plot_path = os.path.join(PLOTS_DIR, "confusion_matrices.png")
    plt.savefig(cm_plot_path, dpi=300)
    plt.close()
    
    # Top Feature Importances (XGBoost)
    xgb_imp = pd.Series(xgb_model.feature_importances_, index=feature_names).sort_values(ascending=False).head(15)
    plt.figure(figsize=(10, 6))
    sns.barplot(x=xgb_imp.values, y=xgb_imp.index, palette="viridis")
    plt.title("Top 15 Predictive Features — XGBoost Model")
    plt.xlabel("Feature Importance Weight")
    plt.tight_layout()
    fi_plot_path = os.path.join(PLOTS_DIR, "feature_importance_xgboost.png")
    plt.savefig(fi_plot_path, dpi=300)
    plt.close()
    
    # Save Metadata JSON
    metadata = {
        "dataset": "Diabetes 130-US Hospitals (dataset/diabetic_data.csv)",
        "train_samples": len(train_df),
        "test_samples": len(test_df),
        "features_count": len(feature_names),
        "random_forest": rf_metrics,
        "xgboost": xgb_metrics,
        "top_features_xgboost": xgb_imp.to_dict()
    }
    meta_path = os.path.join(MODELS_DIR, "model_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"\nSaved Visualizations to: {PLOTS_DIR}")
    print(f"Saved Model Metadata to: {meta_path}")
    print("\n================================================================================")
    print("STEP 3 TRAINING & EVALUATION COMPLETE — Ready for ML_MODEL_RESULTS.md")
    print("================================================================================")
    
    return metadata

if __name__ == "__main__":
    train_and_evaluate_models()
