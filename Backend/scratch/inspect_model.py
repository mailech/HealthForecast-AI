import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.ai.predictor import predictor_instance
predictor_instance.load_model()
m1 = predictor_instance.risk_model
m2 = predictor_instance.readmission_model
print('Model 1 type:', type(m1))
print('Model 2 type:', type(m2))

import pandas as pd
if hasattr(m1, 'feature_importances_'):
    fi1 = pd.Series(m1.feature_importances_, index=predictor_instance.risk_cols).sort_values(ascending=False)
    print('Model 1 top 15 features:\n', fi1.head(15))
if hasattr(m2, 'feature_importances_'):
    fi2 = pd.Series(m2.feature_importances_, index=predictor_instance.readmit_cols).sort_values(ascending=False)
    print('Model 2 top 15 features:\n', fi2.head(15))
