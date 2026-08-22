# TripWise API

Phase 4 provides the runnable FastAPI backend foundation for TripWise.

## Included

- FastAPI application with `/health` and `/api/v1` routes
- SQLAlchemy 2.x models matching the Phase 3 MySQL schema
- MySQL support through `mysql+pymysql://...`
- SQLite fallback for local validation when MySQL is unavailable
- Pydantic request/response validation
- JWT access tokens
- Argon2 password hashing through `pwdlib`
- CORS configuration
- Owner-scoped private trip access
- Cities, activities, trips, stops, activities, expenses, budgets, and public shares
- Repeatable reference-data seeding
- Alembic configuration for future migrations
- Database-grounded RAG for recommendations and the travel copilot

## Setup

From `backend/`:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

For PowerShell, use:

```powershell
Copy-Item .env.example .env
```

The default `.env.example` uses SQLite:

```text
DATABASE_URL=sqlite:///./tripwise.db
```

For MySQL, set:

```text
DATABASE_URL=mysql+pymysql://tripwise_user:change-me@127.0.0.1:3306/tripwise
```

Use a long random `JWT_SECRET_KEY` outside local development.

## AI and RAG

Set `GROQ_API_KEY` in the backend `.env` to enable generation with `GROQ_MODEL` (default:
`openai/gpt-oss-120b`). The key stays server-side. Every recommendation and copilot request
retrieves matching cities and activities from the TripWise catalogue and includes those records
as grounding context. When the provider is unavailable, recommendations use the catalogue-backed
deterministic response; chat returns `503` instead of inventing travel advice.

The standalone `rag_demo.ipynb` is an experimentation notebook. Production requests use the
dependency-light API retrieval service in `app/services/rag.py`, so API startup does not require
FAISS or a local embedding model.

## Run

```bash
uvicorn app.main:app --reload
```

Open:

- Health: http://127.0.0.1:8000/health
- OpenAPI: http://127.0.0.1:8000/docs

## Seed reference data

```bash
python -m app.seed.run_seed
```

The application can create tables and seed the reference catalog automatically in development when `AUTO_CREATE_TABLES=true` and `AUTO_SEED_REFERENCE_DATA=true`. Use Alembic migrations as the source of truth before production deployment.

## API examples

Signup:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"traveller@example.com\",\"password\":\"correct-horse-battery\",\"full_name\":\"Aarav Mehta\"}"
```

Use the returned bearer token for private routes:

```bash
curl http://127.0.0.1:8000/api/v1/trips \
  -H "Authorization: Bearer <access-token>"
```

## Scope boundary

The backend auth contract is now ready for frontend use. The current frontend supports live signup/login/session hydration with an explicit local-demo fallback; trip CRUD remains on the local adapter until the later API integration phase.
