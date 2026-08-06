from datetime import datetime

from sqlalchemy.orm import Session

from app.core.constants import SESSION_STATUS_ACTIVE
from app.models.parking_session import ParkingSession


def create_session(
    db: Session,
    booking_id: int,
    user_id: int,
    vehicle_id: int,
    slot_id: int,
    entry_time: datetime,
):
    db_session = ParkingSession(
        booking_id=booking_id,
        user_id=user_id,
        vehicle_id=vehicle_id,
        slot_id=slot_id,
        entry_time=entry_time,
        session_status=SESSION_STATUS_ACTIVE,
    )

    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    return db_session


def get_session(
    db: Session,
    session_id: int,
):
    return (
        db.query(ParkingSession)
        .filter(ParkingSession.id == session_id)
        .first()
    )


def get_active_session_by_slot(
    db: Session,
    slot_id: int,
):
    return (
        db.query(ParkingSession)
        .filter(
            ParkingSession.slot_id == slot_id,
            ParkingSession.session_status == SESSION_STATUS_ACTIVE,
        )
        .first()
    )


def get_active_session_by_vehicle(
    db: Session,
    vehicle_id: int,
):
    return (
        db.query(ParkingSession)
        .filter(
            ParkingSession.vehicle_id == vehicle_id,
            ParkingSession.session_status == SESSION_STATUS_ACTIVE,
        )
        .first()
    )


def get_session_by_booking(
    db: Session,
    booking_id: int,
):
    """
    Any session (regardless of status) tied to this booking. Used to
    detect whether the vehicle already entered, so the no-show expiry
    job doesn't expire a booking that has already been fulfilled.
    """

    return (
        db.query(ParkingSession)
        .filter(ParkingSession.booking_id == booking_id)
        .first()
    )


def get_all_sessions(
    db: Session,
):
    return (
        db.query(ParkingSession)
        .order_by(ParkingSession.entry_time.desc())
        .all()
    )


def get_user_sessions(
    db: Session,
    user_id: int,
):
    return (
        db.query(ParkingSession)
        .filter(ParkingSession.user_id == user_id)
        .order_by(ParkingSession.entry_time.desc())
        .all()
    )


def update_session(
    db: Session,
    session_id: int,
    update_data: dict,
):
    db_session = get_session(db, session_id)

    if db_session is None:
        return None

    for key, value in update_data.items():
        setattr(db_session, key, value)

    db.commit()
    db.refresh(db_session)

    return db_session


def delete_session(
    db: Session,
    session_id: int,
):
    db_session = get_session(db, session_id)

    if db_session is None:
        return None

    db.delete(db_session)
    db.commit()

    return db_session
