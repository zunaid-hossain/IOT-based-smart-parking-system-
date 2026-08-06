from datetime import datetime

from sqlalchemy.orm import Session

from app.core.constants import (
    PAYMENT_STATUS_SUCCESSFUL,
    SESSION_STATUS_PAYMENT_PENDING,
)
from app.repositories import (
    parking_session_repository,
    payment_repository,
)
from app.schemas.payment import (
    PaymentCreate,
    PaymentUpdate,
)
from app.services import parking_session_service


def create_payment(
    db: Session,
    payment: PaymentCreate,
):
    # Check the parking session exists and is actually awaiting payment.
    session = parking_session_repository.get_session(
        db,
        payment.session_id,
    )

    if session is None:
        raise ValueError("Parking session not found.")

    if session.session_status != SESSION_STATUS_PAYMENT_PENDING:
        raise ValueError(
            "This parking session is not awaiting payment."
        )

    # Prevent duplicate payment
    existing_payment = payment_repository.get_payment_by_session(
        db,
        payment.session_id,
    )

    if existing_payment:
        raise ValueError(
            "Payment already exists for this parking session."
        )

    created_payment = payment_repository.create_payment(
        db,
        payment,
    )

    # Automatically complete the parking session if payment succeeds
    if created_payment.payment_status == PAYMENT_STATUS_SUCCESSFUL:
        parking_session_service.complete_session_after_payment(
            db,
            created_payment.session_id,
        )

    return created_payment

def get_all_payments(
    db: Session,
):
    return payment_repository.get_all_payments(
        db,
    )


def get_payment(
    db: Session,
    payment_id: int,
):
    return payment_repository.get_payment(
        db,
        payment_id,
    )


def update_payment(
    db: Session,
    payment_id: int,
    payment: PaymentUpdate,
):
    # Automatically stamp paid_at when payment becomes successful
    if (
        payment.payment_status == PAYMENT_STATUS_SUCCESSFUL
        and payment.paid_at is None
    ):
        payment.paid_at = datetime.utcnow()

    updated = payment_repository.update_payment(
        db,
        payment_id,
        payment,
    )

    if updated is None:
        return None

    # The exit gate is only ever opened AFTER a successful payment.
    if updated.payment_status == PAYMENT_STATUS_SUCCESSFUL:
        parking_session_service.complete_session_after_payment(
            db,
            updated.session_id,
        )

    return updated


def delete_payment(
    db: Session,
    payment_id: int,
):
    return payment_repository.delete_payment(
        db,
        payment_id,
    )
