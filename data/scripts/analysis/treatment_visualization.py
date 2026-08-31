"""
Treatment Visualization - Chart Generation
Generates all 7 PNG charts for treatment analytics.
"""

import os
import pandas as pd
import numpy as np
import warnings
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns

warnings.filterwarnings("ignore")

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))
PLOTS = os.path.join(ROOT, "outputs", "plots")

MAJOR_MEDS = ["insulin", "metformin", "glipizide", "glyburide",
              "pioglitazone", "rosiglitazone"]

AGE_ORDER = ["[0-10)", "[10-20)", "[20-30)", "[30-40)", "[40-50)",
             "[50-60)", "[60-70)", "[70-80)", "[80-90)", "[90-100)"]


def _save(fname):
    plt.tight_layout()
    plt.savefig(os.path.join(PLOTS, fname), dpi=150, bbox_inches="tight")
    plt.close()
    print(f"  Saved: {fname}")


# ── TASK 16a ─────────────────────────────────────────────────────────────────
def plot_medication_usage(med_df):
    top = med_df[med_df["prescribed_count"] > 0].head(10)
    fig, ax = plt.subplots(figsize=(10, 5))
    ax.barh(top["medication"][::-1], top["prescription_pct"][::-1], color="steelblue")
    ax.set_xlabel("Prescription Rate (%)")
    ax.set_title("Top 10 Medications by Prescription Rate")
    ax.xaxis.set_major_formatter(mticker.FormatStrFormatter("%.1f%%"))
    _save("medication_usage.png")


# ── TASK 16b ─────────────────────────────────────────────────────────────────
def plot_medication_readmission(readmit_df):
    pivot = readmit_df.pivot(index="medication", columns="group",
                             values="overall_readmit_pct")
    pivot = pivot.reindex([m for m in MAJOR_MEDS if m in pivot.index])
    ax = pivot.plot(kind="bar", figsize=(10, 5), colormap="Set2")
    ax.set_ylabel("Overall Readmission Rate (%)")
    ax.set_title("Readmission Rate by Medication Group (Observational)")
    ax.set_xlabel("")
    plt.xticks(rotation=30, ha="right")
    ax.yaxis.set_major_formatter(mticker.FormatStrFormatter("%.1f%%"))
    _save("medication_readmission.png")


# ── TASK 16c ─────────────────────────────────────────────────────────────────
def plot_medication_change_analysis(df):
    """Bar chart: medication change rate per major medication."""
    rows = []
    for med in MAJOR_MEDS:
        if med not in df.columns:
            continue
        prescribed = df[med].isin(["Steady", "Up", "Down"])
        sub = df[prescribed]
        if len(sub) == 0:
            continue
        changed = sub[med].isin(["Up", "Down"]).sum()
        rows.append({"medication": med,
                     "dose_changed_pct": round(changed / len(sub) * 100, 2)})
    chg_df = pd.DataFrame(rows).sort_values("dose_changed_pct", ascending=False)

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.bar(chg_df["medication"], chg_df["dose_changed_pct"], color="coral")
    ax.set_ylabel("Dose Change Rate (%)")
    ax.set_title("Dose Change Rate Among Prescribed Patients (Observational)")
    ax.yaxis.set_major_formatter(mticker.FormatStrFormatter("%.1f%%"))
    plt.xticks(rotation=20, ha="right")
    _save("medication_change_analysis.png")


# ── TASK 16d ─────────────────────────────────────────────────────────────────
def plot_treatment_utilization(util_df):
    sub = util_df[util_df["metric"] == "time_in_hospital"].copy()
    sub = sub[sub["medication"].isin(MAJOR_MEDS)]
    pivot = sub.pivot(index="medication", columns="group", values="mean")
    pivot = pivot.reindex([m for m in MAJOR_MEDS if m in pivot.index])
    ax = pivot.plot(kind="bar", figsize=(10, 5), colormap="coolwarm")
    ax.set_ylabel("Mean Time in Hospital (days)")
    ax.set_title("Mean Hospital Stay by Medication Group (Observational)")
    ax.set_xlabel("")
    plt.xticks(rotation=30, ha="right")
    _save("treatment_utilization.png")


# ── TASK 16e ─────────────────────────────────────────────────────────────────
def plot_diagnosis_treatment_heatmap(diag_df):
    heat = diag_df.set_index("diag_chapter")[
        ["insulin_pct", "metformin_pct", "change_pct"]
    ].sort_values("insulin_pct", ascending=False).head(12)
    fig, ax = plt.subplots(figsize=(8, 7))
    sns.heatmap(heat, annot=True, fmt=".1f", cmap="YlOrRd",
                linewidths=0.5, ax=ax)
    ax.set_title("Diagnosis Chapter vs Treatment Pattern (%)\n(Observational)")
    ax.set_xlabel("")
    _save("diagnosis_treatment_heatmap.png")


# ── TASK 16f ─────────────────────────────────────────────────────────────────
def plot_age_medication_change(age_df):
    age_df = age_df.copy()
    age_df["age"] = pd.Categorical(age_df["age"], categories=AGE_ORDER, ordered=True)
    age_df = age_df.sort_values("age")
    fig, ax = plt.subplots(figsize=(9, 5))
    ax.plot(age_df["age"].astype(str), age_df["change_pct"],
            marker="o", color="teal", linewidth=2)
    ax.set_ylabel("Medication Change Rate (%)")
    ax.set_title("Medication Change Rate by Age Group (Observational)")
    ax.set_xlabel("Age Group")
    plt.xticks(rotation=30, ha="right")
    ax.yaxis.set_major_formatter(mticker.FormatStrFormatter("%.1f%%"))
    _save("age_medication_change.png")


# ── TASK 16g ─────────────────────────────────────────────────────────────────
def plot_specialty_medication_change(spec_df):
    top = spec_df.sort_values("change_pct", ascending=False).head(15)
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.barh(top["medical_specialty"][::-1], top["change_pct"][::-1],
            color="mediumpurple")
    ax.set_xlabel("Medication Change Rate (%)")
    ax.set_title("Top 15 Specialties by Medication Change Rate (Observational)")
    ax.xaxis.set_major_formatter(mticker.FormatStrFormatter("%.1f%%"))
    _save("specialty_medication_change.png")


# ── TASK 16 (orchestrator) ───────────────────────────────────────────────────
def generate_all_charts(df, med_df, readmit_df, util_df, diag_df, age_df, spec_df):
    print("\n" + "=" * 60)
    print("TASK 16 - GENERATE CHARTS")
    print("=" * 60)
    plot_medication_usage(med_df)
    plot_medication_readmission(readmit_df)
    plot_medication_change_analysis(df)
    plot_treatment_utilization(util_df)
    plot_diagnosis_treatment_heatmap(diag_df)
    plot_age_medication_change(age_df)
    plot_specialty_medication_change(spec_df)
    print("All 7 charts generated.")
