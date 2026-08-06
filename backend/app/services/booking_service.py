from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.core.constants import (
    BOOKING_STATUS_CANCELLED,
    BOOKING_STATUS_EXPIRED,
    BOOKING_STATUS_RESERVED,
    GATE_ACTION_FAILED,
    GATE_ACTION_REQUEST,
    GATE_TYPE_ENTRY,
    GRACE_PERIOD_MINUTES,
    PAYMENT_STATUS_PENDING,
    PAYMENT_STATUS_SUCCESSFUL,
    SLOT_STATUS_AVAILABLE,
    SLOT_STATUS_MAINTENANCE,
)
from app.mqtt import publisher as mqtt_publisher
from app.repositories import (
    booking_payment_repository,
    booking_repository,
    parking_session_repository,
    parking_slot_repository,
    vehicle_repository,
)
from app.schemas.booking import BookingCreate, BookingUpdate
from app.services import gate_log_service, parking_session_service


def create_booking(
    db: Session,
    booking: BookingCreate,
    user_id: int,
):
    # Vehicle ownership validation: users can only book using vehicles
    # registered to their own account.
    vehicle = vehicle_repository.get_vehicle(db, booking.vehicle_id)

    if vehicle is None:
        raise ValueError("Vehicle not found.")

    if vehicle.owner_id != user_id:
        raise PermissionError(
            "You can only book parking using a vehicle registered "
            "to your own account."
        )

    # One active booking per user: a user cannot have multiple active
    # parking bookings at the same time.
    active_booking = booking_repository.get_active_booking_for_user(
        db,
        user_id,
    )

    if active_booking is not None:
        raise ValueError(
            "You already have an active booking. Complete or cancel "
            "it before creating a new one."
        )

    slot = parking_slot_repository.get_slot(db, booking.slot_id)

    if slot is None:
        raise ValueError("Parking slot not found.")

    if not slot.is_active or slot.status == SLOT_STATUS_MAINTENANCE:
        raise ValueError("Parking slot is not available for booking.")

    # Real-time system: there's no fixed end time, so a slot can only
    # have one active (non-terminal) booking at a time.
    existing_booking = booking_repository.get_active_booking_for_slot(
        db,
        booking.slot_id,
    )

    if existing_booking is not None:
        raise ValueError(
            "This slot already has an active reservation."
        )

    db_booking = booking_repository.create_booking(
        db,
        booking,
        user_id,
    )

    # Create the (unpaid) booking-protection charge. The slot itself
    # only flips to 'reserved' once this charge is paid successfully
    # (see booking_payment_service.confirm_booking_payment).
    booking_payment_repository.create_booking_payment(
        db,
        booking_id=db_booking.id,
        amount=db_booking.booking_charge,
    )

    return db_booking


def get_all_bookings(
    db: Session,
):
    return booking_repository.get_all_bookings(
        db,
    )


def get_booking(
    db: Session,
    booking_id: int,
):
    return booking_repository.get_booking(
        db,
        booking_id,
    )


def get_user_bookings(
    db: Session,
    user_id: int,
):
    return booking_repository.get_user_bookings(
        db,
        user_id,
    )


def update_booking(
    db: Session,
    booking_id: int,
    booking: BookingUpdate,
):
    updated = booking_repository.update_booking(
        db,
        booking_id,
        booking,
    )

    if updated is not None and booking.booking_status == BOOKING_STATUS_CANCELLED:
        # Free the slot back up if a reservation is cancelled.
        parking_slot_repository.set_slot_status(
            db,
            updated.slot_id,
            SLOT_STATUS_AVAILABLE,
        )
        mqtt_publisher.publish_slot_update(
            updated.slot_id,
            SLOT_STATUS_AVAILABLE,
        )

    return updated


def delete_booking(
    db: Session,
    booking_id: int,
):
    return booking_repository.delete_booking(
        db,
        booking_id,
    )


