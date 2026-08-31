"""
Stage 3: Patient Risk Prediction -- Model Training and Evaluation
Project: HealthForecast AI
Target : risk_target  (1 = High Risk / readmitted <30 days, 0 = Low Risk)
"""

import os
import pandas as pd
import numpy as np
import pickle
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report,
    roc_curve,
)
from xgboost import XGBClassifier

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))
SPLITS  = os.path.join(ROOT, "data", "splits")
MODELS  = os.path.join(ROOT, "models")
PLOTS   = os.path.join(ROOT, "outputs", "plots")

# -----------------------------------------------
# TASK 1 -- LOAD PREPARED DATA
# -----------------------------------------------
X_train = pd.read_csv(os.path.join(SPLITS, "X_train.csv"))
X_test  = pd.read_csv(os.path.join(SPLITS, "X_test.csv"))
y_train = pd.read_csv(os.path.join(SPLITS, "y_train.csv")).iloc[:, 0]
y_test  = pd.read_csv(os.path.join(SPLITS, "y_test.csv")).iloc[:, 0]

with open(os.path.join(MODELS, "preprocessor.pkl"), "rb") as f:
    preprocessor = pickle.load(f)

print("=" * 60)
print("TASK 1 -- DATA LOADED")
print("=" * 60)
print(f"X_train : {X_train.shape}")
print(f"X_test  : {X_test.shape}")
print(f"Features: {X_train.shape[1]}")
total_train = len(y_train)
total_test  = len(y_test)
tr_vc = y_train.value_counts()
te_vc = y_test.value_counts()
print(f"\ny_train distribution:")
print(f"  Low Risk  (0): {tr_vc[0]:,}  ({tr_vc[0]/total_train*100:.2f}%)")
print(f"  High Risk (1): {tr_vc[1]:,}  ({tr_vc[1]/total_train*100:.2f}%)")
print(f"\ny_test distribution:")
print(f"  Low Risk  (0): {te_vc[0]:,}  ({te_vc[0]/total_test*100:.2f}%)")
print(f"  High Risk (1): {te_vc[1]:,}  ({te_vc[1]/total_test*100:.2f}%)")

# -----------------------------------------------
# TASK 2 -- REMOVE CONSTANT (ZERO-VARIANCE) FEATURES
# After OHE in Stage 2, the original constant columns
# examide and citoglipton became single-value OHE columns.
# acetohexamide_No and troglitazone_No are also constant.
# These carry no information and are removed before training.
# -----------------------------------------------
zero_var_cols = [c for c in X_train.columns if X_train[c].nunique() <= 1]
X_train = X_train.drop(columns=zero_var_cols)
X_test  = X_test.drop(columns=zero_var_cols)

print("\n" + "=" * 60)
print("TASK 2 -- CONSTANT FEATURES REMOVED")
print("=" * 60)
print(f"Removed ({len(zero_var_cols)}): {zero_var_cols}")
print(f"Features remaining: {X_train.shape[1]}")

# -----------------------------------------------
# TASK 3 -- TRAIN THREE MODELS
# All models are fitted ONLY on training data.
# -----------------------------------------------

# scale_pos_weight for XGBoost: ratio of negative to positive
# in the TRAINING set only
scale_pos_weight = tr_vc[0] / tr_vc[1]
print(f"\nXGBoost scale_pos_weight (train only): {scale_pos_weight:.4f}")

models = {
    "Logistic Regression": LogisticRegression(
        class_weight="balanced",
        max_iter=1000,
        random_state=42,
        solver="lbfgs",
        n_jobs=-1,
    ),
    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        class_weight="balanced",
        max_depth=15,
        min_samples_leaf=10,
        random_state=42,
        n_jobs=-1,
    ),
    "XGBoost": XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric="logloss",
        verbosity=0,
    ),
}

print("\n" + "=" * 60)
print("TASK 3 / 4 -- TRAINING MODELS (train set only)")
print("=" * 60)

