from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

DATABASE_NAME = os.getenv("DATABASE_NAME", "healthforecast")

client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=10000
)

db = client[DATABASE_NAME]

# =========================================================
# EXISTING COLLECTIONS
# =========================================================

patients_collection = db["patients"]

users_collection = db["users"]

reports_collection = db["reports"]


# =========================================================
# RBAC / SYSTEM ADMIN COLLECTIONS
# =========================================================

# Stores security/audit events
audit_logs_collection = db["audit_logs"]

# Stores information about datasets used by the system
datasets_collection = db["datasets"]

# Stores system-level configuration/settings
system_settings_collection = db["system_settings"]