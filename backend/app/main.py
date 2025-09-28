from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.routers import auth, healthz, items, users

configure_logging()

settings = get_settings()

app = FastAPI(title="Template FastAPI", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(healthz.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(items.router)


@app.get("/", tags=["root"])
def read_root() -> dict[str, str]:
    return {"message": "API is running"}
