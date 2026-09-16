import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.ai.predictor import predictor_instance

# Test case 1: Low risk profile
p1 = predictor_instance.predict({
    'age': '[40-50)', 'time_in_hospital': 2, 'num_lab_procedures': 20, 'num_procedures': 0,
    'num_medications': 3, 'number_outpatient': 0, 'number_emergency': 0, 'number_inpatient': 0,
    'number_diagnoses': 3, 'change': 'No', 'diabetesMed': 'No', 'diag_1': '401', 'diag_2': '272', 'diag_3': 'V58'
})
print('Test 1 (Low Risk):', p1['risk_level'], f"{p1['readmission_risk_score']*100:.1f}%", p1['model1_prediction'], p1['model2_prediction'])

# Test case 2: Moderate risk profile
p2 = predictor_instance.predict({
    'age': '[60-70)', 'time_in_hospital': 5, 'num_lab_procedures': 55, 'num_procedures': 2,
    'num_medications': 12, 'number_outpatient': 1, 'number_emergency': 0, 'number_inpatient': 1,
    'number_diagnoses': 7, 'change': 'Ch', 'diabetesMed': 'Yes', 'diag_1': '250.01', 'diag_2': '401', 'diag_3': '272',
    'metformin': 'Steady', 'insulin': 'Steady'
})
print('Test 2 (Moderate Risk):', p2['risk_level'], f"{p2['readmission_risk_score']*100:.1f}%", p2['model1_prediction'], p2['model2_prediction'])

# Test case 3: High risk profile
p3 = predictor_instance.predict({
    'age': '[70-80)', 'time_in_hospital': 9, 'num_lab_procedures': 85, 'num_procedures': 4,
    'num_medications': 22, 'number_outpatient': 2, 'number_emergency': 2, 'number_inpatient': 3,
    'number_diagnoses': 11, 'change': 'Ch', 'diabetesMed': 'Yes', 'diag_1': '250.01', 'diag_2': '410', 'diag_3': '401',
    'metformin': 'Up', 'insulin': 'Up', 'glipizide': 'Steady'
})
print('Test 3 (High Risk):', p3['risk_level'], f"{p3['readmission_risk_score']*100:.1f}%", p3['model1_prediction'], p3['model2_prediction'])
