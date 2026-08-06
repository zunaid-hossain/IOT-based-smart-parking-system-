from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import PAYMENT_STATUS_PENDING
from app.models.base_model import BaseModel


class Payment(BaseModel):
    """
    Payment is tied to a ParkingSession (actual parking activity),
    not to a Booking (reservation).
    """

    __tablename__ = "payments"

    session_id: Mapped[int] = mapped_column(
        ForeignKey("parking_sessions.id", ondelete="CASCADE"),
        unique=True,
        nullable=False
    )

    amount: Mapped[float] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    payment_method: Mapped[str] = mapped_column(
        String(30),
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

    session = relationship(
        "ParkingSession",
        back_populates="payment"
    )
