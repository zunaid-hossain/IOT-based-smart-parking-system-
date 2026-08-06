from sqlalchemy.orm import Session

from app.models.parking_slot import ParkingSlot
from app.schemas.parking_slot import (
    ParkingSlotCreate,
    ParkingSlotUpdate,
)


def create_slot(
    db: Session,
    slot: ParkingSlotCreate,
):
    db_slot = ParkingSlot(
        slot_number=slot.slot_number,
        rfid_uid=slot.rfid_uid,
        status=slot.status,
        floor=slot.floor,
        is_active=slot.is_active,
    )

    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)

    return db_slot


def get_all_slots(
    db: Session,
):
    return (
        db.query(ParkingSlot)
        .order_by(ParkingSlot.slot_number)
        .all()
    )


def get_slot(
    db: Session,
    slot_id: int,
):
    return (
        db.query(ParkingSlot)
        .filter(ParkingSlot.id == slot_id)
        .first()
    )


def get_slot_by_number(
    db: Session,
    slot_number: int,
):
    return (
        db.query(ParkingSlot)
        .filter(ParkingSlot.slot_number == slot_number)
        .first()
    )


def get_slot_by_rfid(
    db: Session,
    rfid_uid: str,
):
    return (
        db.query(ParkingSlot)
        .filter(ParkingSlot.rfid_uid == rfid_uid)
        .first()
    )


def update_slot(
    db: Session,
    slot_id: int,
    slot: ParkingSlotUpdate,
):
    db_slot = get_slot(db, slot_id)

    if db_slot is None:
        return None

    update_data = slot.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_slot, key, value)

    db.commit()
    db.refresh(db_slot)

    return db_slot


def set_slot_status(
    db: Session,
    slot_id: int,
    status: str,
):
    """
    Lightweight internal helper to flip a slot's status
    (available / reserved / occupied / maintenance) without
    needing to build a full ParkingSlotUpdate schema.
    """

    db_slot = get_slot(db, slot_id)

    if db_slot is None:
        return None

    db_slot.status = status

    db.commit()
    db.refresh(db_slot)

    return db_slot


def delete_slot(
    db: Session,
    slot_id: int,
):
    db_slot = get_slot(db, slot_id)

    if db_slot is None:
        return None

    db.delete(db_slot)
    db.commit()

    return db_slot