import logging
from pymongo import MongoClient, ASCENDING
from app.config import settings

logger = logging.getLogger("app.database")

# Initialize MongoClient and collections as required
client = MongoClient(settings.MONGODB_URL)
db = client[settings.DATABASE_NAME]

users_collection = db["users"]
patients_collection = db["patients"]
medical_histories_collection = db["medical_histories"]
predictions_collection = db["predictions"]
treatments_collection = db["treatments"]

def init_db():
    """
    Verify database connection and initialize required indexes.
    """
    try:
        # Ping database during startup
        client.admin.command('ping')
        logger.info("Successfully connected and pinged MongoDB Atlas.")
        
        # Create unique index for user email
        users_collection.create_index([("email", ASCENDING)], unique=True)
        # Create index for user role
        users_collection.create_index([("role", ASCENDING)])
        # Create index for user hospital
        users_collection.create_index([("hospital", ASCENDING)])
        
        # Create unique index for patient_id
        patients_collection.create_index([("patient_id", ASCENDING)], unique=True)
        # Create index for patient hospital
        patients_collection.create_index([("hospital", ASCENDING)])
        
        # Create index for medical history patient_id
        medical_histories_collection.create_index([("patient_id", ASCENDING)])
        
        # Create index for prediction patient_id and risk_level
        predictions_collection.create_index([("patient_id", ASCENDING)])
        predictions_collection.create_index([("risk_level", ASCENDING)])
        
        # Create index for treatments patient_id
        treatments_collection.create_index([("patient_id", ASCENDING)])
        
        logger.info("MongoDB indexes successfully verified and initialized.")
    except Exception as e:
        logger.error(f"MongoDB initialization error: {e}")
        raise e