trained = {}
for name, model in models.items():
    print(f"  Training {name} ...", end=" ", flush=True)
    model.fit(X_train, y_train)
    trained[name] = model
    print("done.")

# -----------------------------------------------
# TASK 5 -- PREDICTIONS ON TEST SET
# -----------------------------------------------
predictions = {}
for name, model in trained.items():
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]   # probability of High Risk (class 1)
    predictions[name] = {"y_pred": y_pred, "y_prob": y_prob}

# -----------------------------------------------
# TASK 6 / 7 -- EVALUATION
# -----------------------------------------------
def evaluate(name, y_true, y_pred, y_prob):
    acc  = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec  = recall_score(y_true, y_pred, zero_division=0)
    f1   = f1_score(y_true, y_pred, zero_division=0)
    auc  = roc_auc_score(y_true, y_prob)
    cm   = confusion_matrix(y_true, y_pred)
    cr   = classification_report(y_true, y_pred,
                                  target_names=["Low Risk (0)", "High Risk (1)"])
    # Per-class metrics for High Risk (class 1)
    hr_prec = precision_score(y_true, y_pred, pos_label=1, zero_division=0)
    hr_rec  = recall_score(y_true, y_pred, pos_label=1, zero_division=0)
    hr_f1   = f1_score(y_true, y_pred, pos_label=1, zero_division=0)

    print(f"\n{'='*60}")
    print(f"  {name}")
    print(f"{'='*60}")
    print(f"  Accuracy  : {acc:.4f}")
    print(f"  Precision : {prec:.4f}  (macro)")
    print(f"  Recall    : {rec:.4f}  (macro)")
    print(f"  F1-score  : {f1:.4f}  (macro)")
    print(f"  ROC-AUC   : {auc:.4f}")
    print(f"\n  -- High Risk (class 1) --")
    print(f"  Precision : {hr_prec:.4f}")
    print(f"  Recall    : {hr_rec:.4f}")
    print(f"  F1-score  : {hr_f1:.4f}")
    print(f"\n  Confusion Matrix (rows=Actual, cols=Predicted):")
    print(f"                  Pred Low  Pred High")
    print(f"  Actual Low   :  {cm[0,0]:>8}  {cm[0,1]:>9}")
    print(f"  Actual High  :  {cm[1,0]:>8}  {cm[1,1]:>9}")
    print(f"\n  Classification Report:\n{cr}")

    return {
        "Accuracy": acc, "Precision": prec, "Recall": rec,
        "F1": f1, "ROC-AUC": auc,
        "HR_Precision": hr_prec, "HR_Recall": hr_rec, "HR_F1": hr_f1,
        "cm": cm,
    }

print("\n" + "=" * 60)
print("TASK 6 / 7 -- EVALUATION ON TEST SET")
print("=" * 60)

results = {}
for name in trained:
    results[name] = evaluate(
        name,
        y_test,
        predictions[name]["y_pred"],
        predictions[name]["y_prob"],
    )

# -----------------------------------------------
# TASK 8 -- COMPARISON TABLES
# -----------------------------------------------
print("\n" + "=" * 60)
print("TASK 8 -- MODEL COMPARISON TABLES")
print("=" * 60)

overall_df = pd.DataFrame({
    name: {
        "Accuracy":  round(r["Accuracy"],  4),
        "Precision": round(r["Precision"], 4),
        "Recall":    round(r["Recall"],    4),
        "F1":        round(r["F1"],        4),
        "ROC-AUC":   round(r["ROC-AUC"],   4),
    }
    for name, r in results.items()
}).T

highrisk_df = pd.DataFrame({
    name: {
        "HR Precision": round(r["HR_Precision"], 4),
        "HR Recall":    round(r["HR_Recall"],    4),
        "HR F1":        round(r["HR_F1"],        4),
    }
    for name, r in results.items()
}).T

