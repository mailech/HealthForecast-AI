import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.crud.crud_user import seed_initial_roles_and_admin
from app.services.dataset_service import seed_dataset_from_csv
from app.api.v1.api_router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if not exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Seed initial roles and admin users
    async with AsyncSessionLocal() as session:
        await seed_initial_roles_and_admin(session)
        # Auto-seed initial dataset records (e.g. 2000 rows from diabetic_data.csv)
        await seed_dataset_from_csv(session, max_rows=2000)
        
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "title": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
