import os
import joblib
import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any
from sklearn.model_selection import GroupShuffleSplit
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from app.core.config import settings

# Path configuration
DATASET_PATH = settings.DATASET_PATH

# Constants & Exclusion lists
EXPIRED_DISPOSITIONS = [11, 13, 14, 19, 20, 21]

ZERO_VARIANCE_MEDS = [
    'examide', 'citoglipton', 'glimepiride-pioglitazone',
    'metformin-rosiglitazone', 'metformin-pioglitazone',
    'acetohexamide', 'troglitazone'
]

EXCLUDED_FEATURES_WITH_REASON = {
    'encounter_id': 'Identifier (Row PK) - Not a predictive feature',
    'patient_nbr': 'Identifier (Patient ID) - Used for GroupShuffleSplit to prevent data leakage',
    'readmitted': 'Target Column - Transformed into Binary Target (<30 = 1, else = 0)',
    'weight': 'High Missingness - 96.86% missing (?) values',
    'discharge_disposition_id': 'Temporal / Post-Planning Leakage - Final discharge destination recorded at/after discharge execution. Excluded to ensure 100% pre-discharge clinical decision support.',
    'examide': 'Zero Variance - 100% No values across 101,766 records',
    'citoglipton': 'Zero Variance - 100% No values across 101,766 records',
    'glimepiride-pioglitazone': 'Near-Zero Variance - Only 1 non-No value',
    'metformin-rosiglitazone': 'Near-Zero Variance - Only 2 non-No values',
    'metformin-pioglitazone': 'Near-Zero Variance - Only 1 non-No value',
    'acetohexamide': 'Near-Zero Variance - Only 1 non-No value',
    'troglitazone': 'Near-Zero Variance - Only 3 non-No values'
}

ACTIVE_MEDICATIONS = [
    'metformin', 'repaglinide', 'nateglinide', 'chlorpropamide', 'glimepiride',
    'glipizide', 'glyburide', 'tolbutamide', 'pioglitazone', 'rosiglitazone',
    'acarbose', 'miglitol', 'tolazamide', 'insulin', 'glyburide-metformin',
    'glipizide-metformin'
]

NUMERICAL_FEATURES = [
    'time_in_hospital', 'num_lab_procedures', 'num_procedures',
    'num_medications', 'number_outpatient', 'number_emergency',
    'number_inpatient', 'number_diagnoses'
]

# Note: discharge_disposition_id REMOVED after temporal audit to guarantee pure pre-discharge predictions
CATEGORICAL_FEATURES = [
    'race', 'gender', 'admission_type_id', 'admission_source_id',
    'payer_code', 'medical_specialty', 'max_glu_serum', 'A1Cresult',
    'diag_1_group', 'diag_2_group', 'diag_3_group'
]

DOSE_MAP = {'No': 0, 'Down': 1, 'Steady': 2, 'Up': 3}
AGE_MAP = {
    '[0-10)': 0, '[10-20)': 1, '[20-30)': 2, '[30-40)': 3,
    '[40-50)': 4, '[50-60)': 5, '[60-70)': 6, '[70-80)': 7,
    '[80-90)': 8, '[90-100)': 9
}

def map_icd9_category(code: Any) -> str:
    """Group ICD-9 diagnosis code into 9 clinical organ system categories."""
    if pd.isna(code) or str(code).strip() == '?':
        return 'Other'
    code_str = str(code).strip()
    if code_str.startswith('250'):
        return 'Diabetes'
    try:
        val = float(code_str)
        if (390 <= val <= 459) or val == 785:
            return 'Circulatory'
        elif (460 <= val <= 519) or val == 786:
            return 'Respiratory'
        elif (520 <= val <= 579) or val == 787:
            return 'Digestive'
        elif (580 <= val <= 629) or val == 788:
            return 'Genitourinary'
        elif (140 <= val <= 239):
            return 'Neoplasms'
        elif (800 <= val <= 999):
            return 'Injury'
        elif (710 <= val <= 739):
            return 'Musculoskeletal'
        else:
            return 'Other'
    except ValueError:
        return 'Other'

class HealthForecastPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.encoder = OneHotEncoder(handle_unknown='ignore', sparse_output=False)
        self.is_fitted = False
        self.feature_names: List[str] = []

    def load_and_clean_raw_dataset(self, csv_path: str = DATASET_PATH) -> pd.DataFrame:
        """Load original CSV unchanged and apply expired-patient filtering."""
        df = pd.read_csv(csv_path)
        
        # Filter out expired / hospice patient encounters (data leakage mitigation)
        df_filtered = df[~df['discharge_disposition_id'].isin(EXPIRED_DISPOSITIONS)].copy()
        
        # Create Binary Target (<30 = 1, NO & >30 = 0)
        df_filtered['target'] = (df_filtered['readmitted'] == '<30').astype(int)
        
        return df_filtered

    def split_data_by_patient_group(
        self,
        df: pd.DataFrame,
        test_size: float = 0.20,
        random_state: int = 42
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Perform patient-level grouped split using GroupShuffleSplit on patient_nbr."""
        gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=random_state)
        train_idx, test_idx = next(gss.split(df, df['target'], groups=df['patient_nbr']))
        
        train_df = df.iloc[train_idx].copy()
        test_df = df.iloc[test_idx].copy()
        
        return train_df, test_df

    def _extract_base_features(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, pd.DataFrame, np.ndarray]:
        """Extract ICD-9 diagnosis groups, ordinal encodings, and numerical features."""
        df_proc = df.copy()
        
        # ICD-9 Diagnosis Grouping
        df_proc['diag_1_group'] = df_proc['diag_1'].apply(map_icd9_category)
        df_proc['diag_2_group'] = df_proc['diag_2'].apply(map_icd9_category)
        df_proc['diag_3_group'] = df_proc['diag_3'].apply(map_icd9_category)
        
        # Handle '?' in categorical variables explicitly
        df_proc['race'] = df_proc['race'].replace('?', 'Unknown_Race')
        df_proc['payer_code'] = df_proc['payer_code'].replace('?', 'Unknown_Payer')
        df_proc['medical_specialty'] = df_proc['medical_specialty'].replace('?', 'Unknown_Specialty')
        
        # Convert IDs to categorical strings
        df_proc['admission_type_id'] = df_proc['admission_type_id'].astype(str)
        df_proc['admission_source_id'] = df_proc['admission_source_id'].astype(str)
        
        # Ordinal Age Mapping
        df_proc['age_encoded'] = df_proc['age'].map(AGE_MAP).fillna(5).astype(float)
        
        # Binary Change & DiabetesMed
        df_proc['change_encoded'] = (df_proc['change'] == 'Ch').astype(float)
        df_proc['diabetesMed_encoded'] = (df_proc['diabetesMed'] == 'Yes').astype(float)
        
        # Active Medication Ordinal Encodings
        med_arrays = []
        for med in ACTIVE_MEDICATIONS:
            med_arrays.append(df_proc[med].map(DOSE_MAP).fillna(0).values)
        med_matrix = np.column_stack(med_arrays)
        
        # Ordinal + Binary + Medication Matrix
        ordinal_matrix = np.column_stack([
            df_proc['age_encoded'].values,
            df_proc['change_encoded'].values,
            df_proc['diabetesMed_encoded'].values,
            med_matrix
        ])
        
        # Categorical Sub-frame for One-Hot Encoding
        cat_df = df_proc[CATEGORICAL_FEATURES].astype(str)
        
        # Numerical Sub-frame for Scaling
        num_matrix = df_proc[NUMERICAL_FEATURES].values.astype(float)
        
        targets = df_proc['target'].values
        
        return num_matrix, ordinal_matrix, cat_df, targets

    def fit_transform(self, train_df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """Fit scaler & encoder strictly on train_df and return preprocessed X_train, y_train."""
        num_train, ord_train, cat_train, y_train = self._extract_base_features(train_df)
        
        # Fit & transform numerical scaler
        num_scaled_train = self.scaler.fit_transform(num_train)
        
        # Fit & transform categorical OneHotEncoder
        cat_ohe_train = self.encoder.fit_transform(cat_train)
        ohe_feature_names = self.encoder.get_feature_names_out(CATEGORICAL_FEATURES).tolist()
        
        # Combine feature matrices
        X_train = np.hstack([num_scaled_train, ord_train, cat_ohe_train])
        
        # Assemble feature names list
        ord_feature_names = ['age_ordinal', 'change_binary', 'diabetesMed_binary'] + [f"med_{m}" for m in ACTIVE_MEDICATIONS]
        self.feature_names = NUMERICAL_FEATURES + ord_feature_names + ohe_feature_names
        
        self.is_fitted = True
        return X_train, y_train, self.feature_names

    def transform(self, test_df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Transform test_df using fitted scaler & encoder (NO fitting on test_df)."""
        if not self.is_fitted:
            raise RuntimeError("Preprocessor must be fitted on training data before calling transform().")
            
        num_test, ord_test, cat_test, y_test = self._extract_base_features(test_df)
        
        num_scaled_test = self.scaler.transform(num_test)
        cat_ohe_test = self.encoder.transform(cat_test)
        
        X_test = np.hstack([num_scaled_test, ord_test, cat_ohe_test])
        return X_test, y_test

    def get_feature_counts(self) -> Dict[str, int]:
        return {
            "total_preprocessed_features": len(self.feature_names),
            "numerical_features": len(NUMERICAL_FEATURES),
            "ordinal_and_medication_features": 3 + len(ACTIVE_MEDICATIONS),
            "one_hot_encoded_features": len(self.feature_names) - (len(NUMERICAL_FEATURES) + 3 + len(ACTIVE_MEDICATIONS))
        }

    def save(self, file_path: str):
        joblib.dump(self, file_path)

    @classmethod
    def load(cls, file_path: str) -> 'HealthForecastPreprocessor':
        return joblib.load(file_path)
