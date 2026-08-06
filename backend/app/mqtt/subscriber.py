import json

from paho.mqtt import client as paho_mqtt

from app.core.logger import logger
from app.mqtt import topics
from app.mqtt.client import get_mqtt_client


def _on_message(client, userdata, msg):
    """
    Handle incoming MQTT messages from ESP32 devices.
    Supports:
      - parking/sensor/ir    -> IR sensor confirms vehicle physically parked
      - parking/sensor/rfid  -> RFID card scanned at exit gate
      - parking/gate/status  -> ESP32 reports gate status change
    """
    topic = msg.topic
    raw = msg.payload.decode("utf-8", errors="replace")

    try:
        payload = json.loads(raw) if raw else {}
    except json.JSONDecodeError:
        payload = {"raw": raw}

    logger.info(f"MQTT message received on '{topic}': {payload}")

    if topic == topics.SENSOR_IR:
        _handle_ir_sensor(payload)
    elif topic == topics.SENSOR_RFID:
        _handle_rfid(payload)
    elif topic == topics.GATE_STATUS:
        _handle_gate_status(payload)
    else:
        logger.warning(f"Unhandled MQTT topic: {topic}")


def _handle_ir_sensor(payload):
    """
    IR sensor event: verify the vehicle is in the correct slot.
    Expected payload: {"session_id": 1, "slot_id": 5}
    """
    session_id = payload.get("session_id")
    slot_id = payload.get("slot_id")

    if session_id is None:
        logger.error("IR sensor event missing 'session_id'")
        return

    # Import here to avoid circular imports
    from app.database.session import SessionLocal
    from app.services import parking_session_service

    db = SessionLocal()
    try:
        session = parking_session_service.verify_slot(
            db,
            session_id=session_id,
            slot_id=slot_id,
        )
        logger.info(
            f"IR sensor verified vehicle in slot {slot_id} "
            f"(session {session.id})"
        )
    except ValueError as exc:
        logger.error(f"IR sensor verification failed: {exc}")
    except Exception as exc:
        logger.error(f"Unexpected IR sensor error: {exc}")
    finally:
        db.close()


def _handle_rfid(payload):
    """
    RFID scan event: customer scans the slot's permanently-installed
    RFID card at the exit gate. Calculates bill and marks the session
    as payment_pending.
    Expected payload: {"rfid_uid": "SLOT001"}
    """
    rfid_uid = payload.get("rfid_uid")

    if not rfid_uid:
        logger.error("RFID event missing 'rfid_uid'")
        return

    from app.database.session import SessionLocal
    from app.services import parking_session_service

    db = SessionLocal()
    try:
        session = parking_session_service.process_exit_scan(
            db,
            rfid_uid=rfid_uid,
        )
        logger.info(
            f"RFID scan for {rfid_uid}: session {session.id} "
            f"marked payment_pending (amount={session.amount})"
        )
    except ValueError as exc:
        logger.error(f"RFID exit scan failed: {exc}")
    except Exception as exc:
        logger.error(f"Unexpected RFID error: {exc}")
    finally:
        db.close()


def _handle_gate_status(payload):
    """
    ESP32 reports a gate status change.
    Expected payload: {"gate": "entry"|"exit", "status": "open"|"closed"}
    """
    gate = payload.get("gate")
    status = payload.get("status")

    logger.info(f"Gate status update: {gate}={status}")


def start_subscriber():
    """Subscribe to all sensor topics and attach the message handler."""
    client = get_mqtt_client()
    client.on_message = _on_message
    client.subscribe(topics.SENSOR_IR, qos=1)
    client.subscribe(topics.SENSOR_RFID, qos=1)
    client.subscribe(topics.GATE_STATUS, qos=1)
    logger.info("MQTT subscriber started (sensor/ir, sensor/rfid, gate/status)")