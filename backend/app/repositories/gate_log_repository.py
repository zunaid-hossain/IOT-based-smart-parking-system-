from datetime import datetime

from sqlalchemy.orm import Session

from app.models.gate_log import GateLog


def create_gate_log(
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
    db_gate_log = GateLog(
        user_id=user_id,
        vehicle_id=vehicle_id,
        booking_id=booking_id,
        session_id=session_id,
        rfid_uid=rfid_uid,
        gate_type=gate_type,
        action=action,
        timestamp=datetime.utcnow(),
    )

    db.add(db_gate_log)
    db.commit()
    db.refresh(db_gate_log)

    return db_gate_log


def get_gate_log(
    db: Session,
    gate_log_id: int,
):
    return (
        db.query(GateLog)
        .filter(GateLog.id == gate_log_id)
        .first()
    )


def get_booking_logs(
    db: Session,
    booking_id: int,
):
    return (
        db.query(GateLog)
        .filter(GateLog.booking_id == booking_id)
        .order_by(GateLog.timestamp.desc())
        .all()
    )


def get_session_logs(
    db: Session,
    session_id: int,
):
    return (
        db.query(GateLog)
        .filter(GateLog.session_id == session_id)
        .order_by(GateLog.timestamp.desc())
        .all()
    )


def get_all_gate_logs(
    db: Session,
):
    return (
        db.query(GateLog)
        .order_by(GateLog.timestamp.desc())
        .all()
    )


def delete_gate_log(
    db: Session,
    gate_log_id: int,
):
    gate_log = get_gate_log(
        db,
        gate_log_id,
    )

    if gate_log is None:
        return None

    db.delete(gate_log)
    db.commit()

    return gate_log
