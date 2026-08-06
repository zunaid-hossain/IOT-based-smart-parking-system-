from sqlalchemy.orm import Session

from app.models.booking_payment import BookingPayment


def create_booking_payment(
    db: Session,
    booking_id: int,
    amount: float,
):
    db_payment = BookingPayment(
        booking_id=booking_id,
        amount=amount,
    )

    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)

    return db_payment


def get_booking_payment(
    db: Session,
    booking_payment_id: int,
):
    return (
        db.query(BookingPayment)
        .filter(BookingPayment.id == booking_payment_id)
        .first()
    )


def get_by_booking(
    db: Session,
    booking_id: int,
):
    return (
        db.query(BookingPayment)
        .filter(BookingPayment.booking_id == booking_id)
        .first()
    )


def update_booking_payment(
    db: Session,
    booking_payment_id: int,
    update_data: dict,
):
    db_payment = get_booking_payment(db, booking_payment_id)

    if db_payment is None:
        return None

    for key, value in update_data.items():
        setattr(db_payment, key, value)

    db.commit()
    db.refresh(db_payment)

    return db_payment