print("\nOverall Metrics:")
print(overall_df.to_string())
print("\nHigh-Risk Class Metrics:")
print(highrisk_df.to_string())

# -----------------------------------------------
# TASK 9 -- ROC CURVES
# -----------------------------------------------
fig, ax = plt.subplots(figsize=(8, 6))
colors = {"Logistic Regression": "steelblue",
          "Random Forest": "darkorange",
          "XGBoost": "green"}

for name in trained:
    fpr, tpr, _ = roc_curve(y_test, predictions[name]["y_prob"])
    auc_val = results[name]["ROC-AUC"]
    ax.plot(fpr, tpr, label=f"{name} (AUC={auc_val:.4f})",
            color=colors[name], linewidth=2)

ax.plot([0, 1], [0, 1], "k--", linewidth=1, label="Random Classifier")
ax.set_xlabel("False Positive Rate")
ax.set_ylabel("True Positive Rate")
ax.set_title("ROC Curves -- Patient Risk Prediction (Test Set)")
ax.legend(loc="lower right")
ax.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(PLOTS, "roc_curves.png"), dpi=150)
plt.close()
print("\nSaved: roc_curves.png")

# -----------------------------------------------
# TASK 10 -- CONFUSION MATRICES
# -----------------------------------------------
fig, axes = plt.subplots(1, 3, figsize=(15, 4))
labels = ["Low Risk\n(0)", "High Risk\n(1)"]

for ax, name in zip(axes, trained):
    cm = results[name]["cm"]
    im = ax.imshow(cm, interpolation="nearest", cmap="Blues")
    ax.set_title(name, fontsize=11)
    ax.set_xticks([0, 1]); ax.set_yticks([0, 1])
    ax.set_xticklabels(labels); ax.set_yticklabels(labels)
    ax.set_xlabel("Predicted"); ax.set_ylabel("Actual")
    cell_labels = [["TN", "FP"], ["FN", "TP"]]
    for i in range(2):
        for j in range(2):
            ax.text(j, i, f"{cell_labels[i][j]}\n{cm[i,j]:,}",
                    ha="center", va="center",
                    color="white" if cm[i, j] > cm.max() / 2 else "black",
                    fontsize=10)

plt.suptitle("Confusion Matrices -- Test Set\n"
             "FN = High-Risk patient predicted as Low-Risk (missed case -- most costly error)",
             fontsize=10)
plt.tight_layout()
plt.savefig(os.path.join(PLOTS, "confusion_matrices.png"), dpi=150)
plt.close()
print("Saved: confusion_matrices.png")

print("\nFalse Negative explanation:")
print("  A False Negative means a HIGH-RISK patient was predicted as LOW-RISK.")
print("  In healthcare, this is the most dangerous error: the patient is missed,")
print("  receives no early intervention, and may be readmitted within 30 days.")
print("  Minimising FN (maximising High-Risk Recall) is the primary objective.")

# -----------------------------------------------
# TASK 11 -- SELECT BEST MODEL
# Priority: High-Risk Recall > High-Risk F1 > ROC-AUC > Precision
# -----------------------------------------------
print("\n" + "=" * 60)
print("TASK 11 -- BEST MODEL SELECTION")
print("=" * 60)

for name, r in results.items():
    print(f"  {name:22s}  HR-Recall={r['HR_Recall']:.4f}  "
          f"HR-F1={r['HR_F1']:.4f}  AUC={r['ROC-AUC']:.4f}")

# Rank by HR_Recall first, then HR_F1, then AUC
ranked = sorted(results.items(),
                key=lambda x: (x[1]["HR_Recall"], x[1]["HR_F1"], x[1]["ROC-AUC"]),
                reverse=True)
best_name = ranked[0][0]
best_model = trained[best_name]

