from datetime import date, datetime, time

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.constants import BOOKING_STATUS_RESERVED, MINIMUM_BOOKING_CHARGE
from app.models.base_model import BaseModel


class Booking(BaseModel):
    """
    Represents a parking RESERVATION only (future booking).
    The actual vehicle entry / exit is tracked separately
    in the ParkingSession model.
    """

    __tablename__ = "bookings"

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

    booking_date: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    scheduled_start_time: Mapped[time] = mapped_column(
        Time,
        nullable=False
    )

    booking_status: Mapped[str] = mapped_column(
        String(20),
        default=BOOKING_STATUS_RESERVED,
        nullable=False
    )

    # Non-refundable reservation-protection charge (no-show deterrent).
    # Always set to MINIMUM_BOOKING_CHARGE at creation time; the actual
    # payment transaction lives in the related BookingPayment row.
    booking_charge: Mapped[float] = mapped_column(
        Numeric(10, 2),
        default=MINIMUM_BOOKING_CHARGE,
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="bookings"
    )

    vehicle = relationship(
        "Vehicle",
        back_populates="bookings"
    )

    slot = relationship(
        "ParkingSlot",
        back_populates="bookings"
    )

    parking_sessions = relationship(
        "ParkingSession",
        back_populates="booking",
        cascade="all, delete-orphan"
    )

    booking_payment = relationship(
        "BookingPayment",
        back_populates="booking",
        uselist=False,
        cascade="all, delete-orphan"
    )

    gate_logs = relationship(
        "GateLog",
        back_populates="booking",
        cascade="all, delete-orphan"
    )

    @property
    def reserved_slot_rfid_uid(self) -> str | None:
        """
        The RFID card is permanently attached to the physical parking
        slot (Slot 1 has RFID001, Slot 2 has RFID002, etc.) -- it is
        never assigned to or owned by the customer. This property just
        tells the user which slot they've reserved, and therefore
        which installed RFID card to scan on their way OUT. It's the
        booking that's linked to the slot's RFID, not the customer.
        Not revealed before the protection fee payment succeeds.
        """

        if (
            self.booking_payment is not None
            and self.booking_payment.payment_status == "successful"
        ):
            return self.slot.rfid_uid

        return None
