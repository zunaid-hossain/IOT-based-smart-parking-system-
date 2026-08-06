import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Car, Clock3, ChevronRight, MapPin, ParkingSquare } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { SlotGrid } from "@/components/shared/SlotGrid";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSlots,
  useVehicles,
  useCreateBooking,
  useConfirmBookingPayment,
  useBookingPayment,
} from "@/hooks/useParkingData";
import { formatCurrency } from "@/lib/utils";
import type { ParkingSlot } from "@/types";

const bookingSchema = z.object({
  vehicle_id: z.coerce.number().min(1, "Select a vehicle"),
  booking_date: z.string().min(1, "Select a date"),
  scheduled_start_time: z.string().min(1, "Select a time"),
});

type BookingForm = z.infer<typeof bookingSchema>;

const statusLegend = [
  { status: "available" as const, color: "bg-success" },
  { status: "reserved" as const, color: "bg-brand-blue" },
  { status: "occupied" as const, color: "bg-danger" },
  { status: "maintenance" as const, color: "bg-muted-foreground" },
];

export function Booking() {
  const { data: slots, isLoading } = useSlots();
  const { data: vehicles } = useVehicles();
  const createBooking = useCreateBooking();
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState<number | null>(null);
  const [floor, setFloor] = useState(1);

  const confirmPayment = useConfirmBookingPayment(currentBookingId ?? 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vehicle_id: 0,
      booking_date: new Date().toISOString().split("T")[0],
      scheduled_start_time: "10:00",
    },
  });

  const filteredSlots = useMemo(
    () => slots?.filter((s) => s.floor === floor) ?? [],
    [slots, floor]
  );

  const onSelectSlot = (slot: ParkingSlot) => {
    if (slot.status !== "available") {
      toast.error(`${slot.rfid_uid} is ${slot.status}`);
      return;
    }
    setSelectedSlot(slot);
    setCurrentBookingId(null);
    reset({
      vehicle_id: vehicles?.[0]?.id ?? 0,
      booking_date: new Date().toISOString().split("T")[0],
      scheduled_start_time: "10:00",
    });
  };

  const onSubmit = async (data: BookingForm) => {
    if (!selectedSlot) return;
    try {
      const booking = await createBooking.mutateAsync({
        vehicle_id: data.vehicle_id,
        slot_id: selectedSlot.id,
        booking_date: data.booking_date,
        scheduled_start_time: data.scheduled_start_time,
      });
      setCurrentBookingId(booking.id);
      toast.success("Booking created! Please confirm the reservation fee.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create booking");
    }
  };

  const handleConfirmPayment = async () => {
    if (!currentBookingId) return;
    try {
      await confirmPayment.mutateAsync();
      toast.success("Reservation confirmed! Slot reserved.");
      setSelectedSlot(null);
      setCurrentBookingId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Reserve your space"
        title="Parking map"
        description="Select an available slot to reserve"
        action={
          <div className="flex gap-1 rounded-xl border bg-card p-1">
            {[1, 2].map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFloor(f);
                  setSelectedSlot(null);
                }}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  floor === f ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
                }`}
              >
                Floor {f}
              </button>
            ))}
          </div>
        }
      />

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-4">
          <h3 className="font-semibold">Floor {floor}</h3>
          <div className="ml-auto flex flex-wrap gap-3">
            {statusLegend.map(({ status, color }) => (
              <span key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${color}`} />
                {status}
              </span>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <SlotGrid slots={filteredSlots} onSelect={onSelectSlot} />
        )}
      </Card>

      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mt-6"
          >
            <Card className="p-6">
              {!currentBookingId ? (
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected space</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ParkingSquare size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">
                          {String.fromCharCode(64 + selectedSlot.floor)}-
                          {String(selectedSlot.slot_number).padStart(2, "0")}
                        </h2>
                        <p className="font-mono text-xs text-muted-foreground">{selectedSlot.rfid_uid}</p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-xl bg-accent/50 p-4 text-sm">
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Reservation fee</span>
                        <span className="font-medium">{formatCurrency(100)}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Hourly rate (after entry)</span>
                        <span className="font-medium">{formatCurrency(20)}</span>
                      </div>
                      <div className="mt-2 border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total due now</span>
                          <span>{formatCurrency(100)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="vehicle_id">Vehicle</Label>
                      <div className="relative">
                        <Car size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <select
                          id="vehicle_id"
                          className="flex h-9 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          {...register("vehicle_id")}
                        >
                          <option value={0}>Select a vehicle</option>
                          {vehicles?.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.plate_number} · {v.brand} {v.model}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.vehicle_id && (
                        <p className="text-xs text-danger">{errors.vehicle_id.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="booking_date">Date</Label>
                      <div className="relative">
                        <CalendarDays size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="booking_date"
                          type="date"
                          className="pl-9"
                          {...register("booking_date")}
                        />
                      </div>
                      {errors.booking_date && (
                        <p className="text-xs text-danger">{errors.booking_date.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scheduled_start_time">Arrival time</Label>
                      <div className="relative">
                        <Clock3 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="scheduled_start_time"
                          type="time"
                          className="pl-9"
                          {...register("scheduled_start_time")}
                        />
                      </div>
                      {errors.scheduled_start_time && (
                        <p className="text-xs text-danger">{errors.scheduled_start_time.message}</p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={createBooking.isPending}
                      >
                        {createBooking.isPending ? "Creating booking..." : (
                          <>
                            Continue to payment <ChevronRight size={16} />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
                  >
                    <ParkingSquare size={32} />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold">Confirm reservation</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pay the {formatCurrency(100)} reservation protection fee to secure your slot
                    </p>
                  </div>
                  <Button size="lg" onClick={handleConfirmPayment} disabled={confirmPayment.isPending}>
                    {confirmPayment.isPending ? "Processing..." : `Pay ${formatCurrency(100)} now`}
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}