print(f"\nBest model: {best_name}")
print(f"  High-Risk Recall    : {results[best_name]['HR_Recall']:.4f}")
print(f"  High-Risk F1        : {results[best_name]['HR_F1']:.4f}")
print(f"  ROC-AUC             : {results[best_name]['ROC-AUC']:.4f}")
print(f"\nRationale:")
print(f"  The primary goal is to identify actual high-risk patients (minimise FN).")
print(f"  {best_name} achieves the highest High-Risk Recall, meaning it correctly")
print(f"  flags the most patients who will be readmitted within 30 days.")
print(f"  In a clinical setting, missing a high-risk patient (FN) is more costly")
print(f"  than a false alarm (FP), so Recall is weighted above Precision.")

# -----------------------------------------------
# TASK 12 -- SAVE BEST MODEL
# -----------------------------------------------
with open(os.path.join(MODELS, "patient_risk_model.pkl"), "wb") as f:
    pickle.dump(best_model, f)

print(f"\nSaved: models/patient_risk_model.pkl  ({best_name})")
print("Preprocessor already saved as: models/preprocessor.pkl")

# -----------------------------------------------
# TASK 13 -- SINGLE PATIENT PREDICTION DEMO
# Use the first patient from X_test
# -----------------------------------------------
print("\n" + "=" * 60)
print("TASK 13 -- EXAMPLE PATIENT PREDICTION")
print("=" * 60)

patient_idx = 0
patient_features = X_test.drop(columns=zero_var_cols, errors="ignore").iloc[[patient_idx]]
# zero_var_cols already dropped from X_test above; use X_test directly
patient_features = X_test.iloc[[patient_idx]]

prob_high_risk = best_model.predict_proba(patient_features)[0, 1]
threshold = 0.50
risk_label = "HIGH RISK" if prob_high_risk >= threshold else "LOW RISK"
actual_label = "HIGH RISK" if y_test.iloc[patient_idx] == 1 else "LOW RISK"

print(f"  Patient index        : {patient_idx} (from test set)")
print(f"  Patient Risk Probability: {prob_high_risk*100:.2f}%")
print(f"  Risk Category        : {risk_label}")
print(f"  Actual Category      : {actual_label}")
print(f"\n  NOTE: The threshold of 0.50 is an initial default.")
print(f"  It may be lowered (e.g. 0.30) to increase High-Risk Recall")
print(f"  at the cost of more false positives, depending on clinical requirements.")

# -----------------------------------------------
# TASK 14 -- FINAL REPORT
# -----------------------------------------------
print("\n" + "=" * 60)
print("TASK 14 -- FINAL REPORT")
print("=" * 60)
print(f"  1.  Models trained               : Logistic Regression, Random Forest, XGBoost")
print(f"  2.  Training set size            : {len(y_train):,} rows")
print(f"  3.  Testing  set size            : {len(y_test):,} rows")
print(f"  4.  Class distribution (train)   : Low={tr_vc[0]:,} | High={tr_vc[1]:,}")
print(f"  5.  Imbalance handling           : class_weight='balanced' (LR, RF); "
      f"scale_pos_weight={scale_pos_weight:.2f} (XGB)")
print()
for name, r in results.items():
    print(f"  --- {name} ---")
    print(f"      Accuracy  : {r['Accuracy']:.4f}")
    print(f"      Precision : {r['Precision']:.4f}")
    print(f"      Recall    : {r['Recall']:.4f}")
    print(f"      F1        : {r['F1']:.4f}")
    print(f"      ROC-AUC   : {r['ROC-AUC']:.4f}")
    print(f"      HR Recall : {r['HR_Recall']:.4f}")
print()
print(f" 12.  Best model                   : {best_name}")
print(f" 13.  Selection reason             : Highest High-Risk Recall + F1 + AUC")
print(f" 14.  Example prediction           : Patient 0 -> {prob_high_risk*100:.2f}% -> {risk_label} (Actual: {actual_label})")
print(f" 15.  Saved model                  : patient_risk_model.pkl")
print("=" * 60)
print("Stage 3 complete.")
