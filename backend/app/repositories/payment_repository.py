from sqlalchemy.orm import Session

from app.models.payment import Payment
from app.schemas.payment import (
    PaymentCreate,
    PaymentUpdate,
)


def create_payment(
    db: Session,
    payment: PaymentCreate,
):
    db_payment = Payment(
        session_id=payment.session_id,
        amount=payment.amount,
        payment_method=payment.payment_method,
        payment_status=payment.payment_status,
        transaction_id=payment.transaction_id,
        paid_at=payment.paid_at,
    )

    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)

    return db_payment


def get_payment(
    db: Session,
    payment_id: int,
):
    return (
        db.query(Payment)
        .filter(Payment.id == payment_id)
        .first()
    )


def get_payment_by_session(
    db: Session,
    session_id: int,
):
    return (
        db.query(Payment)
        .filter(Payment.session_id == session_id)
        .first()
    )


def get_all_payments(
    db: Session,
):
    return (
        db.query(Payment)
        .all()
    )


def update_payment(
    db: Session,
    payment_id: int,
    payment: PaymentUpdate,
):
    db_payment = get_payment(
        db,
        payment_id,
    )

    if db_payment is None:
        return None

    update_data = payment.model_dump(
        exclude_unset=True,
        exclude_none=True,
    )

    for key, value in update_data.items():
        setattr(db_payment, key, value)

    db.commit()
    db.refresh(db_payment)

    return db_payment


def delete_payment(
    db: Session,
    payment_id: int,
):
    db_payment = get_payment(
        db,
        payment_id,
    )

    if db_payment is None:
        return None

    db.delete(db_payment)
    db.commit()

    return db_payment