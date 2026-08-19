import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from xgboost import XGBClassifier

from app.config import settings

MEDICATION_COLS = [
    "metformin", "repaglinide", "nateglinide", "chlorpropamide",
    "glimepiride", "acetohexamide", "glipizide", "glyburide",
    "tolbutamide", "pioglitazone", "rosiglitazone", "acarbose",
    "miglitol", "troglitazone", "tolazamide", "examide",
    "citoglipton", "insulin", "glyburide-metformin", "glipizide-metformin",
    "glimepiride-pioglitazone", "metformin-rosiglitazone", "metformin-pioglitazone",
]

FEATURE_COLS = [
    "race", "gender", "age", "admission_type_id", "discharge_disposition_id",
    "admission_source_id", "time_in_hospital", "num_lab_procedures",
    "num_procedures", "num_medications", "number_outpatient",
    "number_emergency", "number_inpatient", "number_diagnoses",
    "max_glu_serum", "A1Cresult", "change", "diabetesMed",
] + MEDICATION_COLS


class DataPreprocessor:
    @staticmethod
    def load_dataset(path: str) -> pd.DataFrame:
        df = pd.read_csv(path)
        df = df.replace("?", np.nan)
        df = df.dropna(subset=["readmitted"])
        df["target"] = (df["readmitted"] == "<30").astype(int)
        return df

    @staticmethod
    def patient_to_features(patient_data: Dict[str, Any]) -> pd.DataFrame:
        row = {}
        for col in FEATURE_COLS:
            val = patient_data.get(col)
            if val is None:
                mapped = {
                    "A1Cresult": "a1cresult",
                    "diabetesMed": "diabetes_med",
                }.get(col)
                if mapped:
                    val = patient_data.get(mapped)
            if val is None:
                if col in MEDICATION_COLS:
                    val = "No"
                elif col in ["race", "gender", "age", "max_glu_serum", "A1Cresult", "change", "diabetesMed"]:
                    val = "Unknown"
                else:
                    val = 0
            row[col] = val
        return pd.DataFrame([row])


class ModelTrainer:
    def __init__(self, model_dir: str = settings.ml_model_dir):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)
        self.metrics: Dict[str, Any] = {}

    def _prepare_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        available = [c for c in FEATURE_COLS if c in df.columns]
        X = df[available].copy()
        y = df["target"]
        for col in X.select_dtypes(include=["object"]).columns:
            X[col] = X[col].fillna("Unknown")
        for col in X.select_dtypes(include=[np.number]).columns:
            X[col] = X[col].fillna(0)
        return X, y

    def _build_pipeline(self, model_type: str, X: pd.DataFrame) -> Pipeline:
        cat_cols = X.select_dtypes(include=["object"]).columns.tolist()
        num_cols = X.select_dtypes(include=[np.number]).columns.tolist()

        transformers = []
        if num_cols:
            transformers.append(("num", StandardScaler(), num_cols))
        if cat_cols:
            transformers.append(
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols)
            )

        preprocessor = ColumnTransformer(transformers=transformers)

        if model_type == "xgboost":
            model = XGBClassifier(
                n_estimators=100, max_depth=6, learning_rate=0.1,
                random_state=42, eval_metric="logloss",
            )
        else:
            model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)

        return Pipeline([("preprocessor", preprocessor), ("classifier", model)])

    def train(self, df: pd.DataFrame, model_type: str = "random_forest") -> Dict[str, float]:
        X, y = self._prepare_features(df)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )

        pipeline = self._build_pipeline(model_type, X)
        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]

        metrics = {
            "accuracy": float(accuracy_score(y_test, y_pred)),
            "precision": float(precision_score(y_test, y_pred, zero_division=0)),
            "recall": float(recall_score(y_test, y_pred, zero_division=0)),
            "f1_score": float(f1_score(y_test, y_pred, zero_division=0)),
            "roc_auc": float(roc_auc_score(y_test, y_prob)),
        }

        model_path = self.model_dir / f"{model_type}_model.joblib"
        joblib.dump(pipeline, model_path)

        metrics_path = self.model_dir / f"{model_type}_metrics.json"
        metrics["model_name"] = model_type
        metrics["trained_at"] = pd.Timestamp.now().isoformat()
        with open(metrics_path, "w") as f:
            json.dump(metrics, f, indent=2)

        self.metrics[model_type] = metrics
        return metrics


class PredictionEngine:
    def __init__(self, model_dir: str = settings.ml_model_dir):
        self.model_dir = Path(model_dir)
        self._models: Dict[str, Pipeline] = {}

    def load_model(self, model_type: str = "random_forest") -> Pipeline:
        if model_type not in self._models:
            path = self.model_dir / f"{model_type}_model.joblib"
            if not path.exists():
                raise FileNotFoundError(f"Model not found: {path}. Run training first.")
            self._models[model_type] = joblib.load(path)
        return self._models[model_type]

    def predict(self, patient_data: Dict[str, Any], model_type: str = "random_forest") -> Dict[str, Any]:
        model = self.load_model(model_type)
        features = DataPreprocessor.patient_to_features(patient_data)
        prob = float(model.predict_proba(features)[0][1])
        risk_score = round(prob * 100, 2)

        if risk_score >= 70:
            category = "High"
        elif risk_score >= 40:
            category = "Medium"
        else:
            category = "Low"

        importance = self._get_feature_importance(model, features)
        return {
            "risk_score": risk_score,
            "risk_category": category,
            "readmission_probability": round(prob, 4),
            "model_used": model_type,
            "feature_importance": importance,
        }

    def _get_feature_importance(self, model: Pipeline, features: pd.DataFrame) -> Dict[str, float]:
        try:
            classifier = model.named_steps["classifier"]
            if hasattr(classifier, "feature_importances_"):
                preprocessor = model.named_steps["preprocessor"]
                names = preprocessor.get_feature_names_out()
                importances = classifier.feature_importances_
                top_indices = np.argsort(importances)[-10:][::-1]
                return {str(names[i]): float(importances[i]) for i in top_indices}
        except Exception:
            pass
        return {}

    @staticmethod
    def get_risk_category(score: float) -> str:
        if score >= 70:
            return "High"
        if score >= 40:
            return "Medium"
        return "Low"

    @staticmethod
    def load_metrics(model_type: str = "random_forest") -> Optional[Dict]:
        path = Path(settings.ml_model_dir) / f"{model_type}_metrics.json"
        if path.exists():
            with open(path) as f:
                return json.load(f)
        return None
