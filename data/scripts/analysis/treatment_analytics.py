"""
HealthForecast AI - Model 3: Treatment Outcome Analytics
Observational association analysis and descriptive healthcare analytics.
This module does NOT estimate causal treatment effectiveness.
No ML model is trained. No artificial target is created.
Model 1 and Model 2 files are NOT modified.
"""

import os
import pandas as pd
import numpy as np
import json
import sys
import warnings
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
from scipy.stats import chi2_contingency

from treatment_outcomes import (
    run_statistical_tests,
    save_csv_outputs,
    save_analytics_results,
    save_summary_json,
)
from treatment_visualization import generate_all_charts

warnings.filterwarnings("ignore")
sys.stdout.reconfigure(encoding="utf-8")

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))

DATA_PATH = os.path.join(ROOT, "data", "processed", "diabetes_cleaned.csv")
MINIMUM_ENCOUNTERS = 100   # configurable threshold for specialty analysis

MED_COLS = [
    "metformin", "repaglinide", "nateglinide", "chlorpropamide",
    "glimepiride", "acetohexamide", "glipizide", "glyburide",
    "tolbutamide", "pioglitazone", "rosiglitazone", "acarbose",
    "miglitol", "troglitazone", "tolazamide", "examide",
    "citoglipton", "insulin", "glyburide-metformin",
    "glipizide-metformin", "glimepiride-pioglitazone",
    "metformin-rosiglitazone", "metformin-pioglitazone",
]

MAJOR_MEDS = ["insulin", "metformin", "glipizide", "glyburide",
              "pioglitazone", "rosiglitazone"]

AGE_ORDER = ["[0-10)", "[10-20)", "[20-30)", "[30-40)", "[40-50)",
             "[50-60)", "[60-70)", "[70-80)", "[80-90)", "[90-100)"]

# ICD-9 chapter grouping (same as Model 1 & 2)
def icd9_group(code):
    if pd.isna(code) or str(code).strip().upper() in ("", "UNKNOWN", "?"):
        return "Unknown"
    code = str(code).strip()
    if code.startswith("E"): return "External_Injury"
    if code.startswith("V"): return "Supplementary"
    try:
        num = float(code)
    except ValueError:
        return "Other"
    if   1 <= num < 140:  return "Infectious"
    if 140 <= num < 240:  return "Neoplasms"
    if 240 <= num < 280:  return "Endocrine_Metabolic"
    if 280 <= num < 290:  return "Blood"
    if 290 <= num < 320:  return "Mental"
    if 320 <= num < 390:  return "Nervous_System"
    if 390 <= num < 460:  return "Circulatory"
    if 460 <= num < 520:  return "Respiratory"
    if 520 <= num < 580:  return "Digestive"
    if 580 <= num < 630:  return "Genitourinary"
    if 630 <= num < 680:  return "Pregnancy"
    if 680 <= num < 710:  return "Skin"
    if 710 <= num < 740:  return "Musculoskeletal"
    if 740 <= num < 760:  return "Congenital"
    if 760 <= num < 780:  return "Perinatal"
    if 780 <= num < 800:  return "Symptoms_Signs"
    if 800 <= num < 1000: return "Injury_Poisoning"
    return "Other"

def cramers_v(chi2, n, r, c):
    return np.sqrt(chi2 / (n * (min(r, c) - 1)))

# ── TASK 1 ───────────────────────────────────────────────────────────────────
def load_data():
    print("=" * 60)
    print("TASK 1 - LOAD DATA")
    print("=" * 60)
    df = pd.read_csv(DATA_PATH)
    print(f"Dataset shape        : {df.shape}")
    print(f"Total encounters     : {len(df):,}")
    present_meds = [c for c in MED_COLS if c in df.columns]
    print(f"Medication columns   : {len(present_meds)}")
    outcome_cols = ["readmitted", "discharge_disposition_id",
                    "time_in_hospital", "number_inpatient",
                    "number_outpatient", "number_emergency"]
    print(f"Outcome columns      : {[c for c in outcome_cols if c in df.columns]}")
    return df

