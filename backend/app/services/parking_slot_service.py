from sqlalchemy.orm import Session

from app.repositories import parking_slot_repository
from app.schemas.parking_slot import (
    ParkingSlotCreate,
    ParkingSlotUpdate,
)


def create_slot(
    db: Session,
    slot: ParkingSlotCreate,
):
    # Duplicate RFID prevention: one RFID card can only ever be
    # assigned to one parking slot.
    existing = parking_slot_repository.get_slot_by_rfid(db, slot.rfid_uid)

    if existing is not None:
        raise ValueError(
            f"RFID card '{slot.rfid_uid}' is already assigned to "
            f"slot #{existing.slot_number}."
        )

    return parking_slot_repository.create_slot(
        db,
        slot,
    )


def get_all_slots(
    db: Session,
):
    return parking_slot_repository.get_all_slots(
        db,
    )


def get_slot(
    db: Session,
    slot_id: int,
):
    return parking_slot_repository.get_slot(
        db,
        slot_id,
    )


def get_slot_by_number(
    db: Session,
    slot_number: int,
):
    return parking_slot_repository.get_slot_by_number(
        db,
        slot_number,
    )


def update_slot(
    db: Session,
    slot_id: int,
    slot: ParkingSlotUpdate,
):
    if slot.rfid_uid is not None:
        existing = parking_slot_repository.get_slot_by_rfid(
            db,
            slot.rfid_uid,
        )

        if existing is not None and existing.id != slot_id:
            raise ValueError(
                f"RFID card '{slot.rfid_uid}' is already assigned to "
                f"slot #{existing.slot_number}."
            )

    return parking_slot_repository.update_slot(
        db,
        slot_id,
        slot,
    )


def delete_slot(
    db: Session,
    slot_id: int,
):
    return parking_slot_repository.delete_slot(
        db,
        slot_id,
    )
