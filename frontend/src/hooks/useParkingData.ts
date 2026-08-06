import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  Booking,
  BookingCreate,
  BookingPayment,
  GateLog,
  ParkingSession,
  ParkingSlot,
  Payment,
  PaymentCreate,
  Vehicle,
  VehicleCreate,
} from "@/types";

// --- Parking Slots ---
export function useSlots() {
  return useQuery({
    queryKey: ["slots"],
    queryFn: async () => {
      const { data } = await api.get<ParkingSlot[]>("/parking-slots");
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useSlot(slotId: number) {
  return useQuery({
    queryKey: ["slots", slotId],
    queryFn: async () => {
      const { data } = await api.get<ParkingSlot>(`/parking-slots/${slotId}`);
      return data;
    },
  });
}

// --- Vehicles ---
export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await api.get<Vehicle[]>("/vehicles");
      return data;
    },
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicle: VehicleCreate) => {
      const { data } = await api.post<Vehicle>("/vehicles", vehicle);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vehicleId: number) => {
      await api.delete(`/vehicles/${vehicleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    },
  });
}

// --- Bookings ---
export function useBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data } = await api.get<Booking[]>("/bookings/my");
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (booking: BookingCreate) => {
      const { data } = await api.post<Booking>("/bookings", booking);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: number) => {
      const { data } = await api.put<Booking>(`/bookings/${bookingId}`, {
        booking_status: "cancelled",
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

export function useOpenGate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: number) => {
      const { data } = await api.post<ParkingSession>(`/bookings/${bookingId}/open-gate`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

// --- Booking Payments ---
export function useBookingPayment(bookingId: number) {
  return useQuery({
    queryKey: ["booking-payment", bookingId],
    queryFn: async () => {
      const { data } = await api.get<BookingPayment>(`/bookings/${bookingId}/booking-payment`);
      return data;
    },
    enabled: !!bookingId,
  });
}

export function useConfirmBookingPayment(bookingId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.put<BookingPayment>(`/bookings/${bookingId}/booking-payment`, {
        payment_status: "successful",
        paid_at: new Date().toISOString(),
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-payment", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

// --- Parking Sessions ---
export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const { data } = await api.get<ParkingSession[]>("/parking-sessions/my");
      return data;
    },
    refetchInterval: 30_000,
  });
}

export function useActiveSession() {
  const { data: sessions } = useSessions();
  return sessions?.find(
    (s) => s.session_status === "active" || s.session_status === "payment_pending"
  );
}

// --- Payments ---
export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data } = await api.get<Payment[]>("/payments");
      return data;
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payment: PaymentCreate) => {
      const { data } = await api.post<Payment>("/payments", payment);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

// --- Gate Logs ---
export function useGateLogs() {
  return useQuery({
    queryKey: ["gate-logs"],
    queryFn: async () => {
      const { data } = await api.get<GateLog[]>("/gate-logs");
      return data;
    },
  });
}