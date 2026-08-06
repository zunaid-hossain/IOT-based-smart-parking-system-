from sqlalchemy.orm import Session

from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate


def create_vehicle(
    db: Session,
    vehicle: VehicleCreate,
    owner_id: int,
):
    db_vehicle = Vehicle(
        owner_id=owner_id,
        plate_number=vehicle.plate_number,
        vehicle_type=vehicle.vehicle_type,
        brand=vehicle.brand,
        model=vehicle.model,
        color=vehicle.color,
    )

    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)

    return db_vehicle


def get_user_vehicles(
    db: Session,
    owner_id: int,
):
    return (
        db.query(Vehicle)
        .filter(Vehicle.owner_id == owner_id)
        .all()
    )


def get_vehicle(
    db: Session,
    vehicle_id: int,
):
    return (
        db.query(Vehicle)
        .filter(Vehicle.id == vehicle_id)
        .first()
    )


def update_vehicle(
    db: Session,
    vehicle_id: int,
    vehicle: VehicleUpdate,
):
    db_vehicle = get_vehicle(db, vehicle_id)

    if db_vehicle is None:
        return None

    update_data = vehicle.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_vehicle, key, value)

    db.commit()
    db.refresh(db_vehicle)

    return db_vehicle


def delete_vehicle(
    db: Session,
    vehicle_id: int,
):
    db_vehicle = get_vehicle(db, vehicle_id)

    if db_vehicle is None:
        return None

    db.delete(db_vehicle)
    db.commit()

    return db_vehicle