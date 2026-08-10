import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.preprocessing import LabelEncoder

df = pd.read_csv("data/diabetic_data.csv")
df["readmitted_binary"] = (df["readmitted"] == "<30").astype(int)

le_age = LabelEncoder()
df["age_encoded"] = le_age.fit_transform(df["age"])

df["change_encoded"] = (df["change"] == "Ch").astype(int)
df["diabetesMed_encoded"] = (df["diabetesMed"] == "Yes").astype(int)

features = [
    "time_in_hospital",
    "num_lab_procedures",
    "num_procedures",
    "num_medications",
    "number_outpatient",
    "number_emergency",
    "number_inpatient",
    "number_diagnoses",
    "age_encoded",
    "admission_type_id",
    "change_encoded",
    "diabetesMed_encoded",
]

X = df[features]
y = df["readmitted_binary"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(n_estimators=200, random_state=42, class_weight="balanced")
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

print("Accuracy:", accuracy_score(y_test, y_pred))
print("Precision:", precision_score(y_test, y_pred))
print("Recall:", recall_score(y_test, y_pred))
print("F1-score:", f1_score(y_test, y_pred))
print("ROC-AUC:", roc_auc_score(y_test, y_prob))

print("\nFeature importances:")
for name, importance in sorted(zip(features, model.feature_importances_), key=lambda x: -x[1]):
    print(f"{name}: {importance:.4f}")

import joblib
joblib.dump(model, "risk_model.pkl")
joblib.dump(le_age, "age_encoder.pkl")
print("\nModel saved successfully!")