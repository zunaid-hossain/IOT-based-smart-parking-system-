from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import PAYMENT_STATUS_PENDING
from app.models.base_model import BaseModel


class BookingPayment(BaseModel):
    """
    A small, non-refundable protection charge paid at reservation time
    to deter no-shows. Distinct from the parking Payment tied to a
    ParkingSession, which covers the actual time-based parking bill.
    """

    __tablename__ = "booking_payments"

    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    payment_status: Mapped[str] = mapped_column(
        String(20),
        default=PAYMENT_STATUS_PENDING,
        nullable=False
    )

    transaction_id: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    paid_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    booking = relationship(
        "Booking",
        back_populates="booking_payment"
    )
