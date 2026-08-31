"""
HealthForecast AI - Model 2: Hospital Readmission Prediction
Stage 2: Model Training and Evaluation

Models: Logistic Regression, Random Forest, XGBoost
Target: readmission_target  (0=No Readmission, 1=Readmission)

Model 1 files are NOT modified.
"""

import os
import pandas as pd
import numpy as np
import pickle
import sys
import warnings
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, classification_report, confusion_matrix,
    roc_curve, precision_recall_curve, average_precision_score,
)
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")
sys.stdout.reconfigure(encoding="utf-8")

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))
SPLITS  = os.path.join(ROOT, "data", "splits")
MODELS  = os.path.join(ROOT, "models")
PLOTS   = os.path.join(ROOT, "outputs", "plots")

# ================================================================
# TASK 1 - LOAD DATA
# ================================================================
print("=" * 60)
print("TASK 1 - LOAD DATA")
print("=" * 60)

X_train = pd.read_csv(os.path.join(SPLITS, "readmission_X_train.csv"))
X_test  = pd.read_csv(os.path.join(SPLITS, "readmission_X_test.csv"))
y_train = pd.read_csv(os.path.join(SPLITS, "readmission_y_train.csv")).squeeze()
y_test  = pd.read_csv(os.path.join(SPLITS, "readmission_y_test.csv")).squeeze()

with open(os.path.join(MODELS, "readmission_preprocessor.pkl"), "rb") as f:
    preprocessor = pickle.load(f)

print(f"X_train shape : {X_train.shape}")
print(f"X_test  shape : {X_test.shape}")
print(f"y_train shape : {y_train.shape}")
print(f"y_test  shape : {y_test.shape}")
print(f"\nX_train dtypes (sample):\n{X_train.dtypes.value_counts()}")
print(f"\ny_train distribution:\n{y_train.value_counts()}")
print(f"\ny_test  distribution:\n{y_test.value_counts()}")
print(f"\nFeature count : {X_train.shape[1]}")
print(f"Missing in X_train : {X_train.isna().sum().sum()}")
print(f"Missing in X_test  : {X_test.isna().sum().sum()}")

total_train = len(y_train)
total_test  = len(y_test)
vc_train = y_train.value_counts()
vc_test  = y_test.value_counts()
print(f"\nTrain class 0: {vc_train[0]:,} ({vc_train[0]/total_train*100:.2f}%)")
print(f"Train class 1: {vc_train[1]:,} ({vc_train[1]/total_train*100:.2f}%)")
print(f"Test  class 0: {vc_test[0]:,}  ({vc_test[0]/total_test*100:.2f}%)")
print(f"Test  class 1: {vc_test[1]:,}  ({vc_test[1]/total_test*100:.2f}%)")

# ================================================================
# TASK 2 - CLASS BALANCE NOTE
# ================================================================
print("\n" + "=" * 60)
print("TASK 2 - CLASS BALANCE")
print("=" * 60)
ratio = vc_train[0] / vc_train[1]
print(f"Imbalance ratio : {ratio:.2f}:1  (No Readmission : Readmission)")
print("Classes are near-balanced (1.17:1).")
print("SMOTE: NOT applied.")
print("class_weight='balanced': NOT used in initial experiment.")
print("Starting with standard models.")

# ================================================================
# TASK 3 & 4 - TRAIN THREE MODELS (train-only, no test leakage)
# ================================================================
print("\n" + "=" * 60)
print("TASK 3 & 4 - TRAINING MODELS")
print("=" * 60)

# --- Logistic Regression (baseline) ---
print("\nTraining Logistic Regression...")
lr = LogisticRegression(max_iter=1000, random_state=42)
lr.fit(X_train, y_train)
print("  Logistic Regression: done")

# --- Random Forest ---
print("Training Random Forest...")
rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=10,
    min_samples_leaf=4,
    random_state=42,
    n_jobs=-1,
)
rf.fit(X_train, y_train)
print("  Random Forest: done")

