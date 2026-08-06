from sqlalchemy.orm import Session

from app.repositories import gate_log_repository
from app.schemas.gate_log import GateLogCreate


def log_event(
    db: Session,
    *,
    gate_type: str,
    action: str,
    user_id: int | None = None,
    vehicle_id: int | None = None,
    booking_id: int | None = None,
    session_id: int | None = None,
    rfid_uid: str | None = None,
):
    """
    Internal helper used by other services (booking, parking session,
    payment) to record gate/RFID events as they happen.
    """

    return gate_log_repository.create_gate_log(
        db,
        gate_type=gate_type,
        action=action,
        user_id=user_id,
        vehicle_id=vehicle_id,
        booking_id=booking_id,
        session_id=session_id,
        rfid_uid=rfid_uid,
    )


def create_gate_log(
    db: Session,
    gate_log: GateLogCreate,
):
    """
    Manual/admin gate log creation via the API.
    """

    return gate_log_repository.create_gate_log(
        db,
        gate_type=gate_log.gate_type,
        action=gate_log.action,
        user_id=gate_log.user_id,
        vehicle_id=gate_log.vehicle_id,
        booking_id=gate_log.booking_id,
        session_id=gate_log.session_id,
        rfid_uid=gate_log.rfid_uid,
    )


def get_gate_log(
    db: Session,
    gate_log_id: int,
):
    return gate_log_repository.get_gate_log(
        db,
        gate_log_id,
    )


def get_booking_logs(
    db: Session,
    booking_id: int,
):
    return gate_log_repository.get_booking_logs(
        db,
        booking_id,
    )


def get_session_logs(
    db: Session,
    session_id: int,
):
    return gate_log_repository.get_session_logs(
        db,
        session_id,
    )


def get_all_gate_logs(
    db: Session,
):
    return gate_log_repository.get_all_gate_logs(
        db,
    )


def delete_gate_log(
    db: Session,
    gate_log_id: int,
):
    return gate_log_repository.delete_gate_log(
        db,
        gate_log_id,
    )
