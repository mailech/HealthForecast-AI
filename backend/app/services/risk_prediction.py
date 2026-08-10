"""
Readmission risk prediction service.

Milestone 1 ships with a transparent, documented heuristic so every endpoint
is testable end-to-end immediately. Milestone 2 replaces `_heuristic_score`
with a real model loaded from app/ml/artifacts/ (trained in
app/ml/train_readmission_model.py) — the public function signature does not
change, so nothing above this layer needs to be touched.
"""
import os

import joblib

from app.core.config import settings
from app.models.patient import Admission

_model_cache = None


def _load_model():
    global _model_cache
    if _model_cache is not None:
        return _model_cache
    path = os.path.join(settings.MODEL_DIR, settings.READMISSION_MODEL_NAME)
    if os.path.exists(path):
        _model_cache = joblib.load(path)
    return _model_cache


def _heuristic_score(admission: Admission) -> float:
    """Documented placeholder logic — NOT clinically validated.
    Weights loosely follow known readmission risk factors (prior utilization,
    length of stay, medication burden) so behavior is sane pending training."""
    score = 0.1
    score += 0.05 * (admission.number_inpatient or 0)
    score += 0.04 * (admission.number_emergency or 0)
    score += 0.02 * (admission.number_outpatient or 0)
    score += 0.015 * (admission.time_in_hospital or 0)
    score += 0.01 * (admission.num_medications or 0)
    score += 0.01 * (admission.number_diagnoses or 0)
    return max(0.01, min(0.99, score))


def predict_readmission_risk(admission: Admission) -> tuple[float, str, str, float | None]:
    """Returns (probability, risk_category, model_version, confidence_score)."""
    model = _load_model()

    if model is not None:
        features = [[
            admission.time_in_hospital or 0,
            admission.num_lab_procedures or 0,
            admission.num_procedures or 0,
            admission.num_medications or 0,
            admission.number_outpatient or 0,
            admission.number_emergency or 0,
            admission.number_inpatient or 0,
            admission.number_diagnoses or 0,
        ]]
        probability = float(model.predict_proba(features)[0][1])
        model_version = settings.READMISSION_MODEL_NAME
        confidence = float(max(model.predict_proba(features)[0]))
    else:
        probability = _heuristic_score(admission)
        model_version = "heuristic-v0"
        confidence = None

    if probability >= 0.6:
        category = "high"
    elif probability >= 0.3:
        category = "medium"
    else:
        category = "low"

    return probability, category, model_version, confidence
