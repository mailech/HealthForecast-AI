import pytest
import numpy as np
import pandas as pd
from app.core.config import settings
from ml.preprocessing import HealthForecastPreprocessor, EXCLUDED_FEATURES_WITH_REASON

@pytest.fixture(scope="session")
def preprocessor_and_data():
    preprocessor = HealthForecastPreprocessor()
    df = preprocessor.load_and_clean_raw_dataset(settings.DATASET_PATH)
    train_df, test_df = preprocessor.split_data_by_patient_group(df, test_size=0.20, random_state=42)
    
    X_train, y_train, feature_names = preprocessor.fit_transform(train_df)
    X_test, y_test = preprocessor.transform(test_df)
    
    return {
        'preprocessor': preprocessor,
        'df': df,
        'train_df': train_df,
        'test_df': test_df,
        'X_train': X_train,
        'y_train': y_train,
        'X_test': X_test,
        'y_test': y_test,
        'feature_names': feature_names
    }

def test_no_patient_overlap(preprocessor_and_data):
    train_patients = set(preprocessor_and_data['train_df']['patient_nbr'].unique())
    test_patients = set(preprocessor_and_data['test_df']['patient_nbr'].unique())
    
    overlap = train_patients.intersection(test_patients)
    assert len(overlap) == 0, f"Patient Data Leakage Detected! {len(overlap)} patients overlap between train and test sets."

def test_target_not_in_features(preprocessor_and_data):
    feature_names = preprocessor_and_data['feature_names']
    assert 'readmitted' not in feature_names
    assert 'target' not in feature_names

def test_excluded_features_not_used(preprocessor_and_data):
    feature_names = preprocessor_and_data['feature_names']
    
    excluded = ['encounter_id', 'patient_nbr', 'weight', 'discharge_disposition_id',
                'examide', 'citoglipton', 'glimepiride-pioglitazone', 
                'metformin-rosiglitazone', 'metformin-pioglitazone', 
                'acetohexamide', 'troglitazone']
                
    for feat in excluded:
        assert feat not in feature_names, f"Excluded feature '{feat}' found in predictive feature list!"
        # Also verify OHE variants of discharge_disposition_id are not present
        assert not any(f.startswith("discharge_disposition_id_") for f in feature_names), "OHE discharge_disposition_id found in features!"

def test_valid_numerical_model_input(preprocessor_and_data):
    X_train = preprocessor_and_data['X_train']
    X_test = preprocessor_and_data['X_test']
    
    # Assert no NaNs or Infs
    assert not np.isnan(X_train).any(), "X_train contains NaN values!"
    assert not np.isnan(X_test).any(), "X_test contains NaN values!"
    assert not np.isinf(X_train).any(), "X_train contains Inf values!"
    assert not np.isinf(X_test).any(), "X_test contains Inf values!"
    
    # Assert correct shapes
    assert X_train.shape[1] == X_test.shape[1]
    assert X_train.shape[0] == len(preprocessor_and_data['y_train'])
    assert X_test.shape[0] == len(preprocessor_and_data['y_test'])

def test_strict_train_test_isolation(preprocessor_and_data):
    preprocessor = preprocessor_and_data['preprocessor']
    test_df = preprocessor_and_data['test_df']
    
    scaler_mean_before = preprocessor.scaler.mean_.copy()
    
    # Transform test set again
    _ = preprocessor.transform(test_df)
    
    scaler_mean_after = preprocessor.scaler.mean_
    np.testing.assert_array_equal(scaler_mean_before, scaler_mean_after, err_msg="Preprocessor parameters changed during test transform!")

def test_binary_target_distribution(preprocessor_and_data):
    y_train = preprocessor_and_data['y_train']
    y_test = preprocessor_and_data['y_test']
    
    unique_train = np.unique(y_train)
    unique_test = np.unique(y_test)
    
    assert set(unique_train).issubset({0, 1})
    assert set(unique_test).issubset({0, 1})
    
    # Verify minority class is present in both folds
    assert (y_train == 1).sum() > 0
    assert (y_test == 1).sum() > 0
