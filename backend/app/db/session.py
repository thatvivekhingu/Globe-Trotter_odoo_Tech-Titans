"""Enterprise SQLAlchemy database session manager with connection pooling and health checks."""
from collections.abc import Generator
import time

from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

is_sqlite = settings.database_url.startswith('sqlite')

if is_sqlite:
    engine_kwargs = {
        'connect_args': {'check_same_thread': False},
        'pool_pre_ping': True,
    }
else:
    # Enterprise Production Pooling for PostgreSQL & MySQL
    engine_kwargs = {
        'pool_size': 10,
        'max_overflow': 20,
        'pool_recycle': 1800,
        'pool_pre_ping': True,
        'pool_timeout': 30,
    }

engine = create_engine(settings.database_url, **engine_kwargs)

if is_sqlite:
    @event.listens_for(engine, 'connect')
    def enable_sqlite_foreign_keys(dbapi_connection: object, _connection_record: object) -> None:
        cursor = dbapi_connection.cursor()  # type: ignore[attr-defined]
        cursor.execute('PRAGMA foreign_keys=ON')
        cursor.close()

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def check_database_health() -> dict[str, object]:
    """Perform a live database ping check and return latency & status info."""
    start_time = time.perf_counter()
    try:
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            'status': 'healthy',
            'dialect': engine.dialect.name,
            'latency_ms': latency_ms,
        }
    except Exception as exc:
        return {
            'status': 'unhealthy',
            'error': str(exc),
            'dialect': engine.dialect.name,
        }


def get_db() -> Generator[Session, None, None]:
    with SessionLocal() as db:
        yield db
