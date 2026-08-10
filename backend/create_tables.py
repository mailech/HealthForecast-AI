from app.database import engine, Base
from app import models

Base.metadata.create_all(bind=engine)
print("Tables created successfully!")