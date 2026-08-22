import os
from collections.abc import Iterator

os.environ['DATABASE_URL'] = 'sqlite:///./test_tripwise.db'
os.environ['AUTO_CREATE_TABLES'] = 'true'
os.environ['JWT_SECRET_KEY'] = 'test-secret-for-tripwise'

import pytest
from fastapi.testclient import TestClient

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.main import app
from app.seed.reference import seed_reference_data


@pytest.fixture(scope='session', autouse=True)
def prepare_database() -> Iterator[None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_reference_data(db)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(app) as test_client:
        yield test_client
