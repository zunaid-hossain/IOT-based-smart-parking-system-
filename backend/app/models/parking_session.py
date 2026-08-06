from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import SESSION_STATUS_ACTIVE
from app.models.base_model import BaseModel


class ParkingSession(BaseModel):
    """
    Represents an ACTUAL parking activity: vehicle entry through exit.
    Created once a booked vehicle scans in at the entry gate.
    """

    __tablename__ = "parking_sessions"

    booking_id: Mapped[int] = mapped_column(
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    vehicle_id: Mapped[int] = mapped_column(
        ForeignKey("vehicles.id", ondelete="CASCADE"),
        nullable=False
    )

    slot_id: Mapped[int] = mapped_column(
        ForeignKey("parking_slots.id", ondelete="CASCADE"),
        nullable=False
    )

    entry_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    exit_time: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    duration_minutes: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    amount: Mapped[float | None] = mapped_column(
        Numeric(10, 2),
        nullable=True
    )

    session_status: Mapped[str] = mapped_column(
        String(20),
        default=SESSION_STATUS_ACTIVE,
        nullable=False
    )

    # Set True once the IR sensor confirms the vehicle is physically
    # parked in the correct reserved slot after the entry gate opens.
    slot_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    booking = relationship(
        "Booking",
        back_populates="parking_sessions"
    )

    user = relationship(
        "User",
        back_populates="parking_sessions"
    )

    vehicle = relationship(
        "Vehicle",
        back_populates="parking_sessions"
    )

    slot = relationship(
        "ParkingSlot",
        back_populates="parking_sessions"
    )

    payment = relationship(
        "Payment",
        back_populates="session",
        uselist=False,
        cascade="all, delete-orphan"
    )

    gate_logs = relationship(
        "GateLog",
        back_populates="session",
        cascade="all, delete-orphan"
    )
