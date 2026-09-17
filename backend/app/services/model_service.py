from app.models.model_management import AIModel, ModelEvaluation, ModelTrainingJob, ModelStatus, ModelType
from app import db
from datetime import datetime
import os
import json
import uuid

class ModelService:
    """Service for AI model management operations"""
    
    @staticmethod
    def create_model(data):
        """Create a new AI model record"""
        model = AIModel(
            model_name=data['model_name'],
            model_type=ModelType(data['model_type']),
            version=data['version'],
            status=ModelStatus(data.get('status', 'training')),
            description=data.get('description'),
            algorithm=data.get('algorithm'),
            framework=data.get('framework'),
            accuracy=data.get('accuracy'),
            precision=data.get('precision'),
            recall=data.get('recall'),
            f1_score=data.get('f1_score'),
            auc_roc=data.get('auc_roc'),
            training_data_size=data.get('training_data_size'),
            training_date=datetime.strptime(data['training_date'], '%Y-%m-%d %H:%M:%S') if data.get('training_date') else None,
            training_duration=data.get('training_duration'),
            model_path=data.get('model_path'),
            config_path=data.get('config_path'),
            hyperparameters=data.get('hyperparameters'),
            feature_importance=data.get('feature_importance'),
            training_metrics=data.get('training_metrics')
        )
        
        db.session.add(model)
        db.session.commit()
        
        return model
    
    @staticmethod
    def get_model(model_id):
        """Get model by ID"""
        return AIModel.query.get(model_id)
    
    @staticmethod
    def get_model_by_name(model_name):
        """Get model by name"""
        return AIModel.query.filter_by(model_name=model_name).first()
    
    @staticmethod
    def get_all_models(model_type=None, status=None, page=1, per_page=20):
        """Get all models with filtering"""
        query = AIModel.query
        
        if model_type:
            query = query.filter_by(model_type=ModelType(model_type))
        if status:
            query = query.filter_by(status=ModelStatus(status))
        
        return query.order_by(AIModel.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
    
    @staticmethod
    def update_model(model_id, data):
        """Update model information"""
        model = AIModel.query.get(model_id)
        if not model:
            raise ValueError('Model not found')
        
        # Update fields
        if 'model_name' in data:
            model.model_name = data['model_name']
        if 'status' in data:
            model.status = ModelStatus(data['status'])
            if data['status'] == 'deployed' and not model.deployed_date:
                model.deployed_date = datetime.utcnow()
        if 'description' in data:
            model.description = data['description']
        if 'accuracy' in data:
            model.accuracy = data['accuracy']
        if 'precision' in data:
            model.precision = data['precision']
        if 'recall' in data:
            model.recall = data['recall']
        if 'f1_score' in data:
            model.f1_score = data['f1_score']
        if 'auc_roc' in data:
            model.auc_roc = data['auc_roc']
        if 'deployment_endpoint' in data:
            model.deployment_endpoint = data['deployment_endpoint']
        if 'is_active' in data:
            model.is_active = data['is_active']
        if 'hyperparameters' in data:
            model.hyper_parameters = data['hyperparameters']
        if 'feature_importance' in data:
            model.feature_importance = data['feature_importance']
        
        model.updated_at = datetime.utcnow()
        db.session.commit()
        
        return model
    
    @staticmethod
    def delete_model(model_id):
        """Delete a model"""
        model = AIModel.query.get(model_id)
        if not model:
            raise ValueError('Model not found')
        
        # Delete model file if exists
        if model.model_path and os.path.exists(model.model_path):
            os.remove(model.model_path)
        
        db.session.delete(model)
        db.session.commit()
        
        return True
    
    @staticmethod
    def deploy_model(model_id, deployment_endpoint):
        """Deploy a model"""
        model = AIModel.query.get(model_id)
        if not model:
            raise ValueError('Model not found')
        
        if model.status != ModelStatus.TRAINED:
            raise ValueError('Model must be trained before deployment')
        
        model.status = ModelStatus.DEPLOYED
        model.deployed_date = datetime.utcnow()
        model.deployment_endpoint = deployment_endpoint
        model.is_active = True
        
        # Deactivate other models of same type
        AIModel.query.filter(
            AIModel.model_type == model.model_type,
            AIModel.id != model_id
        ).update({'is_active': False})
        
        model.updated_at = datetime.utcnow()
        db.session.commit()
        
        return model
    
    @staticmethod
    def deactivate_model(model_id):
        """Deactivate a deployed model"""
        model = AIModel.query.get(model_id)
        if not model:
            raise ValueError('Model not found')
        
        model.is_active = False
        model.updated_at = datetime.utcnow()
        db.session.commit()
        
        return model
    
    @staticmethod
    def create_model_evaluation(model_id, data):
        """Create a model evaluation"""
        model = AIModel.query.get(model_id)
        if not model:
            raise ValueError('Model not found')
        
        evaluation = ModelEvaluation(
            model_id=model_id,
            evaluation_date=datetime.utcnow(),
            test_accuracy=data.get('test_accuracy'),
            test_precision=data.get('test_precision'),
            test_recall=data.get('test_recall'),
            test_f1_score=data.get('test_f1_score'),
            test_auc_roc=data.get('test_auc_roc'),
            test_data_size=data.get('test_data_size'),
            test_data_period=data.get('test_data_period'),
            confusion_matrix=data.get('confusion_matrix'),
            evaluation_metrics=data.get('evaluation_metrics'),
            performance_comparison=data.get('performance_comparison'),
            notes=data.get('notes'),
            evaluator=data.get('evaluator')
        )
        
        db.session.add(evaluation)
        db.session.commit()
        
        return evaluation
    
    @staticmethod
    def get_model_evaluations(model_id, page=1, per_page=20):
        """Get evaluations for a model"""
        return ModelEvaluation.query.filter_by(model_id=model_id).order_by(
            ModelEvaluation.evaluation_date.desc()
        ).paginate(page=page, per_page=per_page, error_out=False)
    
    @staticmethod
    def create_training_job(model_id, data):
        """Create a model training job"""
        model = AIModel.query.get(model_id) if model_id else None
        
        job = ModelTrainingJob(
            model_id=model_id,
            job_name=data['job_name'],
            status=ModelStatus(data.get('status', 'training')),
            training_config=data.get('training_config'),
            data_source=data.get('data_source'),
            data_split=data.get('data_split'),
            total_epochs=data.get('total_epochs')
        )
        
        db.session.add(job)
        db.session.commit()
        
        return job
    
    @staticmethod
    def update_training_job(job_id, data):
        """Update training job progress"""
        job = ModelTrainingJob.query.get(job_id)
        if not job:
            raise ValueError('Training job not found')
        
        if 'progress' in data:
            job.progress = data['progress']
        if 'current_epoch' in data:
            job.current_epoch = data['current_epoch']
        if 'training_loss' in data:
            job.training_loss = data['training_loss']
        if 'validation_loss' in data:
            job.validation_loss = data['validation_loss']
        if 'status' in data:
            job.status = ModelStatus(data['status'])
            if data['status'] == 'deployed':
                job.completed_at = datetime.utcnow()
        if 'error_message' in data:
            job.error_message = data['error_message']
        if 'logs' in data:
            job.logs = data['logs']
        if 'final_metrics' in data:
            job.final_metrics = data['final_metrics']
        if 'cpu_usage' in data:
            job.cpu_usage = data['cpu_usage']
        if 'memory_usage' in data:
            job.memory_usage = data['memory_usage']
        if 'gpu_usage' in data:
            job.gpu_usage = data['gpu_usage']
        
        job.updated_at = datetime.utcnow()
        db.session.commit()
        
        return job
    
    @staticmethod
    def get_training_jobs(model_id=None, status=None, page=1, per_page=20):
        """Get training jobs"""
        query = ModelTrainingJob.query
        
        if model_id:
            query = query.filter_by(model_id=model_id)
        if status:
            query = query.filter_by(status=ModelStatus(status))
        
        return query.order_by(ModelTrainingJob.started_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
    
    @staticmethod
    def get_active_model_by_type(model_type):
        """Get the currently active model for a given type"""
        return AIModel.query.filter_by(
            model_type=ModelType(model_type),
            is_active=True
        ).first()
    
    @staticmethod
    def compare_models(model_ids):
        """Compare multiple models"""
        models = AIModel.query.filter(AIModel.id.in_(model_ids)).all()
        
        comparison = []
        for model in models:
            evaluations = ModelEvaluation.query.filter_by(model_id=model.id).all()
            latest_eval = evaluations[0] if evaluations else None
            
            comparison.append({
                'model': model.to_dict(),
                'latest_evaluation': latest_eval.to_dict() if latest_eval else None
            })
        
        return comparison
