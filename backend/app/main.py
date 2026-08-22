"""Enterprise FastAPI Production Application — GlobeTrotter Backend."""
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
import os
import sys
import time

# Ensure backend root directory is in sys.path for direct execution
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from sqlalchemy.exc import SQLAlchemyError
from starlette.requests import Request
from starlette.responses import JSONResponse

from app import models  # noqa: F401 - imports register all SQLAlchemy models
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import logger
from app.core.middleware import ProcessTimeAndCorrelationMiddleware, SecurityHeadersMiddleware
from app.db.base import Base
from app.db.session import SessionLocal, check_database_health, engine
from app.seed.reference import seed_reference_data

app_start_time = time.time()


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Lifespan event handler: handles database migrations and reference seeding."""
    logger.info(f"Starting {settings.app_name} in [{settings.environment}] mode...")
    if settings.auto_create_tables:
        logger.info("Initializing relational database schema...")
        Base.metadata.create_all(bind=engine)
        if settings.auto_seed_reference_data:
            logger.info("Seeding reference cities and activities...")
            with SessionLocal() as db:
                seed_reference_data(db)
    logger.info(f"{settings.app_name} engine fully operational.")
    yield
    logger.info(f"Shutting down {settings.app_name}...")


tags_metadata = [
    {"name": "system", "description": "System health, readiness, and diagnostic endpoints."},
    {"name": "auth", "description": "User authentication, JWT token issuance, and account registration."},
    {"name": "trips", "description": "Private owner-scoped trip management and CRUD operations."},
    {"name": "trip stops", "description": "Ordered destination stops within a trip route."},
    {"name": "trip activities", "description": "Time-slotted activity scheduling for trip stops."},
    {"name": "expenses", "description": "Itemized trip expenses and cost tracking."},
    {"name": "budget", "description": "Aggregated trip budget analytics and category breakdowns."},
    {"name": "cities", "description": "Global destination city catalog search and exploration."},
    {"name": "activities", "description": "Catalog experiences, attractions, and cultural activities."},
    {"name": "ai", "description": "Gemini & RAG AI suite: Itinerary generation, Globe Guide chatbot, budget optimizer, and discovery."},
    {"name": "sharing", "description": "Public read-only trip share token creation and resolution."},
]

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="Enterprise Travel Planning & Itinerary Orchestration Platform API",
    openapi_tags=tags_metadata,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 1. Custom Security & Correlation Middleware
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(ProcessTimeAndCorrelationMiddleware)

# 2. GZip Response Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 3. CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error(f"[DB Error] [{request_id}] {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Database operation failed. Please check your data input."},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "unknown")
    if exc.status_code >= 500:
        logger.error(f"[HTTP {exc.status_code}] [{request_id}] {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=exc.headers,
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", "unknown")
    logger.critical(f"[Unhandled Exception] [{request_id}] {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected server error occurred. Our engineers have been notified."},
    )


# Diagnostics & Health Endpoints
@app.get("/health", tags=["system"])
def health() -> dict[str, object]:
    """Live diagnostic health check including DB connectivity, latency, and uptime."""
    uptime_seconds = round(time.time() - app_start_time, 2)
    db_health = check_database_health()

    return {
        "status": "ok" if db_health["status"] == "healthy" else "degraded",
        "system_health": "healthy" if db_health["status"] == "healthy" else "degraded",

        "service": settings.app_name,
        "version": "1.0.0",
        "environment": settings.environment,
        "uptime_seconds": uptime_seconds,
        "database": db_health,
        "ai_status": "configured" if bool(settings.gemini_api_key) else "key_missing",
    }


@app.get("/health/liveness", tags=["system"])
def liveness() -> dict[str, str]:
    """Kubernetes / Cloud container liveness probe."""
    return {"status": "alive"}


@app.get("/health/readiness", tags=["system"])
def readiness() -> dict[str, object]:
    """Kubernetes / Cloud container readiness probe."""
    db_health = check_database_health()
    if db_health["status"] != "healthy":
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {db_health.get('error')}",
        )
    return {"status": "ready", "database": db_health}


# Include V1 API Routes
app.include_router(api_router, prefix="/api/v1")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
