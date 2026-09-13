from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.utils.seed_data import seed_database
from app.routers import auth, users, patients, dashboard, ml

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set up CORS middleware with strict allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(ml.router, prefix=settings.API_V1_STR)



@app.on_event("startup")
def startup_event():
    # Ensure database schema is created and conditionally seeded on startup
    Base.metadata.create_all(bind=engine)
    if settings.SEED_DEMO_DATA:
        seed_database()


@app.get("/")
def root():
    return {
        "message": "Welcome to HealthForecast AI API",
        "docs": "/docs",
        "version": settings.VERSION,
    }


@app.get(f"{settings.API_V1_STR}/health")
def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}
