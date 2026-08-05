import pandas as pd
import joblib

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier

# Load dataset
data = pd.read_csv("database/patient_risk.csv")

# Input features
X = data[["age", "gender", "disease"]]

# Target
y = data["risk"]

# Encode text columns
preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), ["gender", "disease"])
    ],
    remainder="passthrough"
)

# AI Model
model = Pipeline([
    ("preprocessor", preprocessor),
    ("classifier", RandomForestClassifier(random_state=42))
])

# Train
model.fit(X, y)

# Save model
joblib.dump(model, "risk_model.pkl")

print("✅ AI Model Trained Successfully!")