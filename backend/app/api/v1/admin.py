from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth.oauth2 import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.vehicle import Vehicle
from app.models.parking_slot import ParkingSlot
from app.models.booking import Booking
from app.models.parking_session import ParkingSession
from app.models.payment import Payment
from app.models.gate_log import GateLog
from app.core.constants import (
    SLOT_STATUS_AVAILABLE,
    SLOT_STATUS_RESERVED,
    SLOT_STATUS_OCCUPIED,
    SESSION_STATUS_ACTIVE,
    SESSION_STATUS_PAYMENT_PENDING,
    PAYMENT_STATUS_SUCCESSFUL,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin Dashboard"],
)


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Aggregated statistics for the admin dashboard:
      - Total users, vehicles, bookings
      - Active sessions
      - Revenue (sum of successful payments)
      - Slot status breakdown (available/reserved/occupied)
      - Gate log counts
    """

    if current_user.role != "admin":
        return {
            "detail": "Admin role required",
        }

    total_users = db.query(func.count(User.id)).scalar() or 0
    total_vehicles = db.query(func.count(Vehicle.id)).scalar() or 0
    total_bookings = db.query(func.count(Booking.id)).scalar() or 0
    active_sessions = (
        db.query(func.count(ParkingSession.id))
        .filter(
            ParkingSession.session_status.in_(
                [SESSION_STATUS_ACTIVE, SESSION_STATUS_PAYMENT_PENDING]
            )
        )
        .scalar()
        or 0
    )

    revenue = (
        db.query(func.coalesce(func.sum(Payment.amount), 0))
        .filter(Payment.payment_status == PAYMENT_STATUS_SUCCESSFUL)
        .scalar()
        or 0
    )

    available_slots = (
        db.query(func.count(ParkingSlot.id))
        .filter(ParkingSlot.status == SLOT_STATUS_AVAILABLE)
        .scalar()
        or 0
    )
    reserved_slots = (
        db.query(func.count(ParkingSlot.id))
        .filter(ParkingSlot.status == SLOT_STATUS_RESERVED)
        .scalar()
        or 0
    )
    occupied_slots = (
        db.query(func.count(ParkingSlot.id))
        .filter(ParkingSlot.status == SLOT_STATUS_OCCUPIED)
        .scalar()
        or 0
    )
    maintenance_slots = (
        db.query(func.count(ParkingSlot.id))
        .filter(ParkingSlot.status == "maintenance")
        .scalar()
        or 0
    )

    entry_logs = (
        db.query(func.count(GateLog.id))
        .filter(GateLog.gate_type == "ENTRY")
        .scalar()
        or 0
    )
    exit_logs = (
        db.query(func.count(GateLog.id))
        .filter(GateLog.gate_type == "EXIT")
        .scalar()
        or 0
    )

    return {
        "total_users": total_users,
        "total_vehicles": total_vehicles,
        "total_bookings": total_bookings,
        "active_sessions": active_sessions,
        "revenue": float(revenue),
        "slots": {
            "available": available_slots,
            "reserved": reserved_slots,
            "occupied": occupied_slots,
            "maintenance": maintenance_slots,
            "total": available_slots + reserved_slots + occupied_slots + maintenance_slots,
        },
        "gate_logs": {
            "entry": entry_logs,
            "exit": exit_logs,
            "total": entry_logs + exit_logs,
        },
    }