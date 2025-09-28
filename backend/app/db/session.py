from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings

settings = get_settings()

url = make_url(settings.database_url)

connect_args: dict[str, str] = {}
if url.get_backend_name().startswith("postgresql"):
    connect_args["options"] = f'-csearch_path="{settings.db_schema}"'

engine = create_engine(settings.database_url, pool_pre_ping=True, future=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