# ── TASK 2 & 3 ───────────────────────────────────────────────────────────────
def analyze_medication_usage(df):
    print("\n" + "=" * 60)
    print("TASK 2 & 3 - MEDICATION USAGE ANALYSIS")
    print("=" * 60)
    rows = []
    n = len(df)
    for med in MED_COLS:
        if med not in df.columns:
            continue
        vc = df[med].value_counts()
        no_count     = int(vc.get("No", 0))
        steady_count = int(vc.get("Steady", 0))
        up_count     = int(vc.get("Up", 0))
        down_count   = int(vc.get("Down", 0))
        prescribed   = steady_count + up_count + down_count
        dose_changed = up_count + down_count
        rows.append({
            "medication":        med,
            "no_count":          no_count,
            "steady_count":      steady_count,
            "up_count":          up_count,
            "down_count":        down_count,
            "prescribed_count":  prescribed,
            "prescription_pct":  round(prescribed / n * 100, 2),
            "dose_changed_count": dose_changed,
            "dose_changed_pct":  round(dose_changed / prescribed * 100, 2) if prescribed > 0 else 0.0,
        })
    med_df = pd.DataFrame(rows).sort_values("prescription_pct", ascending=False)

    print(f"\n{'Medication':<30} {'Prescribed':>10} {'Rx%':>7} {'DoseChg%':>10}")
    print("-" * 60)
    for _, r in med_df.iterrows():
        print(f"{r['medication']:<30} {r['prescribed_count']:>10,} "
              f"{r['prescription_pct']:>6.1f}% {r['dose_changed_pct']:>9.1f}%")

    top_rx  = med_df.iloc[0]["medication"]
    top_chg = med_df.sort_values("dose_changed_pct", ascending=False).iloc[0]["medication"]
    print(f"\nMost commonly prescribed  : {top_rx}")
    print(f"Most commonly dose-changed: {top_chg}")
    return med_df

# ── TASK 4 & 5 ───────────────────────────────────────────────────────────────
def analyze_medication_changes(df):
    print("\n" + "=" * 60)
    print("TASK 4 & 5 - MEDICATION CHANGE ANALYSIS")
    print("=" * 60)
    n = len(df)
    changed   = (df["change"] == "Ch").sum()
    unchanged = (df["change"] == "No").sum()
    print(f"Changed encounters   : {changed:,}  ({changed/n*100:.2f}%)")
    print(f"Unchanged encounters : {unchanged:,}  ({unchanged/n*100:.2f}%)")

    # change vs readmission
    ct = pd.crosstab(df["change"], df["readmitted"])
    ct_pct = ct.div(ct.sum(axis=1), axis=0) * 100

    print("\nMedication Change vs Readmission (%):")
    print(f"{'Group':<15} {'NO':>8} {'>30':>8} {'<30':>8} {'Any Readmit':>12}")
    print("-" * 50)
    for grp, label in [("Ch", "Changed"), ("No", "Not Changed")]:
        if grp not in ct_pct.index:
            continue
        row = ct_pct.loc[grp]
        no_r  = row.get("NO",  0)
        g30   = row.get(">30", 0)
        l30   = row.get("<30", 0)
        any_r = g30 + l30
        print(f"{label:<15} {no_r:>7.2f}% {g30:>7.2f}% {l30:>7.2f}% {any_r:>11.2f}%")

    # chi-square
    chi2, p, dof, _ = chi2_contingency(ct)
    cv = cramers_v(chi2, n, ct.shape[0], ct.shape[1])
    print(f"\nChi-square statistic : {chi2:.4f}")
    print(f"p-value              : {p:.6f}")
    print(f"Cramér's V           : {cv:.4f}")
    print("NOTE: This is an observational association only. "
          "Medication changes do NOT necessarily cause readmission differences.")

    change_summary = ct_pct.reset_index()
    change_summary.columns.name = None
    return change_summary, {"chi2": round(chi2, 4), "p_value": round(p, 6),
                             "cramers_v": round(cv, 4), "dof": dof}

