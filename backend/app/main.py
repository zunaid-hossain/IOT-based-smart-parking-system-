from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.core.scheduler import shutdown_scheduler, start_scheduler
from app.database.init_db import init_db
from app.mqtt.subscriber import start_subscriber


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating database tables...")

    init_db()

    print("Database Ready")

    start_scheduler()
    start_subscriber()

    yield

    shutdown_scheduler()

    print("Application Shutdown")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.include_router(
    api_router,
    prefix="/api/v1",
)


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Smart Parking API",
        "version": settings.APP_VERSION,
        "status": "running",
    }
