import logging
from app.ai.predictor import predictor_instance

logger = logging.getLogger("app.ai.model_loader")

def warm_up_model():
    """
    Called during app startup. Loads the model and scale objects into memory.
    """
    logger.info("Warming up ML Model...")
    try:
        predictor_instance.load_model()
        logger.info("ML Model warming up complete. Ready for predictions.")
    except Exception as e:
        logger.critical(f"Failed to warm up ML model: {e}")
        raise e
