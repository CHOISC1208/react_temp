# Template: Vite + FastAPI + PostgreSQL

A production-ready template that ships a full-stack stack with Vite (React), FastAPI, and PostgreSQL. Use the GitHub **Use this template** button to bootstrap new projects in seconds.

## Features

- FastAPI backend with JWT auth, RBAC, and SQLAlchemy models
- Idempotent SQL migrations managed by a lightweight runner (`backend/scripts/migrate.py`)
- Vite + React + TypeScript frontend with React Query, Tailwind, and shadcn-inspired UI
- Docker Compose for local development (Frontend `5173`, Backend `8000`, Postgres `5432`, pgAdmin `5050`)
- GitHub Actions CI: migration idempotency, backend pytest, frontend vitest
- Heroku-ready Procfile with release-phase migrations and seeds

## 1. Requirements

- Docker & Docker Compose
- Node.js 20+
- Python 3.12+

## 2. Quick Start

1. Copy environment examples:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
2. Start the stack:
   ```bash
   make up
   ```
3. Access the services:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8000 (OpenAPI docs at `/docs`)
   - Health check: http://localhost:8000/healthz
   - pgAdmin: http://localhost:5050 (default: `admin@example.com` / `adminpass`)

The seed script provisions an admin user (`admin@example.com` / `adminpass`) and a sample item.

Stop the stack with `make down`. Tail logs with `make logs`.

## 3. Environment Variables

Three `.env.example` files live at the repository root, `backend/`, and `frontend/`. Copy them to `.env` counterparts and adjust as needed:

| Location | Key settings |
| --- | --- |
| `/.env` | `DATABASE_URL`, `DB_SCHEMA`, `BACKEND_PORT`, `FRONTEND_PORT`, `ALLOWED_ORIGINS`, `VITE_API_BASE_URL` |
| `backend/.env` | Same as root minus frontend keys. Used by Docker/Procfile for the API service. |
| `frontend/.env` | `VITE_API_BASE_URL` pointing at the FastAPI base URL. |

`DB_SCHEMA` defaults to `public`, but the migration runner will automatically create the schema and set the PostgreSQL search path before applying SQL files. When deploying to Heroku, rely on the managed `DATABASE_URL` config var and only override `DB_SCHEMA` when you intentionally separate schemas.

## 4. API Overview

- `POST /auth/login` → obtain JWT access token
- `GET /auth/me` → current authenticated user
- `GET /healthz` → infrastructure health
- Users (admin only for create/list/delete; self or admin for read/update)
- Items (CRUD scoped to the authenticated owner)

OpenAPI docs are available at `http://localhost:8000/docs`.

## 5. Database Migrations

Migrations live in `backend/migrations/*.sql`. Each file **must be idempotent**.

- Create a new file: `make new-migration m="add_feature"`
- Apply migrations locally: `make migrate`
- Migration runner is idempotent—running it twice is safe and enforced in CI.

`backend/scripts/migrate.py` executes SQL files in lexicographical order and records execution in `_schema_migrations`.

## 6. Seeding

`backend/scripts/seed.py` inserts the default admin user and can be run safely multiple times:

```bash
python backend/scripts/seed.py
```

## 7. Testing

- Backend: `pytest -q`
- Frontend: `npm --prefix frontend test`

CI workflow (`.github/workflows/ci.yml`) runs migrations twice, executes backend pytest, and runs frontend vitest.

## 8. Deployment (Heroku)

1. Provision a Heroku app with the PostgreSQL add-on (`DATABASE_URL` is provided automatically).
2. Configure Config Vars: `JWT_SECRET`, `ALLOWED_ORIGINS`, `ENV=production`.
3. Deploy the repository. The `Procfile` configures:
   - `web`: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - `release`: runs migrations and seed script automatically.

## 9. Project Scripts

`Makefile` highlights:

- `make up` / `make down` / `make logs`
- `make migrate` / `make seed`
- `make test`
- `make fmt` / `make lint`
- `make new-migration m="description"`

## 10. Frontend Notes

- Auth-aware layout with login, dashboard, items, and users pages
- React Query handles API caching; errors trigger `sonner` toasts
- Protected routes gate pages behind JWT session state
- Tailwind + shadcn-styled UI primitives live in `frontend/src/components/ui`

## 11. Backend Notes

- FastAPI application lives in `backend/app`
- SQLAlchemy models (`User`, `Item`) back JWT auth & RBAC
- `GET /healthz` validates configuration and database connectivity
- Logging uses structured JSON output respecting `LOG_LEVEL`

Happy shipping!
