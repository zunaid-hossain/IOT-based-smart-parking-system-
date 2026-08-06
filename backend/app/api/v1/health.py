from fastapi import APIRouter

from app.core.config import settings
from app.core.logger import logger

router = APIRouter(
    prefix="/health",
    tags=["Health"],
)


@router.get("")
def health_check():
    """
    Health check endpoint for container orchestration and uptime monitoring.
    Returns service status, version, and timestamp.
    """

    from datetime import datetime, timezone

    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }