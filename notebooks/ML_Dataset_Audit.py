"""
HealthForecast AI: Machine Learning Dataset Audit & Feature Analysis Script
Dataset: Diabetes 130-US Hospitals Dataset (dataset/diabetic_data.csv)
"""

import os
import sys
import pandas as pd
import numpy as np

# Path configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "diabetic_data.csv")

def main():
    print(f"=== HealthForecast AI ML Audit ===")
    print(f"Loading dataset: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)
    
    print(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print("\n--- Target Distribution ---")
    print(df['readmitted'].value_counts())
    print("\n--- Early Readmission (<30) vs Others ---")
    df['early_readmit'] = (df['readmitted'] == '<30').astype(int)
    print(df['early_readmit'].value_counts(normalize=True))
    
    print("\n--- Patient Grouping & Multiple Admissions ---")
    print(f"Unique Patient Nbrs: {df['patient_nbr'].nunique()}")
    print(f"Encounters per Patient Max: {df.groupby('patient_nbr').size().max()}")
    
    print("\n--- Missing Value Count ('?') ---")
    for col in df.columns:
        q_cnt = (df[col].astype(str) == '?').sum()
        if q_cnt > 0:
            print(f"{col}: {q_cnt} ({q_cnt/len(df)*100:.2f}%)")

if __name__ == "__main__":
    main()
