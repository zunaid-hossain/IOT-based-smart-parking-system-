from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import BaseModel


class Vehicle(BaseModel):
    __tablename__ = "vehicles"

    owner_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    plate_number: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        nullable=False,
    )

    vehicle_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    brand: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    model: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    color: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    owner = relationship(
        "User",
        back_populates="vehicles",
    )

    bookings = relationship(
        "Booking",
        back_populates="vehicle",
        cascade="all, delete-orphan",
    )

    parking_sessions = relationship(
        "ParkingSession",
        back_populates="vehicle",
        cascade="all, delete-orphan",
    )

    gate_logs = relationship(
        "GateLog",
        back_populates="vehicle",
    )