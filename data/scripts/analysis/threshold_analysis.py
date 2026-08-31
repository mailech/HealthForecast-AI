"""
Stage 4: Risk Probability Threshold Analysis and Final Risk Classification
Project: HealthForecast AI -- Patient Risk Prediction
Model  : Random Forest (patient_risk_model.pkl) -- NOT retrained
"""

import os
import pandas as pd
import numpy as np
import pickle
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, precision_recall_curve, average_precision_score,
)

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))
SPLITS  = os.path.join(ROOT, "data", "splits")
MODELS  = os.path.join(ROOT, "models")
PLOTS   = os.path.join(ROOT, "outputs", "plots")
REPORTS = os.path.join(ROOT, "outputs", "reports")

# -----------------------------------------------
# TASK 1 -- LOAD MODEL AND TEST DATA
# -----------------------------------------------
with open(os.path.join(MODELS, "patient_risk_model.pkl"), "rb") as f:
    model = pickle.load(f)

X_test_raw  = pd.read_csv(os.path.join(SPLITS, "X_test.csv"))
y_test      = pd.read_csv(os.path.join(SPLITS, "y_test.csv")).iloc[:, 0]
X_train_raw = pd.read_csv(os.path.join(SPLITS, "X_train.csv"))
zero_var_train = [c for c in X_train_raw.columns if X_train_raw[c].nunique() <= 1]
X_test = X_test_raw.drop(columns=zero_var_train, errors="ignore")

assert X_test.shape[1] == model.n_features_in_, (
    f"Feature mismatch: X_test has {X_test.shape[1]}, model expects {model.n_features_in_}"
)

# Generate probabilities -- no predict() used for threshold analysis
y_prob = model.predict_proba(X_test)[:, 1]   # P(High Risk)

print("=" * 60)
print("TASK 1 -- DATA AND MODEL LOADED")
print("=" * 60)
print(f"X_test shape     : {X_test.shape}")
print(f"y_test shape     : {y_test.shape}")
print(f"Model features   : {model.n_features_in_}")
print(f"y_prob range     : [{y_prob.min():.4f}, {y_prob.max():.4f}]")
vc = y_test.value_counts()
total = len(y_test)
print(f"y_test Low Risk  : {vc[0]:,}  ({vc[0]/total*100:.2f}%)")
print(f"y_test High Risk : {vc[1]:,}  ({vc[1]/total*100:.2f}%)")

# -----------------------------------------------
# TASK 2 -- EVALUATE MULTIPLE THRESHOLDS
# -----------------------------------------------
THRESHOLDS = [0.50, 0.45, 0.40, 0.35, 0.30, 0.25, 0.20]

rows = []
for t in THRESHOLDS:
    y_pred = (y_prob >= t).astype(int)
    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    rows.append({
        "Threshold":      t,
        "Accuracy":       round(accuracy_score(y_test, y_pred), 4),
        "HR Precision":   round(precision_score(y_test, y_pred, pos_label=1, zero_division=0), 4),
        "HR Recall":      round(recall_score(y_test, y_pred, pos_label=1, zero_division=0), 4),
        "HR F1":          round(f1_score(y_test, y_pred, pos_label=1, zero_division=0), 4),
        "False Positives": int(fp),
        "False Negatives": int(fn),
    })

threshold_df = pd.DataFrame(rows)

print("\n" + "=" * 60)
print("TASK 2 / 3 -- THRESHOLD COMPARISON TABLE")
print("=" * 60)
print(threshold_df.to_string(index=False))

# -----------------------------------------------
# TASK 4 -- PRECISION-RECALL CURVE
# -----------------------------------------------
precision_vals, recall_vals, pr_thresholds = precision_recall_curve(y_test, y_prob)
avg_precision = average_precision_score(y_test, y_prob)

fig, ax = plt.subplots(figsize=(8, 5))
ax.plot(recall_vals, precision_vals, color="darkorange", linewidth=2,
        label=f"Random Forest (AP = {avg_precision:.4f})")
ax.axhline(y=vc[1]/total, color="gray", linestyle="--", linewidth=1,
           label=f"Baseline (class prevalence = {vc[1]/total:.3f})")
ax.set_xlabel("Recall (High Risk)")
ax.set_ylabel("Precision (High Risk)")
ax.set_title("Precision-Recall Curve -- Patient Risk Prediction (Test Set)")
ax.legend(loc="upper right")
ax.grid(alpha=0.3)
plt.tight_layout()
plt.savefig(os.path.join(PLOTS, "precision_recall_curve.png"), dpi=150)
plt.close()
print("\nSaved: precision_recall_curve.png")
print(f"Average Precision (AP): {avg_precision:.4f}")