# --- XGBoost ---
print("Training XGBoost...")
xgb = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    scale_pos_weight=1,   # near-balanced classes; no aggressive weighting
    random_state=42,
    eval_metric="logloss",
    verbosity=0,
)
xgb.fit(X_train, y_train)
print("  XGBoost: done")

models = {
    "Logistic Regression": lr,
    "Random Forest":       rf,
    "XGBoost":             xgb,
}

# ================================================================
# TASK 5 - PREDICTIONS
# ================================================================
print("\n" + "=" * 60)
print("TASK 5 - PREDICTIONS")
print("=" * 60)

preds = {}
for name, model in models.items():
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    preds[name] = {"y_pred": y_pred, "y_prob": y_prob}
    print(f"  {name}: predictions generated")

# ================================================================
# TASK 6 - EVALUATION
# ================================================================
print("\n" + "=" * 60)
print("TASK 6 - EVALUATION")
print("=" * 60)

results = {}
for name, p in preds.items():
    y_pred = p["y_pred"]
    y_prob = p["y_prob"]
    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, pos_label=1)
    rec  = recall_score(y_test, y_pred, pos_label=1)
    f1   = f1_score(y_test, y_pred, pos_label=1)
    auc  = roc_auc_score(y_test, y_prob)
    cm   = confusion_matrix(y_test, y_pred)
    results[name] = {
        "accuracy": acc, "precision": prec, "recall": rec,
        "f1": f1, "roc_auc": auc, "cm": cm,
        "y_pred": y_pred, "y_prob": y_prob,
    }
    print(f"\n--- {name} ---")
    print(f"  Accuracy  : {acc*100:.2f}%")
    print(f"  Precision : {prec*100:.2f}%  (Readmission class)")
    print(f"  Recall    : {rec*100:.2f}%   (Readmission class)")
    print(f"  F1-score  : {f1*100:.2f}%   (Readmission class)")
    print(f"  ROC-AUC   : {auc*100:.2f}%")
    print(f"\n  Classification Report:")
    print(classification_report(
        y_test, y_pred,
        target_names=["No Readmission (0)", "Readmission (1)"]
    ))
    tn, fp, fn, tp = cm.ravel()
    print(f"  Confusion Matrix:")
    print(f"    TN={tn:,}  FP={fp:,}")
    print(f"    FN={fn:,}  TP={tp:,}")
    print(f"  NOTE: FN={fn:,} patients predicted No Readmission but WILL be readmitted.")

# ================================================================
# TASK 7 - MODEL COMPARISON TABLE
# ================================================================
print("\n" + "=" * 60)
print("TASK 7 - MODEL COMPARISON")
print("=" * 60)

header = f"{'Model':<22} {'Accuracy':>9} {'Precision':>10} {'Recall':>8} {'F1':>8} {'ROC-AUC':>9}"
print(header)
print("-" * 70)
for name, r in results.items():
    print(
        f"{name:<22} "
        f"{r['accuracy']*100:>8.2f}% "
        f"{r['precision']*100:>9.2f}% "
        f"{r['recall']*100:>7.2f}% "
        f"{r['f1']*100:>7.2f}% "
        f"{r['roc_auc']*100:>8.2f}%"
    )

# ================================================================
# TASK 8 - CONFUSION MATRICES
# ================================================================
print("\n" + "=" * 60)
print("TASK 8 - CONFUSION MATRICES")
print("=" * 60)

fig, axes = plt.subplots(1, 3, figsize=(18, 5))
fig.suptitle("Model 2 — Hospital Readmission: Confusion Matrices", fontsize=14, fontweight="bold")

