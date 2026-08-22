import os
import sys
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

# Ensure backend root directory is in sys.path for direct execution
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.seed.reference import seed_reference_data
from app import models  # noqa: F401 - imports register all SQLAlchemy models



@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    if settings.auto_create_tables:
        Base.metadata.create_all(bind=engine)
        if settings.auto_seed_reference_data:
            with SessionLocal() as db:
                seed_reference_data(db)
    yield


app = FastAPI(title=settings.app_name, version='0.1.0', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(_request: Request, _exc: SQLAlchemyError) -> JSONResponse:
    return JSONResponse(status_code=500, content={'detail': 'Database operation failed.'})


@app.get('/health', tags=['system'])
def health() -> dict[str, str]:
    return {'status': 'ok', 'service': settings.app_name}


app.include_router(api_router, prefix='/api/v1')

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('app.main:app', host='127.0.0.1', port=8000, reload=True)