# ── TASK 6 ───────────────────────────────────────────────────────────────────
def analyze_readmission_by_medication(df):
    print("\n" + "=" * 60)
    print("TASK 6 - MEDICATION GROUP VS READMISSION")
    print("=" * 60)
    rows = []
    stats = []
    for med in MAJOR_MEDS:
        if med not in df.columns:
            continue
        df["_prescribed"] = df[med].isin(["Steady", "Up", "Down"])
        for grp_val, grp_label in [(True, "Prescribed"), (False, "Not Prescribed")]:
            sub = df[df["_prescribed"] == grp_val]
            n_sub = len(sub)
            if n_sub == 0:
                continue
            vc = sub["readmitted"].value_counts()
            no_r  = int(vc.get("NO",  0))
            g30   = int(vc.get(">30", 0))
            l30   = int(vc.get("<30", 0))
            any_r = g30 + l30
            rows.append({
                "medication": med, "group": grp_label,
                "encounters": n_sub,
                "overall_readmit_pct": round(any_r / n_sub * 100, 2),
                "lt30_readmit_pct":    round(l30  / n_sub * 100, 2),
                "gt30_readmit_pct":    round(g30  / n_sub * 100, 2),
            })
        # chi-square for this medication
        ct = pd.crosstab(df["_prescribed"], df["readmitted"])
        if ct.shape == (2, 3):
            chi2, p, dof, _ = chi2_contingency(ct)
            cv = cramers_v(chi2, len(df), 2, 3)
            stats.append({"medication": med, "chi2": round(chi2, 4),
                           "p_value": round(p, 6), "cramers_v": round(cv, 4)})

    df.drop(columns=["_prescribed"], inplace=True)
    readmit_df = pd.DataFrame(rows)

    print(f"\n{'Medication':<14} {'Group':<15} {'N':>8} {'Any%':>7} {'<30%':>7} {'>30%':>7}")
    print("-" * 65)
    for _, r in readmit_df.iterrows():
        print(f"{r['medication']:<14} {r['group']:<15} {r['encounters']:>8,} "
              f"{r['overall_readmit_pct']:>6.2f}% {r['lt30_readmit_pct']:>6.2f}% "
              f"{r['gt30_readmit_pct']:>6.2f}%")

    print("\nChi-square tests (medication prescribed vs readmission):")
    for s in stats:
        sig = "**" if s["p_value"] < 0.05 else "ns"
        print(f"  {s['medication']:<14} chi2={s['chi2']:.2f}  p={s['p_value']:.4f}  "
              f"V={s['cramers_v']:.4f}  {sig}")
    print("NOTE: All associations are observational. No causal claims.")
    return readmit_df, stats

# ── TASK 7 ───────────────────────────────────────────────────────────────────
def analyze_utilization_by_treatment(df):
    print("\n" + "=" * 60)
    print("TASK 7 - HOSPITAL UTILIZATION BY TREATMENT GROUP")
    print("=" * 60)
    util_cols = ["time_in_hospital", "number_inpatient",
                 "number_outpatient", "number_emergency"]
    rows = []
    for med in MAJOR_MEDS:
        if med not in df.columns:
            continue
        prescribed = df[med].isin(["Steady", "Up", "Down"])
        for grp_val, grp_label in [(True, "Prescribed"), (False, "Not Prescribed")]:
            sub = df[prescribed == grp_val]
            for col in util_cols:
                rows.append({
                    "medication": med, "group": grp_label,
                    "metric": col,
                    "n": len(sub),
                    "mean":   round(sub[col].mean(), 3),
                    "median": round(sub[col].median(), 3),
                    "std":    round(sub[col].std(), 3),
                })
    util_df = pd.DataFrame(rows)
    for med in MAJOR_MEDS:
        sub_df = util_df[util_df["medication"] == med]
        if sub_df.empty:
            continue
        print(f"\n  {med.upper()}")
        print(f"  {'Metric':<22} {'Group':<16} {'N':>7} {'Mean':>8} {'Median':>8} {'Std':>8}")
        print("  " + "-" * 72)
        for _, r in sub_df.iterrows():
            print(f"  {r['metric']:<22} {r['group']:<16} {r['n']:>7,} "
                  f"{r['mean']:>8.3f} {r['median']:>8.3f} {r['std']:>8.3f}")
    print("\nNOTE: Utilization metrics are healthcare usage measures, "
          "not direct treatment effectiveness measures.")
    return util_df

