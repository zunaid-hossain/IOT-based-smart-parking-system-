import json

from app.core.logger import logger
from app.mqtt import topics
from app.mqtt.client import get_mqtt_client


def publish(topic: str, payload: dict) -> None:
    """
    Publish a JSON payload to the given MQTT topic.
    Failures are logged but never raised, so a broker outage
    does not break the request/response flow of the API.
    """

    client = get_mqtt_client()

    try:
        client.publish(topic, json.dumps(payload))

    except Exception as exc:
        logger.error(f"Failed to publish to '{topic}': {exc}")


def open_entry_gate(booking_id: int, slot_id: int) -> None:
    publish(
        topics.GATE_OPEN,
        {
            "booking_id": booking_id,
            "slot_id": slot_id,
        },
    )


def close_entry_gate(slot_id: int) -> None:
    publish(
        topics.GATE_CLOSE,
        {
            "slot_id": slot_id,
        },
    )


def open_exit_gate(session_id: int, slot_id: int) -> None:
    """
    Must only ever be called AFTER payment has been
    confirmed as successful.
    """

    publish(
        topics.GATE_EXIT_OPEN,
        {
            "session_id": session_id,
            "slot_id": slot_id,
        },
    )


def publish_slot_update(slot_id: int, status: str) -> None:
    publish(
        topics.SLOT_UPDATE,
        {
            "slot_id": slot_id,
            "status": status,
        },
    )
