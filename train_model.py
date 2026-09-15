import pandas as pd
import joblib

from ucimlrepo import fetch_ucirepo
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


print("Downloading Heart Disease dataset...")

# Fetch the UCI Heart Disease dataset
heart_disease = fetch_ucirepo(id=45)

X = heart_disease.data.features
y = heart_disease.data.targets


print("Dataset downloaded successfully!")
print("Dataset shape:", X.shape)


# Convert target into binary classification
# 0 = No heart disease
# 1 = Heart disease
y = y["num"].apply(lambda value: 0 if value == 0 else 1)


# Handle missing values
X = X.replace("?", pd.NA)

X = X.apply(pd.to_numeric, errors="coerce")

X = X.fillna(X.median())


# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# Scale the features
scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)


# Create and train model
model = LogisticRegression(max_iter=1000)

model.fit(X_train_scaled, y_train)


# Make predictions
y_pred = model.predict(X_test_scaled)


# Evaluate model
accuracy = accuracy_score(y_test, y_pred)

print("\nModel Training Complete!")
print("Accuracy:", accuracy)

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# Save model and scaler
joblib.dump(model, "ml/heart_disease_model.pkl")
joblib.dump(scaler, "ml/scaler.pkl")

print("\nModel saved successfully!")
print("heart_disease_model.pkl")
print("scaler.pkl")