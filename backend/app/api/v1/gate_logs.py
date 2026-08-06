from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.oauth2 import get_current_user
from app.database.session import get_db
from app.models.user import User

from app.schemas.gate_log import (
    GateLogCreate,
    GateLogResponse,
)

from app.services import gate_log_service

router = APIRouter(
    prefix="/gate-logs",
    tags=["Gate Logs"],
)


@router.post(
    "",
    response_model=GateLogResponse,
)
def create_gate_log(
    gate_log: GateLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return gate_log_service.create_gate_log(
            db,
            gate_log,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.get(
    "",
    response_model=list[GateLogResponse],
)
def get_all_gate_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return gate_log_service.get_all_gate_logs(
        db,
    )


@router.get(
    "/{gate_log_id}",
    response_model=GateLogResponse,
)
def get_gate_log(
    gate_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    gate_log = gate_log_service.get_gate_log(
        db,
        gate_log_id,
    )

    if gate_log is None:
        raise HTTPException(
            status_code=404,
            detail="Gate log not found",
        )

    return gate_log


@router.get(
    "/booking/{booking_id}",
    response_model=list[GateLogResponse],
)
def get_booking_logs(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return gate_log_service.get_booking_logs(
        db,
        booking_id,
    )


@router.get(
    "/session/{session_id}",
    response_model=list[GateLogResponse],
)
def get_session_logs(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return gate_log_service.get_session_logs(
        db,
        session_id,
    )


@router.delete(
    "/{gate_log_id}",
)
def delete_gate_log(
    gate_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = gate_log_service.delete_gate_log(
        db,
        gate_log_id,
    )

    if deleted is None:
        raise HTTPException(
            status_code=404,
            detail="Gate log not found",
        )

    return {
        "message": "Gate log deleted successfully"
    }