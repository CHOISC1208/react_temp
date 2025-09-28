import logging
from pythonjsonlogger import jsonlogger

from .config import get_settings


def configure_logging() -> None:
    settings = get_settings()
    log_level = getattr(logging, settings.log_level.upper(), logging.INFO)

    logger = logging.getLogger()
    logger.handlers = []
    logger.setLevel(log_level)

    handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter('%(levelname)s %(name)s %(message)s %(asctime)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    if settings.env.lower() == 'production':
        logging.getLogger('uvicorn.error').setLevel(logging.INFO)
        logging.getLogger('uvicorn.access').setLevel(logging.INFO)
