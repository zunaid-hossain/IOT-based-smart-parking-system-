from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth.oauth2 import get_current_user
from app.models.user import User
from app.mqtt.publisher import publish

router = APIRouter(
    prefix="/mqtt",
    tags=["MQTT Testing"],
)


class MqttPublishRequest(BaseModel):
    topic: str
    payload: dict


@router.get("/topics")
def list_topics(
    current_user: User = Depends(get_current_user),
):
    """
    List all MQTT topics used by the Smart Parking system.
    Useful for debugging and testing ESP32 integrations.
    """

    from app.mqtt import topics

    return {
        "publish": {
            "entry_open": topics.GATE_OPEN,
            "entry_close": topics.GATE_CLOSE,
            "exit_open": topics.GATE_EXIT_OPEN,
            "slot_update": topics.SLOT_UPDATE,
        },
        "subscribe": {
            "sensor_ir": topics.SENSOR_IR,
            "sensor_rfid": topics.SENSOR_RFID,
            "gate_status": topics.GATE_STATUS,
        },
    }


@router.post("/publish")
def publish_message(
    req: MqttPublishRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Publish a custom message to an MQTT topic. For testing ESP32
    integrations or simulating device messages.
    """

    publish(req.topic, req.payload)
    return {"status": "published", "topic": req.topic, "payload": req.payload}


@router.post("/simulate/ir-sensor")
def simulate_ir_sensor(
    session_id: int,
    slot_id: int | None = None,
    current_user: User = Depends(get_current_user),
):
    """
    Simulate an ESP32 IR sensor event confirming a vehicle is parked
    in the correct slot. Publishes to parking/sensor/ir.
    """

    from app.mqtt import topics

    payload = {"session_id": session_id}
    if slot_id is not None:
        payload["slot_id"] = slot_id

    publish(topics.SENSOR_IR, payload)
    return {"status": "simulated", "topic": topics.SENSOR_IR, "payload": payload}


@router.post("/simulate/rfid-scan")
def simulate_rfid_scan(
    rfid_uid: str,
    current_user: User = Depends(get_current_user),
):
    """
    Simulate an ESP32 RFID reader event when a customer scans the
    slot's permanently-installed RFID card at the exit gate.
    Publishes to parking/sensor/rfid.
    """

    from app.mqtt import topics

    payload = {"rfid_uid": rfid_uid}
    publish(topics.SENSOR_RFID, payload)
    return {"status": "simulated", "topic": topics.SENSOR_RFID, "payload": payload}