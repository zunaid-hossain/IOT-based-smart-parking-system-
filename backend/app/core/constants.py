# --- Booking rules ---
# A booking can only be made for today or the next calendar day.
MAX_BOOKING_DAYS_AHEAD = 1

# Vehicle must complete RFID entry within this many minutes of the
# booking's scheduled start time, or the reservation is auto-expired.
GRACE_PERIOD_MINUTES = 30

# --- Parking slot status values ---
SLOT_STATUS_AVAILABLE = "available"
SLOT_STATUS_RESERVED = "reserved"
SLOT_STATUS_OCCUPIED = "occupied"
SLOT_STATUS_MAINTENANCE = "maintenance"

# --- Booking status values ---
BOOKING_STATUS_RESERVED = "reserved"
BOOKING_STATUS_CONFIRMED = "confirmed"
BOOKING_STATUS_CANCELLED = "cancelled"
BOOKING_STATUS_COMPLETED = "completed"
BOOKING_STATUS_EXPIRED = "expired"

# --- Parking session status values ---
SESSION_STATUS_ACTIVE = "active"
SESSION_STATUS_COMPLETED = "completed"
SESSION_STATUS_PAYMENT_PENDING = "payment_pending"

# --- Payment status values (shared by booking_payments & payments) ---
PAYMENT_STATUS_PENDING = "pending"
PAYMENT_STATUS_SUCCESSFUL = "successful"
PAYMENT_STATUS_FAILED = "failed"
PAYMENT_STATUS_EXPIRED = "expired"

# --- Gate log values ---
GATE_TYPE_ENTRY = "ENTRY"
GATE_TYPE_EXIT = "EXIT"

GATE_ACTION_REQUEST = "REQUEST"
GATE_ACTION_OPENED = "OPENED"
GATE_ACTION_FAILED = "FAILED"
# IR sensor confirms the vehicle is physically parked in the
# correct reserved slot after the entry gate opens.
GATE_ACTION_VERIFIED = "VERIFIED"

# --- Billing (parking session) ---
HOURLY_RATE = 20.0
MINIMUM_PARKING_TIME = 30  # minutes; any shorter session is still billed for this floor

# --- Booking protection charge (no-show deterrent) ---
MINIMUM_BOOKING_CHARGE = 100.0
