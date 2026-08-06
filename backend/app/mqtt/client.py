from paho.mqtt import client as paho_mqtt

from app.core.config import settings
from app.core.logger import logger

_client: paho_mqtt.Client | None = None


def get_mqtt_client() -> paho_mqtt.Client:
    """
    Return a lazily-created, module-level singleton MQTT client
    connected to the broker configured in settings.
    """

    global _client

    if _client is not None:
        return _client

    client = paho_mqtt.Client(
        client_id="smart-parking-backend",
        protocol=paho_mqtt.MQTTv311,
    )

    client.on_connect = _on_connect
    client.on_disconnect = _on_disconnect

    try:
        client.connect(
            settings.MQTT_HOST,
            settings.MQTT_PORT,
        )
        client.loop_start()

    except Exception as exc:
        logger.error(f"Failed to connect to MQTT broker: {exc}")

    _client = client

    return _client


def _on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info("Connected to MQTT broker.")
    else:
        logger.error(f"MQTT connection failed with code {rc}.")


def _on_disconnect(client, userdata, rc):
    logger.warning("Disconnected from MQTT broker.")
