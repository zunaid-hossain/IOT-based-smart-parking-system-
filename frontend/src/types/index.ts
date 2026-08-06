export interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
}

export interface Vehicle {
  id: number;
  owner_id: number;
  plate_number: string;
  vehicle_type: string;
  brand: string;
  model: string;
  color: string;
}

export interface ParkingSlot {
  id: number;
  slot_number: number;
  rfid_uid: string;
  status: "available" | "reserved" | "occupied" | "maintenance";
  floor: number;
  is_active: boolean;
}

export interface Booking {
  id: number;
  user_id: number;
  vehicle_id: number;
  slot_id: number;
  booking_date: string;
  scheduled_start_time: string;
  booking_status: "reserved" | "confirmed" | "cancelled" | "completed" | "expired";
  booking_charge: number;
  reserved_slot_rfid_uid: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingPayment {
  id: number;
  booking_id: number;
  amount: number;
  payment_status: "pending" | "successful" | "failed" | "expired";
  transaction_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParkingSession {
  id: number;
  booking_id: number;
  user_id: number;
  vehicle_id: number;
  slot_id: number;
  entry_time: string;
  exit_time: string | null;
  duration_minutes: number | null;
  amount: number | null;
  session_status: "active" | "payment_pending" | "completed";
  slot_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  session_id: number;
  amount: number;
  payment_method: string;
  payment_status: "pending" | "successful" | "failed";
  transaction_id: string | null;
  paid_at: string | null;
}

export interface GateLog {
  id: number;
  gate_type: "ENTRY" | "EXIT";
  action: "REQUEST" | "OPENED" | "FAILED" | "VERIFIED";
  user_id: number | null;
  vehicle_id: number | null;
  booking_id: number | null;
  session_id: number | null;
  rfid_uid: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface BookingCreate {
  vehicle_id: number;
  slot_id: number;
  booking_date: string;
  scheduled_start_time: string;
}

export interface PaymentCreate {
  session_id: number;
  amount: number;
  payment_method: string;
  payment_status?: string;
  transaction_id?: string | null;
  paid_at?: string | null;
}

export interface VehicleCreate {
  plate_number: string;
  vehicle_type: string;
  brand: string;
  model: string;
  color: string;
}

export interface SlotStatus {
  slot_id: number;
  status: string;
}

export interface MqttMessage {
  topic: string;
  payload: Record<string, unknown>;
}