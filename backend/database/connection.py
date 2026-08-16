from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "healthforecast")

client = MongoClient(MONGO_URI)

db = client[DATABASE_NAME]

patients_collection = db["patients"]
users_collection = db["users"]
reports_collection = db["reports"]