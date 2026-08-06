import math

from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.core.constants import (
    BOOKING_STATUS_COMPLETED,
    GATE_ACTION_FAILED,
    GATE_ACTION_OPENED,
    GATE_ACTION_REQUEST,
    GATE_ACTION_VERIFIED,
    GATE_TYPE_ENTRY,
    GATE_TYPE_EXIT,
    HOURLY_RATE,
    MINIMUM_PARKING_TIME,
    SESSION_STATUS_ACTIVE,
    SESSION_STATUS_COMPLETED,
    SESSION_STATUS_PAYMENT_PENDING,
    SLOT_STATUS_AVAILABLE,
    SLOT_STATUS_OCCUPIED,
)
from app.mqtt import publisher as mqtt_publisher
from app.repositories import (
    booking_repository,
    parking_session_repository,
    parking_slot_repository,
)
from app.services import gate_log_service
from app.schemas.booking import BookingUpdate


def calculate_amount(duration_minutes: int) -> float:
    """
    Flat hourly-rate billing, rounded up to the next hour,
    with a minimum chargeable duration.
    """

    billable_minutes = max(duration_minutes, MINIMUM_PARKING_TIME)
    billable_hours = math.ceil(billable_minutes / 60)

    return round(billable_hours * HOURLY_RATE, 2)


def create_session_on_gate_open(
    db: Session,
    booking,
):
    """
    Entry is controlled entirely by the booking + gate system -- there
    is no RFID authentication at the entry gate. This is called by
    booking_service.request_gate_open() once the booking, payment, and
    time window have all been validated. It creates the ParkingSession,
    flips the slot to 'occupied', and publishes the entry-gate-open
    MQTT command.
    """

    existing_session = parking_session_repository.get_active_session_by_slot(
        db,
        booking.slot_id,
    )

    if existing_session is not None:
        raise ValueError(
            "This slot already has an active parking session."
        )

    entry_time = datetime.now(timezone.utc)

    session = parking_session_repository.create_session(
        db,
        booking_id=booking.id,
        user_id=booking.user_id,
        vehicle_id=booking.vehicle_id,
        slot_id=booking.slot_id,
        entry_time=entry_time,
    )

    parking_slot_repository.set_slot_status(
        db,
        booking.slot_id,
        SLOT_STATUS_OCCUPIED,
    )
    mqtt_publisher.publish_slot_update(booking.slot_id, SLOT_STATUS_OCCUPIED)

    mqtt_publisher.open_entry_gate(booking.id, booking.slot_id)

    gate_log_service.log_event(
        db,
        gate_type=GATE_TYPE_ENTRY,
        action=GATE_ACTION_OPENED,
        user_id=booking.user_id,
        vehicle_id=booking.vehicle_id,
        booking_id=booking.id,
        session_id=session.id,
    )

    return session


def verify_slot(
    db: Session,
    session_id: int,
    slot_id: int | None = None,
):
    """
    Called by the IR sensor controller once it confirms the vehicle is
    physically parked in the correct reserved slot, right after the
    entry gate opens.
    """

    session = parking_session_repository.get_session(db, session_id)

    if session is None:
        raise ValueError("Parking session not found.")

    if slot_id is not None and slot_id != session.slot_id:
        gate_log_service.log_event(
            db,
            gate_type=GATE_TYPE_ENTRY,
            action=GATE_ACTION_FAILED,
            user_id=session.user_id,
            vehicle_id=session.vehicle_id,
            booking_id=session.booking_id,
            session_id=session.id,
        )

        raise ValueError(
            "IR sensor detected the vehicle in a different slot than "
            "the one reserved."
        )

    session = parking_session_repository.update_session(
        db,
        session_id,
        {"slot_verified": True},
    )

    gate_log_service.log_event(
        db,
        gate_type=GATE_TYPE_ENTRY,
        action=GATE_ACTION_VERIFIED,
        user_id=session.user_id,
        vehicle_id=session.vehicle_id,
        booking_id=session.booking_id,
        session_id=session.id,
    )

    return session


