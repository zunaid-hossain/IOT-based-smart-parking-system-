from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.auth.oauth2 import get_current_user
from app.models.user import User

from app.schemas.booking import (
    BookingCreate,
    BookingUpdate,
    BookingResponse,
)
from app.schemas.booking_payment import (
    BookingPaymentUpdate,
    BookingPaymentResponse,
)
from app.schemas.parking_session import ParkingSessionResponse

from app.services import booking_payment_service, booking_service

router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


@router.post(
    "",
    response_model=BookingResponse,
)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return booking_service.create_booking(
            db,
            booking,
            current_user.id,
        )

    except PermissionError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get(
    "",
    response_model=list[BookingResponse],
)
def get_bookings(
    db: Session = Depends(get_db),
):
    return booking_service.get_all_bookings(
        db,
    )


@router.get(
    "/my",
    response_model=list[BookingResponse],
)
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return booking_service.get_user_bookings(
        db,
        current_user.id,
    )


@router.get(
    "/{booking_id}",
    response_model=BookingResponse,
)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
):
    booking = booking_service.get_booking(
        db,
        booking_id,
    )

    if booking is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    return booking


@router.put(
    "/{booking_id}",
    response_model=BookingResponse,
)
def update_booking(
    booking_id: int,
    booking: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = booking_service.update_booking(
        db,
        booking_id,
        booking,
    )

    if updated is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    return updated


@router.delete(
    "/{booking_id}",
)
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = booking_service.delete_booking(
        db,
        booking_id,
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    return {
        "message": "Booking deleted successfully"
    }


@router.get(
    "/{booking_id}/booking-payment",
    response_model=BookingPaymentResponse,
)
def get_booking_payment(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    View the reservation-protection fee (amount, status) for a booking.
    """

    try:
        return booking_payment_service.get_by_booking(
            db,
            booking_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.put(
    "/{booking_id}/booking-payment",
    response_model=BookingPaymentResponse,
)
def pay_booking_protection_fee(
    booking_id: int,
    payment: BookingPaymentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Confirms (or fails) the booking-protection fee. On success, the
    slot is reserved, and the booking becomes linked to that slot's
    permanently-installed RFID card (visible via GET /bookings/{id}
    as reserved_slot_rfid_uid). The card itself stays attached to the
    slot -- it's used only when exiting.
    """

    try:
        return booking_payment_service.confirm_booking_payment(
            db,
            booking_id,
            payment,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.post(
    "/{booking_id}/open-gate",
    response_model=ParkingSessionResponse,
)
def open_gate(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    User taps "Open Gate" in the app. Verifies the booking, its
    protection-fee payment, and the scheduled time window, then opens
    the entry gate and creates the Parking Session. There is no RFID
    check at entry -- the booking + gate system controls access.
    """

    try:
        return booking_service.request_gate_open(
            db,
            booking_id,
            current_user.id,
        )

    except PermissionError as e:
        raise HTTPException(
            status_code=403,
            detail=str(e),
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )
