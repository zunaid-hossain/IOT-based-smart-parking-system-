from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import BaseModel


class GateLog(BaseModel):
    """
    Tracks every gate-related event: entry/exit requests,
    gate openings, and RFID verification attempts.
    """

    __tablename__ = "gate_logs"

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    vehicle_id: Mapped[int | None] = mapped_column(
        ForeignKey("vehicles.id", ondelete="SET NULL"),
        nullable=True
    )

    booking_id: Mapped[int | None] = mapped_column(
        ForeignKey("bookings.id", ondelete="SET NULL"),
        nullable=True
    )

    session_id: Mapped[int | None] = mapped_column(
        ForeignKey("parking_sessions.id", ondelete="SET NULL"),
        nullable=True
    )

    rfid_uid: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    gate_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    action: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="gate_logs"
    )

    vehicle = relationship(
        "Vehicle",
        back_populates="gate_logs"
    )

    booking = relationship(
        "Booking",
        back_populates="gate_logs"
    )

    session = relationship(
        "ParkingSession",
        back_populates="gate_logs"
    )
