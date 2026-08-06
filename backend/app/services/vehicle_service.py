from sqlalchemy.orm import Session

from app.repositories import vehicle_repository
from app.schemas.vehicle import VehicleCreate, VehicleUpdate


def create_vehicle(
    db: Session,
    vehicle: VehicleCreate,
    owner_id: int
):
    return vehicle_repository.create_vehicle(
        db,
        vehicle,
        owner_id
    )


def get_user_vehicles(
    db: Session,
    owner_id: int
):
    return vehicle_repository.get_user_vehicles(
        db,
        owner_id
    )


def get_vehicle(
    db: Session,
    vehicle_id: int
):
    return vehicle_repository.get_vehicle(
        db,
        vehicle_id
    )


def update_vehicle(
    db: Session,
    vehicle_id: int,
    vehicle: VehicleUpdate
):
    return vehicle_repository.update_vehicle(
        db,
        vehicle_id,
        vehicle
    )


def delete_vehicle(
    db: Session,
    vehicle_id: int
):
    return vehicle_repository.delete_vehicle(
        db,
        vehicle_id
    )