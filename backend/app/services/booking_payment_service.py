from datetime import datetime

from sqlalchemy.orm import Session

from app.core.constants import (
    PAYMENT_STATUS_SUCCESSFUL,
    SLOT_STATUS_RESERVED,
)
from app.mqtt import publisher as mqtt_publisher
from app.repositories import (
    booking_payment_repository,
    booking_repository,
    parking_slot_repository,
)
from app.schemas.booking_payment import BookingPaymentUpdate


def get_by_booking(
    db: Session,
    booking_id: int,
):
    payment = booking_payment_repository.get_by_booking(db, booking_id)

    if payment is None:
        raise ValueError(
            "No booking payment found for this booking."
        )

    return payment


def confirm_booking_payment(
    db: Session,
    booking_id: int,
    update: BookingPaymentUpdate,
):
    """
    Confirms (or fails) the reservation-protection charge. On success:
      - the slot flips from 'available' to 'reserved'
      - a slot-update MQTT message is published
      - the reserved slot's RFID card becomes visible to the user for
        exit-scanning (see Booking.reserved_slot_rfid_uid) -- the card
        itself remains permanently attached to the slot, it is never
        handed over to or owned by the customer
    """

    payment = booking_payment_repository.get_by_booking(db, booking_id)

    if payment is None:
        raise ValueError(
            "No booking payment found for this booking."
        )

    update_data = update.model_dump(exclude_unset=True)

    if (
        update_data.get("payment_status") == PAYMENT_STATUS_SUCCESSFUL
        and not update_data.get("paid_at")
    ):
        update_data["paid_at"] = datetime.utcnow()

    updated = booking_payment_repository.update_booking_payment(
        db,
        payment.id,
        update_data,
    )

    if updated.payment_status == PAYMENT_STATUS_SUCCESSFUL:
        booking = booking_repository.get_booking(db, booking_id)

        parking_slot_repository.set_slot_status(
            db,
            booking.slot_id,
            SLOT_STATUS_RESERVED,
        )
        mqtt_publisher.publish_slot_update(
            booking.slot_id,
            SLOT_STATUS_RESERVED,
        )

    return updated