# ── TASK 8 ───────────────────────────────────────────────────────────────────
def analyze_discharge_by_treatment(df):
    print("\n" + "=" * 60)
    print("TASK 8 - DISCHARGE DISPOSITION BY TREATMENT GROUP")
    print("=" * 60)
    rows = []
    for med in MAJOR_MEDS:
        if med not in df.columns:
            continue
        prescribed = df[med].isin(["Steady", "Up", "Down"])
        for grp_val, grp_label in [(True, "Prescribed"), (False, "Not Prescribed")]:
            sub = df[prescribed == grp_val]
            vc = sub["discharge_disposition_id"].value_counts(normalize=True) * 100
            top3 = vc.head(3)
            for disp_id, pct in top3.items():
                rows.append({
                    "medication": med, "group": grp_label,
                    "discharge_id": int(disp_id),
                    "pct": round(pct, 2),
                    "count": int(sub["discharge_disposition_id"].eq(disp_id).sum()),
                })
    discharge_df = pd.DataFrame(rows)
    for med in MAJOR_MEDS:
        sub_df = discharge_df[discharge_df["medication"] == med]
        if sub_df.empty:
            continue
        print(f"\n  {med.upper()} — top 3 discharge IDs per group")
        print(f"  {'Group':<16} {'Discharge ID':>12} {'Count':>8} {'%':>7}")
        print("  " + "-" * 46)
        for _, r in sub_df.iterrows():
            print(f"  {r['group']:<16} {r['discharge_id']:>12} "
                  f"{r['count']:>8,} {r['pct']:>6.2f}%")
    print("\nNOTE: Discharge IDs are nominal categories. "
          "ID 1 = Home, ID 3 = SNF, ID 11 = Expired (not ordered numerically).")
    return discharge_df

# ── TASK 9 ───────────────────────────────────────────────────────────────────
def analyze_diagnosis_treatment_patterns(df):
    print("\n" + "=" * 60)
    print("TASK 9 - DIAGNOSIS GROUP VS TREATMENT PATTERN")
    print("=" * 60)
    df = df.copy()
    df["diag_chapter"] = df["diag_1"].apply(icd9_group)
    df["insulin_rx"]   = df["insulin"].isin(["Steady", "Up", "Down"]).astype(int)
    df["metformin_rx"] = df["metformin"].isin(["Steady", "Up", "Down"]).astype(int)
    df["med_changed"]  = (df["change"] == "Ch").astype(int)

    diag_df = (df.groupby("diag_chapter")
                 .agg(encounters=("diag_chapter", "count"),
                      insulin_pct=("insulin_rx", "mean"),
                      metformin_pct=("metformin_rx", "mean"),
                      change_pct=("med_changed", "mean"))
                 .reset_index())
    diag_df["insulin_pct"]   = (diag_df["insulin_pct"]   * 100).round(2)
    diag_df["metformin_pct"] = (diag_df["metformin_pct"] * 100).round(2)
    diag_df["change_pct"]    = (diag_df["change_pct"]    * 100).round(2)
    diag_df = diag_df.sort_values("encounters", ascending=False)

    print(f"\n{'Diagnosis Chapter':<25} {'N':>8} {'Insulin%':>10} "
          f"{'Metformin%':>12} {'Changed%':>10}")
    print("-" * 68)
    for _, r in diag_df.iterrows():
        print(f"{r['diag_chapter']:<25} {r['encounters']:>8,} "
              f"{r['insulin_pct']:>9.1f}% {r['metformin_pct']:>11.1f}% "
              f"{r['change_pct']:>9.1f}%")
    return diag_df

# ── TASK 10 ──────────────────────────────────────────────────────────────────
def analyze_age_treatment_patterns(df):
    print("\n" + "=" * 60)
    print("TASK 10 - AGE GROUP VS MEDICATION CHANGE")
    print("=" * 60)
    df = df.copy()
    df["med_changed"] = (df["change"] == "Ch").astype(int)
    age_df = (df.groupby("age")
                .agg(encounters=("age", "count"),
                     changes=("med_changed", "sum"))
                .reset_index())
    age_df["change_pct"] = (age_df["changes"] / age_df["encounters"] * 100).round(2)
    # preserve clinical age order
    age_df["age"] = pd.Categorical(age_df["age"], categories=AGE_ORDER, ordered=True)
    age_df = age_df.sort_values("age")

    print(f"\n{'Age Group':<12} {'Encounters':>12} {'Med Changes':>13} {'Change%':>10}")
    print("-" * 50)
    for _, r in age_df.iterrows():
        print(f"{str(r['age']):<12} {r['encounters']:>12,} "
              f"{r['changes']:>13,} {r['change_pct']:>9.2f}%")
    return age_df

