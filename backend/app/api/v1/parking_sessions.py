from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.oauth2 import get_current_user
from app.database.session import get_db
from app.models.user import User

from app.schemas.parking_session import (
    ParkingSessionExitRequest,
    ParkingSessionResponse,
    ParkingSessionVerifySlotRequest,
)

from app.services import parking_session_service

router = APIRouter(
    prefix="/parking-sessions",
    tags=["Parking Sessions"],
)


@router.post(
    "/{session_id}/verify-slot",
    response_model=ParkingSessionResponse,
)
def verify_slot(
    session_id: int,
    payload: ParkingSessionVerifySlotRequest,
    db: Session = Depends(get_db),
):
    """
    Called by the IR sensor controller once it confirms the vehicle
    is physically parked in the correct reserved slot, right after
    the entry gate opens.
    """

    try:
        return parking_session_service.verify_slot(
            db,
            session_id,
            payload.slot_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.post(
    "/exit",
    response_model=ParkingSessionResponse,
)
def scan_exit(
    payload: ParkingSessionExitRequest,
    db: Session = Depends(get_db),
):
    """
    Called by the exit-gate controller when the customer scans the
    RFID card installed at their reserved slot. Calculates the bill
    and marks the session as payment_pending. The exit gate itself
    only opens once payment succeeds (see the Payments API). Rejected
    if the IR sensor never verified the vehicle was actually in the
    reserved slot (session.slot_verified must be True).
    """

    try:
        return parking_session_service.process_exit_scan(
            db,
            payload.rfid_uid,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get(
    "",
    response_model=list[ParkingSessionResponse],
)
def get_all_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return parking_session_service.get_all_sessions(db)


@router.get(
    "/my",
    response_model=list[ParkingSessionResponse],
)
def get_my_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return parking_session_service.get_user_sessions(
        db,
        current_user.id,
    )


@router.get(
    "/{session_id}",
    response_model=ParkingSessionResponse,
)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    session = parking_session_service.get_session(
        db,
        session_id,
    )

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Parking session not found",
        )

    return session