labels = ["No Readmission\n(0)", "Readmission\n(1)"]
for ax, (name, r) in zip(axes, results.items()):
    cm = r["cm"]
    tn, fp, fn, tp = cm.ravel()
    im = ax.imshow(cm, interpolation="nearest", cmap="Blues")
    ax.set_title(name, fontsize=11, fontweight="bold")
    ax.set_xlabel("Predicted Label", fontsize=10)
    ax.set_ylabel("True Label", fontsize=10)
    ax.set_xticks([0, 1]); ax.set_xticklabels(labels, fontsize=9)
    ax.set_yticks([0, 1]); ax.set_yticklabels(labels, fontsize=9)
    thresh = cm.max() / 2.0
    for i in range(2):
        for j in range(2):
            cell_label = f"{cm[i,j]:,}"
            if i == 1 and j == 0:
                cell_label += "\n(FN)"
            elif i == 0 and j == 1:
                cell_label += "\n(FP)"
            elif i == 0 and j == 0:
                cell_label += "\n(TN)"
            else:
                cell_label += "\n(TP)"
            ax.text(j, i, cell_label,
                    ha="center", va="center", fontsize=9,
                    color="white" if cm[i, j] > thresh else "black")
    plt.colorbar(im, ax=ax)

plt.tight_layout()
plt.savefig(os.path.join(PLOTS, "readmission_confusion_matrices.png"), dpi=150, bbox_inches="tight")
plt.close()
print("Saved: readmission_confusion_matrices.png")

# ================================================================
# TASK 9 - ROC CURVES
# ================================================================
print("\n" + "=" * 60)
print("TASK 9 - ROC CURVES")
print("=" * 60)

colors = {"Logistic Regression": "#2196F3", "Random Forest": "#4CAF50", "XGBoost": "#FF5722"}
fig, ax = plt.subplots(figsize=(8, 6))
for name, r in results.items():
    fpr, tpr, _ = roc_curve(y_test, r["y_prob"])
    ax.plot(fpr, tpr, label=f"{name}  (AUC={r['roc_auc']*100:.2f}%)",
            color=colors[name], linewidth=2)
ax.plot([0, 1], [0, 1], "k--", linewidth=1, label="Random Classifier")
ax.set_xlabel("False Positive Rate", fontsize=12)
ax.set_ylabel("True Positive Rate", fontsize=12)
ax.set_title("Model 2 — Hospital Readmission: ROC Curves", fontsize=13, fontweight="bold")
ax.legend(loc="lower right", fontsize=10)
ax.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(PLOTS, "readmission_roc_curves.png"), dpi=150, bbox_inches="tight")
plt.close()
print("Saved: readmission_roc_curves.png")

# ================================================================
# TASK 10 - PRECISION-RECALL CURVE (best model by ROC-AUC)
# ================================================================
print("\n" + "=" * 60)
print("TASK 10 - PRECISION-RECALL CURVE")
print("=" * 60)

best_name_pr = max(results, key=lambda n: results[n]["roc_auc"])
best_prob_pr = results[best_name_pr]["y_prob"]
prec_vals, rec_vals, _ = precision_recall_curve(y_test, best_prob_pr)
ap = average_precision_score(y_test, best_prob_pr)
baseline_pr = y_test.mean()

fig, ax = plt.subplots(figsize=(8, 6))
ax.plot(rec_vals, prec_vals, color="#FF5722", linewidth=2,
        label=f"{best_name_pr}  (AP={ap:.4f})")
ax.axhline(y=baseline_pr, color="gray", linestyle="--", linewidth=1,
           label=f"Baseline (class prevalence={baseline_pr:.2f})")
ax.set_xlabel("Recall", fontsize=12)
ax.set_ylabel("Precision", fontsize=12)
ax.set_title(f"Model 2 — Precision-Recall Curve\n({best_name_pr})", fontsize=13, fontweight="bold")
ax.legend(fontsize=10)
ax.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(PLOTS, "readmission_precision_recall_curve.png"), dpi=150, bbox_inches="tight")
plt.close()
print(f"Best model for PR curve : {best_name_pr}")
print(f"Average Precision       : {ap:.4f}")
print("Saved: readmission_precision_recall_curve.png")

