from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.core.constants import SESSION_STATUS_ACTIVE


class ParkingSessionVerifySlotRequest(BaseModel):
    """
    Sent by the IR sensor controller once it confirms the vehicle is
    physically parked in the correct reserved slot, right after the
    entry gate opens. slot_id is optional and only used as a
    cross-check against the session's reserved slot.
    """

    slot_id: int | None = None


class ParkingSessionExitRequest(BaseModel):
    """
    Sent by the exit-gate controller once the customer scans the RFID
    card permanently installed at their reserved slot. Note: this
    RFID belongs to the parking SLOT, not the vehicle or the customer
    -- each of the 8 slots has its own dedicated card.
    """

    rfid_uid: str


class ParkingSessionUpdate(BaseModel):
    session_status: str | None = None
    exit_time: datetime | None = None
    duration_minutes: int | None = None
    amount: float | None = None
    slot_verified: bool | None = None


class ParkingSessionResponse(BaseModel):
    id: int
    booking_id: int
    user_id: int
    vehicle_id: int
    slot_id: int
    entry_time: datetime
    exit_time: datetime | None = None
    duration_minutes: int | None = None
    amount: float | None = None
    session_status: str = SESSION_STATUS_ACTIVE
    slot_verified: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
