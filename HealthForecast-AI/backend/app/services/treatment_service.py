from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
DATA_ROOT = Path(__import__("os").environ.get("HF_DATA_DIR", str(ROOT / "data")))
DATA = DATA_ROOT / "diabetic_data.csv"

MEDICATION_COLUMNS = [
    "metformin", "repaglinide", "nateglinide", "chlorpropamide",
    "glimepiride", "acetohexamide", "glipizide", "glyburide",
    "tolbutamide", "pioglitazone", "rosiglitazone", "acarbose",
    "miglitol", "troglitazone", "tolazamide", "insulin",
    "glyburide-metformin", "glipizide-metformin",
    "glimepiride-pioglitazone", "metformin-rosiglitazone",
    "metformin-pioglitazone",
]

def effectiveness_label(score):
    if score >= 80: return "Highly Effective"
    if score >= 60: return "Effective"
    if score >= 40: return "Moderate"
    return "Needs Review"

def care_recommendations(risk_category, patient):
    if risk_category == "High":
        return [
            "Prioritize discharge follow-up planning.",
            "Review recent inpatient and emergency utilization.",
            "Consider multidisciplinary care coordination.",
        ]
    if risk_category == "Medium":
        return [
            "Schedule structured follow-up.",
            "Review medication adherence and recent utilization.",
        ]
    return ["Continue routine monitoring and follow-up."]

def dataset_treatment_analysis():
    df = pd.read_csv(DATA, low_memory=False)
    total = len(df)
    rows = []
    for col in MEDICATION_COLUMNS:
        if col not in df.columns:
            continue
        used = df[col].astype(str).eq("Yes") | df[col].astype(str).isin(["Up", "Down", "Steady"])
        subset = df[used]
        early = subset["readmitted"].astype(str).eq("<30").sum()
        rows.append({
            "treatment": col,
            "encounters": int(len(subset)),
            "early_readmissions": int(early),
            "early_readmission_rate": round(float(early / len(subset) * 100), 2) if len(subset) else 0,
        })
    rows.sort(key=lambda x: x["encounters"], reverse=True)
    change_yes = df["change"].astype(str).eq("Ch")
    change_no = df["change"].astype(str).eq("No")
    change_analysis = {
        "changed": {
            "encounters": int(change_yes.sum()),
            "early_readmissions": int(df.loc[change_yes, "readmitted"].astype(str).eq("<30").sum()),
            "rate": round(float(df.loc[change_yes, "readmitted"].astype(str).eq("<30").mean() * 100), 2) if change_yes.any() else 0,
        },
        "unchanged": {
            "encounters": int(change_no.sum()),
            "early_readmissions": int(df.loc[change_no, "readmitted"].astype(str).eq("<30").sum()),
            "rate": round(float(df.loc[change_no, "readmitted"].astype(str).eq("<30").mean() * 100), 2) if change_no.any() else 0,
        },
    }
    insulin = df["insulin"].astype(str)
    insulin_analysis = {}
    for value in ["No", "Steady", "Up", "Down"]:
        s = insulin.eq(value)
        insulin_analysis[value] = {
            "encounters": int(s.sum()),
            "early_readmissions": int(df.loc[s, "readmitted"].astype(str).eq("<30").sum()),
            "rate": round(float(df.loc[s, "readmitted"].astype(str).eq("<30").mean() * 100), 2) if s.any() else 0,
        }
    return {
        "dataset": "Diabetes 130-US Hospitals",
        "total_encounters": total,
        "early_readmission_definition": "readmitted == '<30'",
        "medications": rows,
        "medication_change": change_analysis,
        "insulin": insulin_analysis,
        "disclaimer": "Associations in this retrospective dataset do not prove treatment effectiveness or causality."
    }