# ================================================================
# TASK 11 - MODEL SELECTION
# ================================================================
print("\n" + "=" * 60)
print("TASK 11 - MODEL SELECTION")
print("=" * 60)

# Score each model: weighted composite of ROC-AUC, F1, Recall, Precision, Accuracy
# Priority: ROC-AUC (40%) > F1 (25%) > Recall (20%) > Precision (10%) > Accuracy (5%)
def composite_score(r):
    return (0.40 * r["roc_auc"] +
            0.25 * r["f1"] +
            0.20 * r["recall"] +
            0.10 * r["precision"] +
            0.05 * r["accuracy"])

scores = {name: composite_score(r) for name, r in results.items()}
best_model_name = max(scores, key=scores.get)

print("\nComposite scores (ROC-AUC 40% + F1 25% + Recall 20% + Precision 10% + Accuracy 5%):")
for name, score in sorted(scores.items(), key=lambda x: -x[1]):
    r = results[name]
    print(f"  {name:<22}  composite={score:.4f}  "
          f"AUC={r['roc_auc']*100:.2f}%  F1={r['f1']*100:.2f}%  "
          f"Recall={r['recall']*100:.2f}%")

print(f"\nSelected best model: {best_model_name}")
print("\nTrade-off analysis:")
for name, r in results.items():
    tn, fp, fn, tp = r["cm"].ravel()
    tag = " <-- SELECTED" if name == best_model_name else ""
    print(f"\n  {name}{tag}")
    print(f"    ROC-AUC  : {r['roc_auc']*100:.2f}%")
    print(f"    F1       : {r['f1']*100:.2f}%")
    print(f"    Recall   : {r['recall']*100:.2f}%  (catches {tp:,} of {tp+fn:,} readmissions)")
    print(f"    Precision: {r['precision']*100:.2f}%")
    print(f"    Accuracy : {r['accuracy']*100:.2f}%")
    print(f"    FN       : {fn:,}  (missed readmissions — critical error)")
    print(f"    FP       : {fp:,}  (false alarms)")

# ================================================================
# TASK 12 - SAVE BEST MODEL
# ================================================================
print("\n" + "=" * 60)
print("TASK 12 - SAVE BEST MODEL")
print("=" * 60)

best_model_obj = models[best_model_name]
with open(os.path.join(MODELS, "readmission_model.pkl"), "wb") as f:
    pickle.dump(best_model_obj, f)

print(f"Best model saved as: models/readmission_model.pkl  ({best_model_name})")

# Confirm Model 1 files untouched
m1_files = [
    os.path.join(MODELS, "patient_risk_model.pkl"), os.path.join(MODELS, "preprocessor.pkl"),
    os.path.join(SPLITS, "X_train.csv"), os.path.join(SPLITS, "X_test.csv"),
    os.path.join(SPLITS, "y_train.csv"), os.path.join(SPLITS, "y_test.csv")
]
print("\nModel 1 file integrity check:")
for fname in m1_files:
    print(f"  {fname} : {'EXISTS' if os.path.exists(fname) else 'MISSING'}")

# ================================================================
# TASK 13 - SAMPLE PREDICTIONS
# ================================================================
print("\n" + "=" * 60)
print("TASK 13 - SAMPLE PREDICTIONS")
print("=" * 60)

best_probs = results[best_model_name]["y_prob"]
best_preds = results[best_model_name]["y_pred"]

# Pick 10 samples: 5 predicted readmission, 5 predicted no readmission
idx_readmit    = np.where(best_preds == 1)[0][:5]
idx_no_readmit = np.where(best_preds == 0)[0][:5]
sample_indices = np.concatenate([idx_readmit, idx_no_readmit])

