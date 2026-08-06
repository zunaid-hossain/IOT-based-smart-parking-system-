from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.vehicles import router as vehicles_router
from app.api.v1.parking_slots import router as parking_slots_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.parking_sessions import router as parking_sessions_router
from app.api.v1.payments import router as payments_router
from app.api.v1.gate_logs import router as gate_logs_router

api_router = APIRouter()

# Authentication
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"],
)

# Users
api_router.include_router(
    users_router,
    prefix="/users",
    tags=["Users"],
)

# Vehicles
api_router.include_router(
    vehicles_router,
    prefix="/vehicles",
    tags=["Vehicles"],
)

api_router.include_router(
    parking_slots_router,
)
api_router.include_router(
    bookings_router,
)

api_router.include_router(
    parking_sessions_router,
)

api_router.include_router(
    payments_router,
)

api_router.include_router(
    gate_logs_router,
)
