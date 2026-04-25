from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, predict, patients, admin
from app.db.session import engine
from app.db.base import Base

# Create Tables (Simple implementation for creating tables on startup)
Base.metadata.create_all(bind=engine)

def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.PROJECT_VERSION,
        docs_url="/docs",
        openapi_url="/openapi.json"
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include Routers
    application.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    application.include_router(predict.router, prefix="/api/predict", tags=["predict"])
    application.include_router(patients.router, prefix="/api/patients", tags=["patients"])
    application.include_router(admin.router, prefix="/api/admin", tags=["admin"])

    return application

app = create_application()

@app.get("/")
def root():
    return {"message": "Welcome to Clinical AI Portal API"}
