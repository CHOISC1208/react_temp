from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.deps import get_db_session

router = APIRouter(tags=["health"])


@router.get("/healthz")
def health_check(db: Session = Depends(get_db_session)) -> dict[str, str]:
    settings = get_settings()
    required = {
        "database_url": settings.database_url,
        "jwt_secret": settings.jwt_secret,
    }

    if not all(required.values()):
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Missing configuration")

    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:  # pragma: no cover - surfaces connection issues
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Database unavailable") from exc

    return {"status": "ok"}