# -----------------------------------------------
# TASK 5 -- THRESHOLD ANALYSIS GRAPH
# -----------------------------------------------
fig, ax = plt.subplots(figsize=(9, 5))
ax.plot(threshold_df["Threshold"], threshold_df["HR Precision"],
        marker="o", color="steelblue",  linewidth=2, label="HR Precision")
ax.plot(threshold_df["Threshold"], threshold_df["HR Recall"],
        marker="s", color="darkorange", linewidth=2, label="HR Recall")
ax.plot(threshold_df["Threshold"], threshold_df["HR F1"],
        marker="^", color="green",      linewidth=2, label="HR F1")
ax.set_xlabel("Probability Threshold")
ax.set_ylabel("Score")
ax.set_title("High-Risk Precision / Recall / F1 vs Threshold (Test Set)")
ax.legend()
ax.grid(alpha=0.3)
ax.invert_xaxis()   # left = low threshold (high recall), right = high threshold (high precision)
plt.tight_layout()
plt.savefig(os.path.join(PLOTS, "threshold_analysis.png"), dpi=150)
plt.close()
print("Saved: threshold_analysis.png")

# -----------------------------------------------
# TASK 6 -- SELECT RECOMMENDED THRESHOLD
#
# Selection logic:
#   The primary goal is to catch high-risk patients (minimise FN).
#   We look for the threshold where HR F1 is maximised while
#   HR Recall stays >= 0.60 -- a reasonable clinical-proxy balance.
#   We do NOT simply pick the lowest threshold (that would flag
#   almost everyone as high-risk, making the tool useless).
#   We do NOT pick 0.50 (misses the borderline 44.79% patient seen in Stage 3).
#
#   From the table, we select the threshold with the best HR F1
#   subject to HR Recall >= 0.60.
# -----------------------------------------------
candidates = threshold_df[threshold_df["HR Recall"] >= 0.60]
if candidates.empty:
    # fallback: best HR F1 overall
    best_row = threshold_df.loc[threshold_df["HR F1"].idxmax()]
else:
    best_row = candidates.loc[candidates["HR F1"].idxmax()]

SELECTED_THRESHOLD = float(best_row["Threshold"])

print("\n" + "=" * 60)
print("TASK 6 -- THRESHOLD SELECTION")
print("=" * 60)
print(f"Selected threshold : {SELECTED_THRESHOLD}")
print(f"HR Precision       : {best_row['HR Precision']}")
print(f"HR Recall          : {best_row['HR Recall']}")
print(f"HR F1              : {best_row['HR F1']}")
print(f"False Positives    : {best_row['False Positives']:,}")
print(f"False Negatives    : {best_row['False Negatives']:,}")
print(f"\nRationale:")
print(f"  Threshold {SELECTED_THRESHOLD} achieves the best HR F1 while keeping")
print(f"  HR Recall >= 0.60, meaning at least 60% of actual high-risk patients")
print(f"  are correctly flagged. Lowering further increases recall but sharply")
print(f"  reduces precision, generating excessive false alarms.")
print(f"  Raising to 0.50 misses borderline patients (e.g. the 44.79% case).")
print(f"\n  IMPORTANT: This threshold is a PROJECT-LEVEL DEMONSTRATION CHOICE.")
print(f"  It is NOT clinically validated. A real deployment would require")
print(f"  clinical review, prospective validation, and regulatory approval.")

# -----------------------------------------------
# TASK 7 -- PREDICTION FUNCTION
# -----------------------------------------------
def predict_patient_risk(patient_features: pd.DataFrame,
                         threshold: float = SELECTED_THRESHOLD) -> dict:
    """
    Predict risk for one or more patients.

    Parameters
    ----------
    patient_features : pd.DataFrame
        Feature row(s) already preprocessed and zero-var columns dropped,
        matching the 261 features the model was trained on.
    threshold : float
        Probability cutoff for High Risk classification.

    Returns
    -------
    dict with keys: probability, category
    """
    prob = model.predict_proba(patient_features)[:, 1]
    categories = ["HIGH RISK" if p >= threshold else "LOW RISK" for p in prob]
    return {"probability": prob, "category": categories}

# -----------------------------------------------
# TASK 8 -- THREE RISK LEVELS
# Project-defined demonstration thresholds only.
# -----------------------------------------------
def three_level_risk(prob: float) -> str:
    """
    Map a probability to a three-level risk label.
    Thresholds are PROJECT-DEFINED DEMONSTRATION VALUES,
    NOT clinically validated.
      0.00 - 0.30 -> Low Risk
      0.30 - 0.60 -> Medium Risk
      0.60 - 1.00 -> High Risk
    """
    if prob >= 0.60:
        return "HIGH RISK"
    elif prob >= 0.30:
        return "MEDIUM RISK"
    else:
        return "LOW RISK"

