from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.auth.oauth2 import get_current_user
from app.models.user import User

from app.schemas.parking_slot import (
    ParkingSlotCreate,
    ParkingSlotUpdate,
    ParkingSlotResponse,
)

from app.services import parking_slot_service


router = APIRouter(
    prefix="/parking-slots",
    tags=["Parking Slots"],
)


@router.get(
    "",
    response_model=list[ParkingSlotResponse],
)
def get_all_slots(
    db: Session = Depends(get_db),
):
    return parking_slot_service.get_all_slots(db)


@router.get(
    "/{slot_id}",
    response_model=ParkingSlotResponse,
)
def get_slot(
    slot_id: int,
    db: Session = Depends(get_db),
):
    slot = parking_slot_service.get_slot(
        db,
        slot_id,
    )

    if slot is None:
        raise HTTPException(
            status_code=404,
            detail="Parking slot not found",
        )

    return slot


@router.post(
    "",
    response_model=ParkingSlotResponse,
)
def create_slot(
    slot: ParkingSlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return parking_slot_service.create_slot(
            db,
            slot,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.put(
    "/{slot_id}",
    response_model=ParkingSlotResponse,
)
def update_slot(
    slot_id: int,
    slot: ParkingSlotUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        updated_slot = parking_slot_service.update_slot(
            db,
            slot_id,
            slot,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    if updated_slot is None:
        raise HTTPException(
            status_code=404,
            detail="Parking slot not found",
        )

    return updated_slot


@router.delete(
    "/{slot_id}",
)
def delete_slot(
    slot_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted_slot = parking_slot_service.delete_slot(
        db,
        slot_id,
    )

    if deleted_slot is None:
        raise HTTPException(
            status_code=404,
            detail="Parking slot not found",
        )

    return {
        "message": "Parking slot deleted successfully"
    }