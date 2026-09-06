# Model Validation Report

## Model
RandomForestClassifier trained on the Diabetes 130-US Hospitals (1999-2008) dataset (101,766 records) to predict 30-day hospital readmission (binary classification).

## Validation Method
The training script (`train_model.py`) was re-run independently to confirm the model's performance is reproducible and not a one-off result.

## Results Comparison

| Metric | Original Training | Validation Re-run | Difference |
|---|---|---|---|
| Accuracy | 0.89 | 0.8877 | -0.0023 |
| Precision | 0.40 | 0.3973 | -0.0027 |
| Recall | 0.013 | 0.0128 | -0.0002 |
| F1-Score | 0.025 | 0.0247 | -0.0003 |
| ROC-AUC | 0.60 | 0.6049 | +0.0049 |

**Conclusion:** All metrics reproduced within ~0.5% of original values, confirming the model's performance is stable and not dependent on random seed variation alone.

## Feature Importance

The re-run also surfaced feature importance rankings, showing which clinical factors the model weighs most heavily:

| Rank | Feature | Importance |
|---|---|---|
| 1 | num_lab_procedures | 24.17% |
| 2 | num_medications | 18.71% |
| 3 | time_in_hospital | 10.73% |
| 4 | age_encoded | 9.26% |
| 5 | num_procedures | 7.81% |
| 6 | number_diagnoses | 7.20% |
| 7 | admission_type_id | 6.21% |
| 8 | number_inpatient | 6.05% |
| 9 | number_outpatient | 3.53% |
| 10 | change_encoded | 2.52% |
| 11 | number_emergency | 2.26% |
| 12 | diabetesMed_encoded | 1.55% |

This is clinically plausible: the number of lab tests and medications a patient receives during a stay are strong proxies for how complex/severe their condition is, which naturally correlates with readmission risk.

## Known Limitations

- **Low recall (1.3%):** The model rarely flags true readmission cases as positive. This is a known limitation of the current feature set and class imbalance in the dataset (most patients are not readmitted within 30 days), and would be a priority area for future improvement (e.g. class rebalancing, additional clinical features).
- **Precision (40%):** When the model does predict "high risk," it is correct about 40% of the time — usable for triage/prioritization but not a substitute for clinical judgment.
- The model was trained on a public research dataset (not this hospital's actual historical data), so performance on real local patient populations may differ.

## Recommendation

The model is suitable for demonstration and triage-support purposes (flagging patients for closer review) but would need further tuning (e.g. class balancing techniques like SMOTE, additional features, threshold tuning) before use in a production clinical setting.