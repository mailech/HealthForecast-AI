import os, pickle
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings("ignore")

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(BASE, "..", ".."))
SPLITS  = os.path.join(ROOT, "data", "splits")
MODELS  = os.path.join(ROOT, "models")
PROCESSED = os.path.join(ROOT, "data", "processed")

AGE_MAP = {"[0-10)":0,"[10-20)":1,"[20-30)":2,"[30-40)":3,"[40-50)":4,
           "[50-60)":5,"[60-70)":6,"[70-80)":7,"[80-90)":8,"[90-100)":9}
CHANGE_MAP   = {"Ch": 1, "No": 0}
DIABETES_MAP = {"Yes": 1, "No": 0}

num_cols = ['age','time_in_hospital','num_lab_procedures','num_procedures','num_medications',
            'number_outpatient','number_emergency','number_inpatient','number_diagnoses','change','diabetesMed']
cat_cols = ['race','gender','medical_specialty','admission_type_id','discharge_disposition_id',
            'admission_source_id','diag_1','diag_2','diag_3','metformin','repaglinide','nateglinide',
            'chlorpropamide','glimepiride','acetohexamide','glipizide','glyburide','tolbutamide',
            'pioglitazone','rosiglitazone','acarbose','miglitol','troglitazone','tolazamide','examide',
            'citoglipton','insulin','glyburide-metformin','glipizide-metformin','glimepiride-pioglitazone',
            'metformin-rosiglitazone','metformin-pioglitazone']

RISK_ZERO_VAR = ['acetohexamide_No', 'troglitazone_No', 'examide_No', 'citoglipton_No']

df = pd.read_csv(os.path.join(PROCESSED, "diabetes_cleaned.csv"))
row = df.iloc[0].copy()
row['age']        = AGE_MAP.get(str(row['age']), 0)
row['change']     = CHANGE_MAP.get(str(row['change']), 0)
row['diabetesMed']= DIABETES_MAP.get(str(row['diabetesMed']), 0)
sample = pd.DataFrame([{c: row[c] for c in num_cols + cat_cols}])

# RISK
pre1 = pickle.load(open(os.path.join(MODELS, 'preprocessor.pkl'), 'rb'))
m1   = pickle.load(open(os.path.join(MODELS, 'patient_risk_model.pkl'), 'rb'))
ohe1 = pre1.named_transformers_['cat'].named_steps['ohe']
X1 = pd.DataFrame(pre1.transform(sample), columns=num_cols + ohe1.get_feature_names_out(cat_cols).tolist())
X1 = X1.drop(columns=RISK_ZERO_VAR)
proba1 = m1.predict_proba(X1.values)[0][1]
print(f"RISK   : shape={X1.shape}, prob={proba1:.4f}, category={'HIGH RISK' if proba1>=0.5 else 'LOW RISK'}")

# READMISSION
pre2 = pickle.load(open(os.path.join(MODELS, 'readmission_preprocessor.pkl'), 'rb'))
m2   = pickle.load(open(os.path.join(MODELS, 'readmission_model.pkl'), 'rb'))
X2 = pre2.transform(sample)
proba2 = m2.predict_proba(X2)[0][1]
print(f"READMIT: shape={X2.shape}, prob={proba2:.4f}, prediction={'LIKELY READMISSION' if proba2>=0.5 else 'NO READMISSION'}")
print("BOTH PIPELINES VALIDATED OK")
