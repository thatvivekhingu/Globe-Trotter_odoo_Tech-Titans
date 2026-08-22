"""Enterprise structured logging setup for backend API."""
import logging
import sys
from app.core.config import settings


def setup_logging() -> logging.Logger:
    """Configure system logger with structured formatting."""
    log_level = logging.DEBUG if settings.debug else logging.INFO

    logger = logging.getLogger("tripwise")
    logger.setLevel(log_level)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(log_level)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )

        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


logger = setup_logging()
