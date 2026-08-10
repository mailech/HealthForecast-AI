"""
Trains the readmission risk model from data already loaded into the
`admissions` table (see load_diabetes_dataset.py) and saves the artifact
that app/services/risk_prediction.py loads at request time.

Usage:
    python -m app.ml.train_readmission_model

This is a Milestone 2 deliverable per the spec: "Train patient risk
prediction models" / "AI prediction models integrated". Kept intentionally
simple (a single XGBoost classifier over the structured admission features)
so it's easy to explain in a viva/demo — swap in a more elaborate pipeline
(feature engineering, calibration, cross-validation) once this baseline
is working end-to-end.
"""
import os

import joblib
import pandas as pd
from sklearn.metrics import roc_auc_score, classification_report
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

from app.core.config import settings
from app.db.session import SessionLocal
from app.models.patient import Admission

FEATURE_COLUMNS = [
    "time_in_hospital",
    "num_lab_procedures",
    "num_procedures",
    "num_medications",
    "number_outpatient",
    "number_emergency",
    "number_inpatient",
    "number_diagnoses",
]


def _load_training_frame() -> pd.DataFrame:
    db = SessionLocal()
    try:
        rows = db.query(Admission).filter(Admission.was_readmitted_30d.isnot(None)).all()
        data = [
            {**{col: getattr(a, col) or 0 for col in FEATURE_COLUMNS}, "label": int(a.was_readmitted_30d)}
            for a in rows
        ]
        return pd.DataFrame(data)
    finally:
        db.close()


def train():
    df = _load_training_frame()
    if len(df) < 50:
        raise SystemExit(
            f"Only {len(df)} labeled admissions found — load the Diabetes 130-US "
            "Hospitals dataset first (see app/ml/load_diabetes_dataset.py)."
        )

    X = df[FEATURE_COLUMNS]
    y = df["label"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

    model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        eval_metric="logloss",
        random_state=42,
    )
    model.fit(X_train, y_train)

    probs = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, probs)
    print(f"ROC-AUC: {auc:.4f}")
    print(classification_report(y_test, model.predict(X_test)))

    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    out_path = os.path.join(settings.MODEL_DIR, settings.READMISSION_MODEL_NAME)
    joblib.dump(model, out_path)
    print(f"Saved model to {out_path}")


if __name__ == "__main__":
    train()