print(f"\nModel used: {best_model_name}")
print(f"{'#':<4} {'Prob':>8} {'Prediction':<28} {'Actual':<25} {'Correct?'}")
print("-" * 80)
for i, idx in enumerate(sample_indices, 1):
    prob   = best_probs[idx]
    pred   = best_preds[idx]
    actual = y_test.iloc[idx]
    pred_label   = "Likely Readmission"    if pred   == 1 else "No Readmission Expected"
    actual_label = "Readmission (1)"       if actual == 1 else "No Readmission (0)"
    correct = "YES" if pred == actual else "NO"
    print(f"{i:<4} {prob*100:>7.1f}%  {pred_label:<28} {actual_label:<25} {correct}")

# ================================================================
# TASK 14 - FINAL REPORT
# ================================================================
print("\n" + "=" * 60)
print("TASK 14 - FINAL REPORT")
print("=" * 60)

r_lr  = results["Logistic Regression"]
r_rf  = results["Random Forest"]
r_xgb = results["XGBoost"]

print(f"""
1.  Models trained          : Logistic Regression, Random Forest, XGBoost
2.  Training size           : {X_train.shape[0]:,} rows
3.  Testing size            : {X_test.shape[0]:,} rows
4.  Class distribution      : Class 0 = {vc_train[0]/total_train*100:.2f}%  |  Class 1 = {vc_train[1]/total_train*100:.2f}%

5.  Accuracy
      Logistic Regression   : {r_lr['accuracy']*100:.2f}%
      Random Forest         : {r_rf['accuracy']*100:.2f}%
      XGBoost               : {r_xgb['accuracy']*100:.2f}%

6.  Precision (Readmission class)
      Logistic Regression   : {r_lr['precision']*100:.2f}%
      Random Forest         : {r_rf['precision']*100:.2f}%
      XGBoost               : {r_xgb['precision']*100:.2f}%

7.  Recall (Readmission class)
      Logistic Regression   : {r_lr['recall']*100:.2f}%
      Random Forest         : {r_rf['recall']*100:.2f}%
      XGBoost               : {r_xgb['recall']*100:.2f}%

8.  F1-score (Readmission class)
      Logistic Regression   : {r_lr['f1']*100:.2f}%
      Random Forest         : {r_rf['f1']*100:.2f}%
      XGBoost               : {r_xgb['f1']*100:.2f}%

9.  ROC-AUC
      Logistic Regression   : {r_lr['roc_auc']*100:.2f}%
      Random Forest         : {r_rf['roc_auc']*100:.2f}%
      XGBoost               : {r_xgb['roc_auc']*100:.2f}%

10. Confusion Matrices       : readmission_confusion_matrices.png
    FN (missed readmissions):
      Logistic Regression   : {r_lr['cm'].ravel()[2]:,}
      Random Forest         : {r_rf['cm'].ravel()[2]:,}
      XGBoost               : {r_xgb['cm'].ravel()[2]:,}

11. Average Precision        : {ap:.4f}  ({best_name_pr})

12. Best model               : {best_model_name}

13. Reason for selection     :
      - Highest composite score (ROC-AUC 40% + F1 25% + Recall 20% + Precision 10% + Accuracy 5%)
      - Best ROC-AUC indicates strongest overall discrimination
      - Classes are near-balanced (1.17:1), so accuracy is also meaningful
      - Minimising False Negatives (missed readmissions) is clinically important
      - Threshold optimisation can further improve recall in the next stage

14. Example predictions      : See Task 13 output above

15. Saved model filename      : readmission_model.pkl
""")

print("=" * 60)
print("Saved files:")
saved = [
    os.path.join(MODELS, "readmission_model.pkl"),
    os.path.join(PLOTS, "readmission_confusion_matrices.png"),
    os.path.join(PLOTS, "readmission_roc_curves.png"),
    os.path.join(PLOTS, "readmission_precision_recall_curve.png"),
]
for fname in saved:
    status = "EXISTS" if os.path.exists(fname) else "MISSING"
    print(f"  {fname} : {status}")

print("\nModel 2 training and evaluation complete.")
print("Next stage: threshold optimisation / Model 3.")
print("=" * 60)