def request_gate_open(
    db: Session,
    booking_id: int,
    user_id: int,
):
    """
    Handles the "Open Gate" button in the app:
      1. user authenticated (enforced by the API dependency)
      2. booking exists and belongs to the user
      3. booking protection fee has been paid successfully
      4. current time falls inside the booking's scheduled window
    Entry itself is controlled entirely by the booking + gate system --
    there is no RFID authentication at the entry gate. Once validated,
    the Parking Session is created directly and the MQTT command is
    published for the ESP32 to open the entry gate. A separate IR
    sensor confirmation step (see parking_session_service.verify_slot)
    later verifies the vehicle parked in the correct slot.
    """

    booking = booking_repository.get_booking(db, booking_id)

    if booking is None:
        raise ValueError("Booking not found.")

    if booking.user_id != user_id:
        raise PermissionError("This booking does not belong to you.")

    if booking.booking_status not in (BOOKING_STATUS_RESERVED, "confirmed"):
        gate_log_service.log_event(
            db,
            gate_type=GATE_TYPE_ENTRY,
            action=GATE_ACTION_FAILED,
            user_id=user_id,
            vehicle_id=booking.vehicle_id,
            booking_id=booking.id,
        )

        raise ValueError(
            f"Booking is '{booking.booking_status}' and is not eligible "
            "to open the gate."
        )

    booking_payment = booking_payment_repository.get_by_booking(
        db,
        booking.id,
    )

    if (
        booking_payment is None
        or booking_payment.payment_status != PAYMENT_STATUS_SUCCESSFUL
    ):
        gate_log_service.log_event(
            db,
            gate_type=GATE_TYPE_ENTRY,
            action=GATE_ACTION_FAILED,
            user_id=user_id,
            vehicle_id=booking.vehicle_id,
            booking_id=booking.id,
        )

        raise ValueError(
            "Booking protection fee has not been paid successfully yet."
        )

    now = datetime.now()
    scheduled_start = datetime.combine(
        booking.booking_date, booking.scheduled_start_time
    )
    arrival_deadline = scheduled_start + timedelta(minutes=GRACE_PERIOD_MINUTES)

    gate_log_service.log_event(
        db,
        gate_type=GATE_TYPE_ENTRY,
        action=GATE_ACTION_REQUEST,
        user_id=user_id,
        vehicle_id=booking.vehicle_id,
        booking_id=booking.id,
    )

    if not (scheduled_start <= now <= arrival_deadline):
        gate_log_service.log_event(
            db,
            gate_type=GATE_TYPE_ENTRY,
            action=GATE_ACTION_FAILED,
            user_id=user_id,
            vehicle_id=booking.vehicle_id,
            booking_id=booking.id,
        )

        raise ValueError(
            "Current time is outside the booking's arrival window "
            f"(scheduled start + {GRACE_PERIOD_MINUTES}-minute grace period)."
        )

    # No RFID at entry -- the booking + gate system itself grants
    # access. Creating the session here opens the gate and starts
    # the parking clock in one step.
    session = parking_session_service.create_session_on_gate_open(
        db,
        booking,
    )

    return session


def expire_no_show_bookings(
    db: Session,
):
    """
    Background job (run every minute): any 'reserved' booking whose
    scheduled start time + grace period has elapsed, and for which
    the vehicle never actually entered, is auto-expired. The slot is
    released back to available. The booking-protection fee, if it
    was already paid, is kept as a no-show penalty; if it was still
    pending, it's marked 'expired' instead.
    """

    expired_bookings = []
    now = datetime.now()

    for booking in booking_repository.get_reserved_bookings(db):
        scheduled_start = datetime.combine(
            booking.booking_date, booking.scheduled_start_time
        )
        deadline = scheduled_start + timedelta(minutes=GRACE_PERIOD_MINUTES)

        if now <= deadline:
            continue

        # If the vehicle already entered, this booking has been
        # fulfilled -- don't expire it.
        if parking_session_repository.get_session_by_booking(db, booking.id):
            continue

        booking_repository.update_booking(
            db,
            booking.id,
            BookingUpdate(booking_status=BOOKING_STATUS_EXPIRED),
        )

        booking_payment = booking_payment_repository.get_by_booking(
            db,
            booking.id,
        )

        if (
            booking_payment is not None
            and booking_payment.payment_status == PAYMENT_STATUS_PENDING
        ):
            booking_payment_repository.update_booking_payment(
                db,
                booking_payment.id,
                {"payment_status": "expired"},
            )

        parking_slot_repository.set_slot_status(
            db,
            booking.slot_id,
            SLOT_STATUS_AVAILABLE,
        )
        mqtt_publisher.publish_slot_update(
            booking.slot_id,
            SLOT_STATUS_AVAILABLE,
        )

        expired_bookings.append(booking)

    return expired_bookings
