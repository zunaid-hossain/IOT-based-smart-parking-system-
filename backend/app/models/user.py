from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base_model import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    full_name: Mapped[str] = mapped_column(String(100))

    email: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True
    )

    phone: Mapped[str] = mapped_column(
        String(20),
        unique=True
    )

    password: Mapped[str] = mapped_column(String(255))

    role: Mapped[str] = mapped_column(
        String(20),
        default="user"
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    vehicles = relationship(
        "Vehicle",
        back_populates="owner",
        cascade="all, delete"
    )

    bookings = relationship(
        "Booking",
        back_populates="user",
        cascade="all, delete"
    )

    parking_sessions = relationship(
        "ParkingSession",
        back_populates="user",
        cascade="all, delete"
    )

    gate_logs = relationship(
        "GateLog",
        back_populates="user",
    )
    