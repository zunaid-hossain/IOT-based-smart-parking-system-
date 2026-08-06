from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.constants import (
    PAYMENT_STATUS_PENDING,
    PAYMENT_STATUS_SUCCESSFUL,
)


class PaymentBase(BaseModel):
    session_id: int
    amount: float
    payment_method: str


class PaymentCreate(PaymentBase):
    # For demo purposes, payment succeeds immediately.
    payment_status: str = PAYMENT_STATUS_SUCCESSFUL
    transaction_id: str | None = None
    paid_at: datetime | None = None


class PaymentUpdate(BaseModel):
    payment_status: str | None = None
    transaction_id: str | None = None
    paid_at: datetime | None = None


class PaymentResponse(PaymentBase):
    id: int
    payment_status: str = PAYMENT_STATUS_PENDING
    transaction_id: str | None = None
    paid_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)