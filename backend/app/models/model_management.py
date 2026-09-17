from datetime import datetime
from app import db
import enum

class ModelStatus(enum.Enum):
    TRAINING = "training"
    TRAINED = "trained"
    DEPLOYED = "deployed"
    DEPRECATED = "deprecated"
    FAILED = "failed"

class ModelType(enum.Enum):
    RISK_PREDICTION = "risk_prediction"
    READMISSION_PREDICTION = "readmission_prediction"
    TREATMENT_EFFECTIVENESS = "treatment_effectiveness"
    CLINICAL_DECISION = "clinical_decision"

class AIModel(db.Model):
    """AI Model management"""
    __tablename__ = 'ai_models'
    
    id = db.Column(db.Integer, primary_key=True)
    model_name = db.Column(db.String(255), unique=True, nullable=False)
    model_type = db.Column(db.Enum(ModelType), nullable=False)
    version = db.Column(db.String(50), nullable=False)
    status = db.Column(db.Enum(ModelStatus), default=ModelStatus.TRAINING)
    
    # Model metadata
    description = db.Column(db.Text)
    algorithm = db.Column(db.String(100))
    framework = db.Column(db.String(50))
    
    # Performance metrics
    accuracy = db.Column(db.Float)
    precision = db.Column(db.Float)
    recall = db.Column(db.Float)
    f1_score = db.Column(db.Float)
    auc_roc = db.Column(db.Float)
    
    # Training data
    training_data_size = db.Column(db.Integer)
    training_date = db.Column(db.DateTime)
    training_duration = db.Column(db.Float)  # in seconds
    
    # File paths
    model_path = db.Column(db.String(500))
    config_path = db.Column(db.String(500))
    
    # Deployment info
    deployed_date = db.Column(db.DateTime)
    deployment_endpoint = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=False)
    
    # Additional metadata
    hyperparameters = db.Column(db.JSON)
    feature_importance = db.Column(db.JSON)
    training_metrics = db.Column(db.JSON)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    model_evaluations = db.relationship('ModelEvaluation', backref='model', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'model_name': self.model_name,
            'model_type': self.model_type.value,
            'version': self.version,
            'status': self.status.value,
            'description': self.description,
            'algorithm': self.algorithm,
            'framework': self.framework,
            'accuracy': self.accuracy,
            'precision': self.precision,
            'recall': self.recall,
            'f1_score': self.f1_score,
            'auc_roc': self.auc_roc,
            'training_data_size': self.training_data_size,
            'training_date': self.training_date.isoformat() if self.training_date else None,
            'training_duration': self.training_duration,
            'model_path': self.model_path,
            'config_path': self.config_path,
            'deployed_date': self.deployed_date.isoformat() if self.deployed_date else None,
            'deployment_endpoint': self.deployment_endpoint,
            'is_active': self.is_active,
            'hyperparameters': self.hyperparameters,
            'feature_importance': self.feature_importance,
            'training_metrics': self.training_metrics,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class ModelEvaluation(db.Model):
    """Model evaluation results"""
    __tablename__ = 'model_evaluations'
    
    id = db.Column(db.Integer, primary_key=True)
    model_id = db.Column(db.Integer, db.ForeignKey('ai_models.id'), nullable=False)
    evaluation_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    
    # Evaluation metrics
    test_accuracy = db.Column(db.Float)
    test_precision = db.Column(db.Float)
    test_recall = db.Column(db.Float)
    test_f1_score = db.Column(db.Float)
    test_auc_roc = db.Column(db.Float)
    
    # Test data info
    test_data_size = db.Column(db.Integer)
    test_data_period = db.Column(db.String(100))
    
    # Confusion matrix
    confusion_matrix = db.Column(db.JSON)
    
    # Additional metrics
    evaluation_metrics = db.Column(db.JSON)
    performance_comparison = db.Column(db.JSON)
    
    # Evaluation notes
    notes = db.Column(db.Text)
    evaluator = db.Column(db.String(100))
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'model_id': self.model_id,
            'evaluation_date': self.evaluation_date.isoformat(),
            'test_accuracy': self.test_accuracy,
            'test_precision': self.test_precision,
            'test_recall': self.test_recall,
            'test_f1_score': self.test_f1_score,
            'test_auc_roc': self.test_auc_roc,
            'test_data_size': self.test_data_size,
            'test_data_period': self.test_data_period,
            'confusion_matrix': self.confusion_matrix,
            'evaluation_metrics': self.evaluation_metrics,
            'performance_comparison': self.performance_comparison,
            'notes': self.notes,
            'evaluator': self.evaluator,
            'created_at': self.created_at.isoformat()
        }

class ModelTrainingJob(db.Model):
    """Model training job tracking"""
    __tablename__ = 'model_training_jobs'
    
    id = db.Column(db.Integer, primary_key=True)
    model_id = db.Column(db.Integer, db.ForeignKey('ai_models.id'))
    job_name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.Enum(ModelStatus), default=ModelStatus.TRAINING)
    
    # Training configuration
    training_config = db.Column(db.JSON)
    data_source = db.Column(db.String(255))
    data_split = db.Column(db.JSON)  # train/val/test split ratios
    
    # Progress tracking
    progress = db.Column(db.Float, default=0)  # 0-100
    current_epoch = db.Column(db.Integer)
    total_epochs = db.Column(db.Integer)
    
    # Timing
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    estimated_completion = db.Column(db.DateTime)
    
    # Results
    training_loss = db.Column(db.Float)
    validation_loss = db.Column(db.Float)
    final_metrics = db.Column(db.JSON)
    
    # Error handling
    error_message = db.Column(db.Text)
    logs = db.Column(db.JSON)
    
    # Resource usage
    cpu_usage = db.Column(db.JSON)
    memory_usage = db.Column(db.JSON)
    gpu_usage = db.Column(db.JSON)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'model_id': self.model_id,
            'job_name': self.job_name,
            'status': self.status.value,
            'training_config': self.training_config,
            'data_source': self.data_source,
            'data_split': self.data_split,
            'progress': self.progress,
            'current_epoch': self.current_epoch,
            'total_epochs': self.total_epochs,
            'started_at': self.started_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'estimated_completion': self.estimated_completion.isoformat() if self.estimated_completion else None,
            'training_loss': self.training_loss,
            'validation_loss': self.validation_loss,
            'final_metrics': self.final_metrics,
            'error_message': self.error_message,
            'logs': self.logs,
            'cpu_usage': self.cpu_usage,
            'memory_usage': self.memory_usage,
            'gpu_usage': self.gpu_usage,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
