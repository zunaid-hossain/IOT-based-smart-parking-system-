from pydantic import BaseModel


class ParkingSlotBase(BaseModel):
    slot_number: int
    rfid_uid: str
    status: str = "available"
    floor: int = 1
    is_active: bool = True


class ParkingSlotCreate(ParkingSlotBase):
    pass


class ParkingSlotUpdate(BaseModel):
    slot_number: int | None = None
    rfid_uid: str | None = None
    status: str | None = None
    floor: int | None = None
    is_active: bool | None = None


class ParkingSlotResponse(ParkingSlotBase):
    id: int

    model_config = {
        "from_attributes": True
    }