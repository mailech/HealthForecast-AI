import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pickle
import os

np.random.seed(42)
n = 1000

data = {
    'age': np.random.randint(20, 90, size=n),
    'time_in_hospital': np.random.randint(1, 14, size=n),
    'num_lab_procedures': np.random.randint(10, 100, size=n),
    'num_medications': np.random.randint(1, 35, size=n),
    'number_diagnoses': np.random.randint(1, 10, size=n),
    'number_emergency': np.random.randint(0, 5, size=n),
}
df = pd.DataFrame(data)

risk = (
    (df['age'] > 65).astype(int) * 2 +
    (df['time_in_hospital'] > 6).astype(int) * 2 +
    (df['number_emergency'] > 1).astype(int) * 3 +
    (df['num_medications'] > 15).astype(int)
)
df['readmitted'] = (risk >= 4).astype(int)

features = ['age', 'time_in_hospital', 'num_lab_procedures', 'num_medications', 'number_diagnoses', 'number_emergency']
X = df[features]
y = df['readmitted']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

out_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
with open(out_path, 'wb') as f:
    pickle.dump(model, f)

print("SUCCESS: Model trained and saved as model.pkl!")