# ── TASK 11 ──────────────────────────────────────────────────────────────────
def analyze_specialty_treatment_patterns(df, min_enc=MINIMUM_ENCOUNTERS):
    print("\n" + "=" * 60)
    print(f"TASK 11 - SPECIALTY VS MEDICATION CHANGE (min n={min_enc})")
    print("=" * 60)
    df = df.copy()
    df["med_changed"] = (df["change"] == "Ch").astype(int)
    spec_df = (df.groupby("medical_specialty")
                 .agg(encounters=("medical_specialty", "count"),
                      changes=("med_changed", "sum"))
                 .reset_index())
    spec_df["change_pct"] = (spec_df["changes"] / spec_df["encounters"] * 100).round(2)
    spec_df = spec_df[spec_df["encounters"] >= min_enc].sort_values(
        "change_pct", ascending=False)

    print(f"\n{'Specialty':<40} {'N':>8} {'Changes':>9} {'Change%':>9}")
    print("-" * 70)
    for _, r in spec_df.iterrows():
        print(f"{r['medical_specialty']:<40} {r['encounters']:>8,} "
              f"{r['changes']:>9,} {r['change_pct']:>8.2f}%")
    print(f"\nSpecialties below n={min_enc} excluded from this table.")
    return spec_df


# ── MAIN ─────────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("HEALTHFORECAST AI - MODEL 3: TREATMENT OUTCOME ANALYTICS")
    print("Observational analysis only. No causal claims.")
    print("=" * 60)

    df = load_data()
    med_df                    = analyze_medication_usage(df)
    change_summary, chg_stats = analyze_medication_changes(df)
    readmit_df, rx_stats      = analyze_readmission_by_medication(df)
    util_df                   = analyze_utilization_by_treatment(df)
    discharge_df              = analyze_discharge_by_treatment(df)
    diag_df                   = analyze_diagnosis_treatment_patterns(df)
    age_df                    = analyze_age_treatment_patterns(df)
    spec_df                   = analyze_specialty_treatment_patterns(df)

    stats_df   = run_statistical_tests(df, med_df, chg_stats)
    csv_files  = save_csv_outputs(med_df, readmit_df, util_df, diag_df, age_df, spec_df)
    results_df = save_analytics_results(df, med_df, readmit_df, stats_df)
    summary    = save_summary_json(df, med_df, stats_df, csv_files)
    generate_all_charts(df, med_df, readmit_df, util_df, diag_df, age_df, spec_df)

    # ── FINAL REPORT ─────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("EXECUTION COMPLETE")
    print("=" * 60)
    print(f"  Status                    : SUCCESS")
    print(f"  Rows analyzed             : {len(df):,}")
    print(f"  Medications analyzed      : {summary['medications_analyzed']}")
    print(f"  Statistical tests         : {summary['statistical_tests_performed']}")
    print(f"\n  CSV files generated:")
    for f in summary["generated_csv_files"]:
        print(f"    - {f}")
    print(f"\n  Charts generated:")
    charts = [
        "medication_usage.png", "medication_readmission.png",
        "medication_change_analysis.png", "treatment_utilization.png",
        "diagnosis_treatment_heatmap.png", "age_medication_change.png",
        "specialty_medication_change.png",
    ]
    for c in charts:
        print(f"    - {c}")
    print(f"\n  JSON summary              : treatment_analytics_summary.json")
    print(f"  Model 1 & 2 untouched     : {summary['model1_model2_untouched']}")
    print(f"  No ML model trained       : True")
    print(f"  No causal claims made     : True")
    print("=" * 60)


if __name__ == "__main__":
    main()
