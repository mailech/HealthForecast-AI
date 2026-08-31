"""
Treatment Outcome Analytics - Statistical Tests & Export
Tasks 12-17: statistical summaries, CSV/JSON output.
No ML model. No causal claims.
"""

import os
import pandas as pd
import numpy as np
import json
import warnings
from scipy.stats import chi2_contingency, kruskal

warnings.filterwarnings("ignore")

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))
REPORTS = os.path.join(ROOT, "outputs", "reports")

MAJOR_MEDS = ["insulin", "metformin", "glipizide", "glyburide",
              "pioglitazone", "rosiglitazone"]


def cramers_v(chi2, n, r, c):
    return np.sqrt(chi2 / (n * (min(r, c) - 1)))


# ── TASK 12 ──────────────────────────────────────────────────────────────────
def run_statistical_tests(df, med_df, change_stats):
    print("\n" + "=" * 60)
    print("TASK 12 - STATISTICAL TESTS SUMMARY")
    print("=" * 60)
    results = []

    # Test 1: medication change vs readmission (already computed)
    results.append({
        "test": "chi2",
        "variable_1": "change",
        "variable_2": "readmitted",
        "chi2": change_stats["chi2"],
        "p_value": change_stats["p_value"],
        "cramers_v": change_stats["cramers_v"],
        "dof": change_stats["dof"],
        "significant": change_stats["p_value"] < 0.05,
        "note": "Observational association only",
    })

    # Test 2: diabetesMed vs readmission
    if "diabetesMed" in df.columns:
        ct = pd.crosstab(df["diabetesMed"], df["readmitted"])
        chi2, p, dof, _ = chi2_contingency(ct)
        cv = cramers_v(chi2, len(df), ct.shape[0], ct.shape[1])
        results.append({
            "test": "chi2",
            "variable_1": "diabetesMed",
            "variable_2": "readmitted",
            "chi2": round(chi2, 4),
            "p_value": round(p, 6),
            "cramers_v": round(cv, 4),
            "dof": dof,
            "significant": p < 0.05,
            "note": "Observational association only",
        })

    # Test 3: Kruskal-Wallis — time_in_hospital across readmission groups
    groups = [df.loc[df["readmitted"] == g, "time_in_hospital"].dropna()
              for g in df["readmitted"].unique()]
    groups = [g for g in groups if len(g) > 0]
    if len(groups) >= 2:
        stat, p = kruskal(*groups)
        results.append({
            "test": "kruskal",
            "variable_1": "time_in_hospital",
            "variable_2": "readmitted",
            "chi2": round(stat, 4),
            "p_value": round(p, 6),
            "cramers_v": None,
            "dof": None,
            "significant": p < 0.05,
            "note": "Non-parametric test; observational only",
        })

    # Test 4: age vs readmission (chi2 on binned age)
    if "age" in df.columns:
        ct = pd.crosstab(df["age"], df["readmitted"])
        chi2, p, dof, _ = chi2_contingency(ct)
        cv = cramers_v(chi2, len(df), ct.shape[0], ct.shape[1])
        results.append({
            "test": "chi2",
            "variable_1": "age",
            "variable_2": "readmitted",
            "chi2": round(chi2, 4),
            "p_value": round(p, 6),
            "cramers_v": round(cv, 4),
            "dof": dof,
            "significant": p < 0.05,
            "note": "Observational association only",
        })

    stats_df = pd.DataFrame(results)
    print(f"\n{'Test':<10} {'Var1':<20} {'Var2':<12} {'chi2/stat':>10} {'p-value':>10} {'Sig':>5}")
    print("-" * 72)
    for _, r in stats_df.iterrows():
        sig = "YES" if r["significant"] else "no"
        print(f"{r['test']:<10} {r['variable_1']:<20} {r['variable_2']:<12} "
              f"{r['chi2']:>10.4f} {r['p_value']:>10.6f} {sig:>5}")
    print("\nNOTE: All tests are observational. No causal inference is made.")
    return stats_df


# ── TASK 13 ──────────────────────────────────────────────────────────────────
def save_csv_outputs(med_df, readmit_df, util_df, diag_df, age_df, spec_df):
    print("\n" + "=" * 60)
    print("TASK 13 - SAVE CSV OUTPUTS")
    print("=" * 60)
    files = {
        os.path.join(REPORTS, "treatment_medication_summary.csv"): med_df,
        os.path.join(REPORTS, "treatment_readmission_summary.csv"): readmit_df,
        os.path.join(REPORTS, "treatment_utilization_summary.csv"): util_df,
        os.path.join(REPORTS, "treatment_diagnosis_summary.csv"): diag_df,
        os.path.join(REPORTS, "treatment_age_summary.csv"): age_df,
        os.path.join(REPORTS, "treatment_specialty_summary.csv"): spec_df,
    }
    for fname, df in files.items():
        df.to_csv(fname, index=False)
        print(f"  Saved: {os.path.basename(fname)}  ({len(df)} rows)")
    return [os.path.basename(f) for f in files.keys()]


# ── TASK 14 ──────────────────────────────────────────────────────────────────
def save_analytics_results(df, med_df, readmit_df, stats_df):
    print("\n" + "=" * 60)
    print("TASK 14 - SAVE ANALYTICS RESULTS CSV")
    print("=" * 60)
    rows = []
    for _, r in med_df.iterrows():
        rows.append({
            "analysis_type": "medication_usage",
            "category": r["medication"],
            "metric": "prescription_pct",
            "value": r["prescription_pct"],
        })
        rows.append({
            "analysis_type": "medication_usage",
            "category": r["medication"],
            "metric": "dose_changed_pct",
            "value": r["dose_changed_pct"],
        })
    for _, r in readmit_df.iterrows():
        rows.append({
            "analysis_type": "readmission_by_medication",
            "category": f"{r['medication']}_{r['group']}",
            "metric": "overall_readmit_pct",
            "value": r["overall_readmit_pct"],
        })
    results_df = pd.DataFrame(rows)
    results_df.to_csv(os.path.join(REPORTS, "treatment_analytics_results.csv"), index=False)
    print(f"  Saved: treatment_analytics_results.csv  ({len(results_df)} rows)")
    return results_df


# ── TASK 15 ──────────────────────────────────────────────────────────────────
def save_summary_json(df, med_df, stats_df, csv_files):
    print("\n" + "=" * 60)
    print("TASK 15 - SAVE SUMMARY JSON")
    print("=" * 60)
    top_med = med_df.iloc[0]["medication"] if not med_df.empty else "N/A"
    top_chg = (med_df.sort_values("dose_changed_pct", ascending=False)
               .iloc[0]["medication"] if not med_df.empty else "N/A")
    summary = {
        "analysis": "Treatment Outcome Analytics",
        "note": "Observational associations only. No causal claims.",
        "total_encounters": int(len(df)),
        "medications_analyzed": int(len(med_df)),
        "statistical_tests_performed": int(len(stats_df)),
        "most_prescribed_medication": top_med,
        "most_dose_changed_medication": top_chg,
        "readmission_categories": df["readmitted"].unique().tolist(),
        "generated_csv_files": csv_files + ["treatment_analytics_results.csv"],
        "model1_model2_untouched": True,
    }
    with open(os.path.join(REPORTS, "treatment_analytics_summary.json"), "w") as f:
        json.dump(summary, f, indent=2)
    print("  Saved: treatment_analytics_summary.json")
    return summary
