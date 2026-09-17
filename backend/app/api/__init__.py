from flask import Blueprint

api_bp = Blueprint('api', __name__)

from app.api.auth import auth_bp
from app.api.users import users_bp
from app.api.patients import patients_bp
from app.api.risk_predictions import risk_predictions_bp
from app.api.treatment_effectiveness import treatment_effectiveness_bp
from app.api.clinical_decisions import clinical_decisions_bp
from app.api.analytics import analytics_bp
from app.api.models import models_bp

api_bp.register_blueprint(auth_bp, url_prefix='/auth')
api_bp.register_blueprint(users_bp, url_prefix='/users')
api_bp.register_blueprint(patients_bp, url_prefix='/patients')
api_bp.register_blueprint(risk_predictions_bp, url_prefix='/risk-predictions')
api_bp.register_blueprint(treatment_effectiveness_bp, url_prefix='/treatment-effectiveness')
api_bp.register_blueprint(clinical_decisions_bp, url_prefix='/clinical-decisions')
api_bp.register_blueprint(analytics_bp, url_prefix='/analytics')
api_bp.register_blueprint(models_bp, url_prefix='/models')
