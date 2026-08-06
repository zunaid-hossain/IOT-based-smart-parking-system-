from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import BaseModel


class ParkingSlot(BaseModel):
    __tablename__ = "parking_slots"

    slot_number: Mapped[int] = mapped_column(
        unique=True,
        nullable=False
    )

    rfid_uid: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(20),
        default="available",
        nullable=False
    )

    floor: Mapped[int] = mapped_column(
        default=1,
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    bookings = relationship(
        "Booking",
        back_populates="slot",
        cascade="all, delete-orphan"
    )

    parking_sessions = relationship(
        "ParkingSession",
        back_populates="slot",
        cascade="all, delete-orphan"
    )