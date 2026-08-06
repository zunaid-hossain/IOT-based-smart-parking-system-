from datetime import datetime

from pydantic import BaseModel, ConfigDict


class GateLogBase(BaseModel):
    user_id: int | None = None
    vehicle_id: int | None = None
    booking_id: int | None = None
    session_id: int | None = None
    rfid_uid: str | None = None
    gate_type: str
    action: str


class GateLogCreate(GateLogBase):
    pass


class GateLogResponse(GateLogBase):
    id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