def process_exit_scan(
    db: Session,
    rfid_uid: str,
):
    """
    Called when the customer scans the RFID card installed at their
    reserved slot at the exit gate. Each of the 8 physical slots has
    its own dedicated, permanently-attached RFID card (not the
    vehicle, and not the customer). Calculates the bill and marks the
    session as payment_pending. Does NOT open the gate -- that only
    happens after payment succeeds. Requires the IR sensor to have
    already confirmed (slot_verified) that the vehicle actually
    parked in this reserved slot; otherwise the scan is rejected.
    """

    slot = parking_slot_repository.get_slot_by_rfid(db, rfid_uid)

    if slot is None:
        gate_log_service.log_event(
            db,
            gate_type=GATE_TYPE_EXIT,
            action=GATE_ACTION_FAILED,
            rfid_uid=rfid_uid,
        )

        raise ValueError("RFID card is not installed at any parking slot.")

    session = parking_session_repository.get_active_session_by_slot(
        db,
        slot.id,
    )

    if session is None:
        gate_log_service.log_event(
            db,
            gate_type=GATE_TYPE_EXIT,
            action=GATE_ACTION_FAILED,
            rfid_uid=rfid_uid,
        )

        raise ValueError("No active parking session found for this slot.")

    if not session.slot_verified:
        gate_log_service.log_event(
            db,
            gate_type=GATE_TYPE_EXIT,
            action=GATE_ACTION_FAILED,
            user_id=session.user_id,
            vehicle_id=session.vehicle_id,
            booking_id=session.booking_id,
            session_id=session.id,
            rfid_uid=rfid_uid,
        )

        raise ValueError(
            "This session was never confirmed by the IR sensor as "
            "parked in the correct slot; exit scan rejected."
        )

    exit_time = datetime.now(timezone.utc)
    duration_minutes = int((exit_time - session.entry_time).total_seconds() // 60)
    amount = calculate_amount(duration_minutes)

    session = parking_session_repository.update_session(
        db,
        session.id,
        {
            "exit_time": exit_time,
            "duration_minutes": duration_minutes,
            "amount": amount,
            "session_status": SESSION_STATUS_PAYMENT_PENDING,
        },
    )

    gate_log_service.log_event(
        db,
        gate_type=GATE_TYPE_EXIT,
        action=GATE_ACTION_REQUEST,
        user_id=session.user_id,
        vehicle_id=session.vehicle_id,
        booking_id=session.booking_id,
        session_id=session.id,
        rfid_uid=rfid_uid,
    )

    return session


def complete_session_after_payment(
    db: Session,
    session_id: int,
):
    """
    Called once payment for the session has been confirmed successful.
    Opens the exit gate and frees the slot back up.
    """

    session = parking_session_repository.get_session(db, session_id)

    if session is None:
        raise ValueError("Parking session not found.")

    if session.session_status != SESSION_STATUS_PAYMENT_PENDING:
        raise ValueError(
            "Session is not awaiting payment; exit gate cannot be opened."
        )

    session = parking_session_repository.update_session(
        db,
        session_id,
        {"session_status": SESSION_STATUS_COMPLETED},
    )

    # The reservation this session fulfilled is now done -- free up
    # the user's "one active booking" slot for future reservations.
    booking_repository.update_booking(
        db,
        session.booking_id,
        BookingUpdate(booking_status=BOOKING_STATUS_COMPLETED),
    )

    parking_slot_repository.set_slot_status(
        db,
        session.slot_id,
        SLOT_STATUS_AVAILABLE,
    )
    mqtt_publisher.publish_slot_update(session.slot_id, SLOT_STATUS_AVAILABLE)

    mqtt_publisher.open_exit_gate(session.id, session.slot_id)

    gate_log_service.log_event(
        db,
        gate_type=GATE_TYPE_EXIT,
        action=GATE_ACTION_OPENED,
        user_id=session.user_id,
        vehicle_id=session.vehicle_id,
        booking_id=session.booking_id,
        session_id=session.id,
    )

    return session


def get_session(
    db: Session,
    session_id: int,
):
    return parking_session_repository.get_session(db, session_id)


def get_all_sessions(
    db: Session,
):
    return parking_session_repository.get_all_sessions(db)


def get_user_sessions(
    db: Session,
    user_id: int,
):
    return parking_session_repository.get_user_sessions(db, user_id)
