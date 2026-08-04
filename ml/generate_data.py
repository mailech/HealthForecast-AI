import pandas as pd
import numpy as np
import os

def generate_clinical_dataset(num_samples=5000, seed=42):
    np.random.seed(seed)
    
    age = np.random.randint(18, 92, size=num_samples)
    gender = np.random.choice(['Male', 'Female'], size=num_samples, p=[0.48, 0.52])
    prior_admissions = np.random.poisson(lam=1.8, size=num_samples)
    emergency_visits = np.random.poisson(lam=0.9, size=num_samples)
    length_of_stay = np.random.randint(1, 21, size=num_samples)
    
    # Charlson Comorbidity Index (0 to 8)
    charlson_index = np.random.choice(range(9), size=num_samples, p=[0.25, 0.22, 0.18, 0.14, 0.09, 0.05, 0.04, 0.02, 0.01])
    
    # LACE Index components
    lace_index = np.clip((length_of_stay * 0.4) + (emergency_visits * 2) + charlson_index + (prior_admissions * 1.5), 0, 19).astype(int)
    
    # Lab values
    hba1c = np.round(np.random.normal(6.8, 1.4, size=num_samples), 1)
    hba1c = np.clip(hba1c, 4.5, 14.0)
    
    serum_sodium = np.round(np.random.normal(138, 3.5, size=num_samples), 1)
    serum_sodium = np.clip(serum_sodium, 125, 148)
    
    creatinine = np.round(np.random.exponential(1.1, size=num_samples) + 0.5, 2)
    creatinine = np.clip(creatinine, 0.5, 6.5)
    
    polypharmacy_count = np.random.randint(1, 16, size=num_samples)
    
    primary_diagnosis = np.random.choice(
        ['Heart Failure', 'COPD', 'Diabetes Complications', 'Pneumonia', 'Acute Kidney Injury', 'Stroke', 'Post-Surgical Infection'],
        size=num_samples,
        p=[0.22, 0.18, 0.18, 0.16, 0.10, 0.09, 0.07]
    )
    
    discharge_destination = np.random.choice(
        ['Home', 'Home Health Care', 'Skilled Nursing Facility', 'Rehabilitation Unit'],
        size=num_samples,
        p=[0.55, 0.25, 0.13, 0.07]
    )
    
    # Calculate log-odds of 30-day readmission
    log_odds = (
        -3.2
        + 0.025 * (age - 50)
        + 0.35 * prior_admissions
        + 0.45 * emergency_visits
        + 0.08 * length_of_stay
        + 0.30 * charlson_index
        + 0.12 * (lace_index - 7)
        + 0.25 * np.maximum(0, hba1c - 8.0)
        + 0.18 * np.maximum(0, 135 - serum_sodium)
        + 0.30 * np.maximum(0, creatinine - 1.5)
        + 0.08 * (polypharmacy_count - 5)
    )
    
    probability = 1 / (1 + np.exp(-log_odds))
    readmitted_30d = (np.random.rand(num_samples) < probability).astype(int)
    
    df = pd.DataFrame({
        'age': age,
        'gender': gender,
        'prior_admissions': prior_admissions,
        'emergency_visits': emergency_visits,
        'length_of_stay': length_of_stay,
        'charlson_index': charlson_index,
        'lace_index': lace_index,
        'hba1c': hba1c,
        'serum_sodium': serum_sodium,
        'creatinine': creatinine,
        'polypharmacy_count': polypharmacy_count,
        'primary_diagnosis': primary_diagnosis,
        'discharge_destination': discharge_destination,
        'readmitted_30d': readmitted_30d
    })
    
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, 'hospital_readmissions.csv')
    df.to_csv(output_path, index=False)
    print(f"[+] Dataset successfully generated: {output_path} ({num_samples} records)")
    return df

if __name__ == '__main__':
    generate_clinical_dataset()
