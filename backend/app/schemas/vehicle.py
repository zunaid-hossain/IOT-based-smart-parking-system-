from pydantic import BaseModel


class VehicleBase(BaseModel):
    plate_number: str
    vehicle_type: str
    brand: str
    model: str
    color: str


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    plate_number: str | None = None
    vehicle_type: str | None = None
    brand: str | None = None
    model: str | None = None
    color: str | None = None


class VehicleResponse(VehicleBase):
    id: int
    owner_id: int

    model_config = {
        "from_attributes": True
    }
