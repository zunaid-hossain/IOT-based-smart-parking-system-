# --- MQTT topics used to talk to the ESP32 gate controllers ---
# Spec: entry/open, exit/open, slot/update, sensor/ir, sensor/rfid, gate/status

# Published by backend -> ESP32 opens the entry gate
GATE_OPEN = "parking/entry/open"

# Published by backend -> ESP32 closes the entry gate
GATE_CLOSE = "parking/entry/close"

# Published by backend -> ESP32 opens the exit gate
# (only ever published AFTER a successful payment)
GATE_EXIT_OPEN = "parking/exit/open"

# Published by backend -> any subscriber interested in
# live parking slot status changes (available/reserved/occupied/...)
SLOT_UPDATE = "parking/slot/update"

# Subscribed by backend -> ESP32 reports IR sensor events
# (e.g. vehicle physically detected in the reserved slot)
SENSOR_IR = "parking/sensor/ir"

# Subscribed by backend -> ESP32 reports RFID reader events
# (e.g. customer scans the slot's permanently-installed RFID card)
SENSOR_RFID = "parking/sensor/rfid"

# Subscribed by backend -> ESP32 reports gate status changes
GATE_STATUS = "parking/gate/status"