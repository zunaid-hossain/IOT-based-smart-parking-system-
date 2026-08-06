from datetime import date, datetime, time, timedelta

from pydantic import BaseModel, ConfigDict, field_validator

from app.core.constants import (
    BOOKING_STATUS_RESERVED,
    MAX_BOOKING_DAYS_AHEAD,
    MINIMUM_BOOKING_CHARGE,
)


class BookingBase(BaseModel):
    vehicle_id: int
    slot_id: int
    booking_date: date
    scheduled_start_time: time

    @field_validator("booking_date")
    @classmethod
    def booking_date_within_allowed_range(cls, value: date) -> date:
        """
        A booking can only be made for today or the next calendar day.
        """

        today = date.today()
        max_date = today + timedelta(days=MAX_BOOKING_DAYS_AHEAD)

        if value < today:
            raise ValueError("Booking date cannot be in the past.")

        if value > max_date:
            raise ValueError(
                f"Booking date can only be today ({today}) "
                f"or up to {MAX_BOOKING_DAYS_AHEAD} day(s) ahead "
                f"(latest allowed: {max_date})."
            )

        return value


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    booking_status: str | None = None
    scheduled_start_time: time | None = None


class BookingResponse(BookingBase):
    id: int
    user_id: int
    booking_status: str = BOOKING_STATUS_RESERVED
    booking_charge: float = MINIMUM_BOOKING_CHARGE
    reserved_slot_rfid_uid: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
