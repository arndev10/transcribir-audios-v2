from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from app.db.base import Base
from app.db.session import engine
from app.config import settings
from app.api.routes import auth, profile, daily_logs, photos, cheat_meals, feedback

app = FastAPI(
    title="Control Fit API",
    description="""
    Aplicación de monitoreo de grasa corporal y peso.
    
    Esta API permite:
    - Registrar y monitorear peso diario
    - Subir fotos para estimación de grasa corporal
    - Registrar comidas trampa (cheat meals)
    - Generar feedback semanal sobre progreso
    - Gestionar perfiles de entrenamiento versionados
    
    El sistema se enfoca en entender cómo la grasa corporal, inflamación, 
    retención de líquidos y consistencia afectan el progreso percibido.
    """,
    version="1.0.0",
    contact={
        "name": "Control Fit",
    },
    tags_metadata=[
        {
            "name": "auth",
            "description": "Autenticación y gestión de usuarios. Registro y login con JWT."
        },
        {
            "name": "profile",
            "description": "Gestión de perfiles de entrenamiento. Los perfiles son versionados, cada cambio crea un nuevo snapshot."
        },
        {
            "name": "daily-logs",
            "description": "Registros diarios de peso, sueño, entrenamiento y calorías. Permite edición retroactiva."
        },
        {
            "name": "photos",
            "description": "Gestión de fotos corporales. Permite subir fotos y almacenar estimaciones de grasa corporal (rango)."
        },
        {
            "name": "cheat-meals",
            "description": "Registro de comidas trampa con descripción cualitativa. El sistema interpreta el impacto."
        },
        {
            "name": "feedback",
            "description": "Feedback semanal generado bajo demanda. Analiza tendencias de peso, grasa corporal, inflamación y consistencia."
        },
        {
            "name": "jobs",
            "description": "Gestión de jobs asíncronos. Permite consultar el estado de procesos en background como análisis de fotos, cheat meals y generación de feedback."
        },
    ]
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # Create database tables (checkfirst=True prevents errors if tables/indexes already exist)
    Base.metadata.create_all(bind=engine, checkfirst=True)
    
    # Create storage directories if they don't exist
    storage_path = Path(settings.photos_storage_path)
    storage_path.mkdir(parents=True, exist_ok=True)


# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(daily_logs.router, prefix="/api")
app.include_router(photos.router, prefix="/api")
app.include_router(cheat_meals.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")

# Import jobs router
from app.api.routes import jobs
app.include_router(jobs.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Control Fit API"}


@app.get("/health")
async def health():
    return {"status": "ok"}