print("\n" + "=" * 60)
print("TASK 8 -- THREE-LEVEL RISK CATEGORIES")
print("=" * 60)
print("  PROJECT-DEFINED DEMONSTRATION THRESHOLDS (not clinically validated):")
print("  0.00 - 0.30  ->  Low Risk")
print("  0.30 - 0.60  ->  Medium Risk")
print("  0.60 - 1.00  ->  High Risk")

# -----------------------------------------------
# TASK 9 -- TEST EXAMPLES
# Select patients to cover: TP, TN, FP, FN
# -----------------------------------------------
y_pred_selected = (y_prob >= SELECTED_THRESHOLD).astype(int)
actual          = y_test.values

# Find indices for each case type
tp_idx = np.where((y_pred_selected == 1) & (actual == 1))[0]
tn_idx = np.where((y_pred_selected == 0) & (actual == 0))[0]
fp_idx = np.where((y_pred_selected == 1) & (actual == 0))[0]
fn_idx = np.where((y_pred_selected == 0) & (actual == 1))[0]

# Pick one of each; pad with extra TPs if any category is empty
chosen_indices = []
labels_for_chosen = []
for idx_arr, label in [(tp_idx, "True Positive (correctly flagged High Risk)"),
                       (tn_idx, "True Negative (correctly flagged Low Risk)"),
                       (fp_idx, "False Positive (Low Risk flagged as High Risk)"),
                       (fn_idx, "False Negative (High Risk missed)")]:
    if len(idx_arr) > 0:
        chosen_indices.append(idx_arr[0])
        labels_for_chosen.append(label)

# Add a 5th example (second TP or TN)
for idx_arr, label in [(tp_idx, "True Positive #2"), (tn_idx, "True Negative #2")]:
    if len(idx_arr) > 1 and len(chosen_indices) < 5:
        chosen_indices.append(idx_arr[1])
        labels_for_chosen.append(label)

example_rows = []
for i, (idx, case_label) in enumerate(zip(chosen_indices, labels_for_chosen), 1):
    prob_val  = y_prob[idx]
    binary    = "HIGH RISK" if prob_val >= SELECTED_THRESHOLD else "LOW RISK"
    three_lv  = three_level_risk(prob_val)
    actual_lv = "HIGH RISK" if actual[idx] == 1 else "LOW RISK"
    example_rows.append({
        "Patient #":       i,
        "Test Index":      idx,
        "Risk Probability":f"{prob_val*100:.2f}%",
        "Binary Category": binary,
        "3-Level Category":three_lv,
        "Actual Risk":     actual_lv,
        "Case Type":       case_label,
    })

examples_df = pd.DataFrame(example_rows)

print("\n" + "=" * 60)
print("TASK 9 -- EXAMPLE PATIENT PREDICTIONS")
print(f"         (threshold = {SELECTED_THRESHOLD})")
print("=" * 60)
for _, row in examples_df.iterrows():
    print(f"\n  Patient #{int(row['Patient #'])}  [Test index {row['Test Index']}]  -- {row['Case Type']}")
    print(f"    Risk Probability : {row['Risk Probability']}")
    print(f"    Binary Category  : {row['Binary Category']}")
    print(f"    3-Level Category : {row['3-Level Category']}")
    print(f"    Actual Risk      : {row['Actual Risk']}")

# -----------------------------------------------
# TASK 10 -- SAVE OUTPUTS
# -----------------------------------------------
threshold_df.to_csv(os.path.join(REPORTS, "risk_threshold_results.csv"), index=False)
print("\nSaved: risk_threshold_results.csv")

# Final report
print("\n" + "=" * 60)
print("TASK 10 -- FINAL REPORT")
print("=" * 60)
print(f"  1.  Original threshold           : 0.50")
print(f"  2.  Tested thresholds            : {THRESHOLDS}")
print(f"  3.  Recommended threshold        : {SELECTED_THRESHOLD}")
print(f"  4.  HR Precision at threshold    : {best_row['HR Precision']}")
print(f"  5.  HR Recall at threshold       : {best_row['HR Recall']}")
print(f"  6.  HR F1 at threshold           : {best_row['HR F1']}")
print(f"  7.  False Positives              : {best_row['False Positives']:,}")
print(f"  8.  False Negatives              : {best_row['False Negatives']:,}")
print(f"  9.  Threshold selection reason   : Best HR F1 with HR Recall >= 0.60")
print(f"      (project-level demonstration choice, not clinically validated)")
print(f" 10.  Example predictions:")
for _, row in examples_df.iterrows():
    print(f"      Patient #{int(row['Patient #'])}: {row['Risk Probability']} -> "
          f"{row['Binary Category']} | Actual: {row['Actual Risk']} | {row['Case Type']}")
print(f"\n  Saved files:")
print(f"    patient_risk_model.pkl     (unchanged)")
print(f"    risk_threshold_results.csv")
print(f"    precision_recall_curve.png")
print(f"    threshold_analysis.png")
print("=" * 60)
print("Stage 4 complete.")
