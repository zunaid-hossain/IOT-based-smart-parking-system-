from sqlalchemy.orm import Session

from app.core.constants import BOOKING_STATUS_RESERVED
from app.models.booking import Booking
from app.schemas.booking import BookingCreate, BookingUpdate


def create_booking(
    db: Session,
    booking: BookingCreate,
    user_id: int,
    
):
    db_booking = Booking(
        user_id=user_id,
        vehicle_id=booking.vehicle_id,
        slot_id=booking.slot_id,
        booking_date=booking.booking_date,
        scheduled_start_time=booking.scheduled_start_time,
        booking_status=BOOKING_STATUS_RESERVED,
        reserved_slot_rfid_uid=reserved_slot_rfid_uid,
    )

    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    return db_booking


def get_booking(
    db: Session,
    booking_id: int,
):
    return (
        db.query(Booking)
        .filter(Booking.id == booking_id)
        .first()
    )


def get_all_bookings(
    db: Session,
):
    return (
        db.query(Booking)
        .order_by(Booking.booking_date.desc())
        .all()
    )


def get_user_bookings(
    db: Session,
    user_id: int,
):
    return (
        db.query(Booking)
        .filter(Booking.user_id == user_id)
        .order_by(Booking.booking_date.desc())
        .all()
    )


def get_active_booking_for_slot(
    db: Session,
    slot_id: int,
):
    """
    This is a real-time system with no fixed booking end time --
    exit time is only known once the vehicle actually leaves (RFID
    exit scan). So a slot can have at most one active (non-terminal)
    booking at any moment, regardless of booking_date/start_time.
    Used both to block a new booking on an already-reserved slot and
    to find the booking a gate-open/entry request belongs to.
    """

    return (
        db.query(Booking)
        .filter(
            Booking.slot_id == slot_id,
            Booking.booking_status.in_(
                (BOOKING_STATUS_RESERVED, "confirmed")
            ),
        )
        .first()
    )


def get_active_booking_for_user(
    db: Session,
    user_id: int,
):
    """
    Any booking this user currently has that hasn't reached a terminal
    state yet (cancelled / expired / completed). Used to enforce the
    "one active booking per user" rule.
    """

    return (
        db.query(Booking)
        .filter(
            Booking.user_id == user_id,
            Booking.booking_status.in_(
                (BOOKING_STATUS_RESERVED, "confirmed")
            ),
        )
        .first()
    )


def get_reserved_bookings(
    db: Session,
):
    """
    All bookings still in 'reserved' status, used by the background
    no-show expiry job. Filtering by elapsed grace period is done in
    the service layer since it requires combining booking_date +
    scheduled_start_time, which is awkward to express portably in SQL.
    """

    return (
        db.query(Booking)
        .filter(Booking.booking_status == BOOKING_STATUS_RESERVED)
        .all()
    )


def update_booking(
    db: Session,
    booking_id: int,
    booking: BookingUpdate,
):
    db_booking = get_booking(db, booking_id)

    if db_booking is None:
        return None

    update_data = booking.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_booking, key, value)

    db.commit()
    db.refresh(db_booking)

    return db_booking


def delete_booking(
    db: Session,
    booking_id: int,
):
    db_booking = get_booking(db, booking_id)

    if db_booking is None:
        return None

    db.delete(db_booking)
    db.commit()

    return db_booking
