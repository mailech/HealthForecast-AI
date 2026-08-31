import os
import logging
import pickle
import numpy as np
import pandas as pd

logger = logging.getLogger("app.ai.predictor")

# Project paths
THIS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(THIS_DIR, "..", "..", ".."))

MODELS_DIR = os.path.join(PROJECT_ROOT, "data", "models")
SPLITS_DIR = os.path.join(PROJECT_ROOT, "data", "data", "splits")

# Backup paths if inside Backend/app/ai
ALT_MODELS_DIR = THIS_DIR

AGE_ORDER = {
    "[0-10)": 0, "[10-20)": 1, "[20-30)": 2, "[30-40)": 3,
    "[40-50)": 4, "[50-60)": 5, "[60-70)": 6, "[70-80)": 7,
    "[80-90)": 8, "[90-100)": 9,
}

MED_COLS = [
    "metformin", "repaglinide", "nateglinide", "chlorpropamide", "glimepiride",
    "acetohexamide", "glipizide", "glyburide", "tolbutamide", "pioglitazone",
    "rosiglitazone", "acarbose", "miglitol", "troglitazone", "tolazamide",
    "examide", "citoglipton", "insulin", "glyburide-metformin",
    "glipizide-metformin", "glimepiride-pioglitazone",
    "metformin-rosiglitazone", "metformin-pioglitazone"
]

ZERO_VAR_COLS = ['acetohexamide_No', 'troglitazone_No', 'examide_No', 'citoglipton_No']

def icd9_group(code):
    if pd.isna(code) or str(code).strip().upper() in ("", "UNKNOWN", "?", "NONE", "NULL"):
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

