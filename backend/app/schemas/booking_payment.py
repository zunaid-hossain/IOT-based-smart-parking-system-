from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.constants import PAYMENT_STATUS_PENDING


class BookingPaymentUpdate(BaseModel):
    """
    Used to confirm (or fail) the reservation-protection charge.
    """

    payment_status: str | None = None
    transaction_id: str | None = None
    paid_at: datetime | None = None


class BookingPaymentResponse(BaseModel):
    id: int
    booking_id: int
    amount: float
    payment_status: str = PAYMENT_STATUS_PENDING
    transaction_id: str | None = None
    paid_at: datetime | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
