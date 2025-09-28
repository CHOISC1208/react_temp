from sqlalchemy import MetaData
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


metadata_obj = MetaData(schema=get_settings().db_schema)


class Base(DeclarativeBase):
    metadata = metadata_obj