class DualReadmissionPredictor:
    def __init__(self):
        self.risk_model = None
        self.risk_prep = None
        self.readmission_model = None
        self.readmission_prep = None
        self.x_train_cols = None
        self.risk_cols = None
        self.readmit_cols = None

    def load_model(self):
        m1_path = os.path.join(MODELS_DIR, "patient_risk_model.pkl")
        p1_path = os.path.join(MODELS_DIR, "preprocessor.pkl")
        m2_path = os.path.join(MODELS_DIR, "readmission_model.pkl")
        p2_path = os.path.join(MODELS_DIR, "readmission_preprocessor.pkl")

        if not (os.path.exists(m1_path) and os.path.exists(m2_path)):
            logger.warning(f"Models not found in {MODELS_DIR}, checking {ALT_MODELS_DIR}")
            m1_path = os.path.join(ALT_MODELS_DIR, "patient_risk_model.pkl")
            p1_path = os.path.join(ALT_MODELS_DIR, "preprocessor.pkl")
            m2_path = os.path.join(ALT_MODELS_DIR, "readmission_model.pkl")
            p2_path = os.path.join(ALT_MODELS_DIR, "readmission_preprocessor.pkl")

        logger.info(f"Loading trained AI models from {m1_path} and {m2_path}...")
        with open(m1_path, "rb") as f:
            self.risk_model = pickle.load(f)
        with open(p1_path, "rb") as f:
            self.risk_prep = pickle.load(f)
        with open(m2_path, "rb") as f:
            self.readmission_model = pickle.load(f)
        with open(p2_path, "rb") as f:
            self.readmission_prep = pickle.load(f)

        # Load column headers
        x_train_file = os.path.join(SPLITS_DIR, "X_train.csv")
        readmit_file = os.path.join(SPLITS_DIR, "readmission_X_train.csv")

        if os.path.exists(x_train_file) and os.path.exists(readmit_file):
            self.x_train_cols = pd.read_csv(x_train_file, nrows=1).columns.tolist()
            self.readmit_cols = pd.read_csv(readmit_file, nrows=1).columns.tolist()
            self.risk_cols = [c for c in self.x_train_cols if c not in ZERO_VAR_COLS]
        else:
            logger.error("Splits column definitions missing!")
            raise FileNotFoundError("Split CSV column files not found.")

        logger.info("Successfully loaded dual AI models & preprocessors.")

    def predict(self, data: dict) -> dict:
        """
        Runs inference on full raw input features using both Model 1 & Model 2.
        """
        if self.risk_model is None or self.readmission_model is None:
            self.load_model()

        # Build raw dict with all expected features and fallback defaults
        raw = {
            "race": data.get("race", "Caucasian"),
            "gender": data.get("gender", "Female"),
            "age": data.get("age", "[50-60)"),
            "admission_type_id": int(data.get("admission_type_id", 1)),
            "discharge_disposition_id": int(data.get("discharge_disposition_id", 1)),
            "admission_source_id": int(data.get("admission_source_id", 7)),
            "time_in_hospital": int(data.get("time_in_hospital", 3)),
            "num_lab_procedures": int(data.get("num_lab_procedures", 40)),
            "num_procedures": int(data.get("num_procedures", 1)),
            "num_medications": int(data.get("num_medications", 15)),
            "number_outpatient": int(data.get("number_outpatient", 0)),
            "number_emergency": int(data.get("number_emergency", 0)),
            "number_inpatient": int(data.get("number_inpatient", 0)),
            "diag_1": str(data.get("diag_1", "250.01")),
            "diag_2": str(data.get("diag_2", "401")),
            "diag_3": str(data.get("diag_3", "272")),
            "number_diagnoses": int(data.get("number_diagnoses", 9)),
            "medical_specialty": data.get("medical_specialty", "InternalMedicine"),
            "change": data.get("change", "No"),
            "diabetesMed": data.get("diabetesMed", "Yes")
        }

        # Med status defaults
        for med in MED_COLS:
            raw[med] = data.get(med, "No")

        # Create DataFrame
        df = pd.DataFrame([raw])

        # Preprocess features
        df["age"] = df["age"].map(lambda x: AGE_ORDER.get(str(x), AGE_ORDER.get("[50-60)", 5)))
        df["change"] = (df["change"] == "Ch").astype(int)
        df["diabetesMed"] = (df["diabetesMed"] == "Yes").astype(int)

        for col in ["diag_1", "diag_2", "diag_3"]:
            df[col] = df[col].apply(icd9_group)

        # Model 1 Inference (Patient Risk Prediction)
        x1_arr = self.risk_prep.transform(df)
        x1_df = pd.DataFrame(x1_arr, columns=self.x_train_cols)[self.risk_cols]
        prob1 = float(self.risk_model.predict_proba(x1_df)[0, 1])
        label1 = "HIGH RISK (readmission < 30 days)" if prob1 >= 0.5 else "LOW RISK"

        # Model 2 Inference (Hospital Readmission Prediction)
        x2_arr = self.readmission_prep.transform(df)
        x2_df = pd.DataFrame(x2_arr, columns=self.readmit_cols)
        prob2 = float(self.readmission_model.predict_proba(x2_df)[0, 1])
        label2 = "LIKELY READMISSION" if prob2 >= 0.5 else "NO READMISSION EXPECTED"

        # Determine overall Risk Level
        if prob1 >= 0.5 and prob2 >= 0.5:
            risk_level = "High"
            clinical_interpretation = "HIGH ALERT: Patient is at high risk AND likely to be readmitted. Recommend immediate care plan review and follow-up scheduling."
        elif prob1 >= 0.5:
            risk_level = "High"
            clinical_interpretation = "Patient is high risk for early readmission (<30 days). Consider enhanced discharge planning."
        elif prob2 >= 0.5:
            risk_level = "Medium"
            clinical_interpretation = "Patient is likely to be readmitted (any timeframe). Consider outpatient follow-up and medication review."
        elif prob1 >= 0.35 or prob2 >= 0.35:
            risk_level = "Medium"
            clinical_interpretation = "Patient exhibits moderate readmission indicator scores. Monitor progress at follow-up."
        else:
            risk_level = "Low"
            clinical_interpretation = "Patient appears low risk for readmission."

        return {
            "model1_probability": prob1,
            "model1_prediction": label1,
            "model2_probability": prob2,
            "model2_prediction": label2,
            "readmission_risk_score": float(max(prob1, prob2)),
            "risk_level": risk_level,
            "clinical_interpretation": clinical_interpretation
        }

predictor_instance = DualReadmissionPredictor()
