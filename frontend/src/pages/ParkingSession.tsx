import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, Clock3, CreditCard, DoorOpen, MapPin, Radio, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveSession, useVehicles, useSlots } from "@/hooks/useParkingData";
import { formatCurrency, formatDateTime, calculateAmount } from "@/lib/utils";

function useTimer(entryTime: string | null) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!entryTime) return;
    const start = new Date(entryTime).getTime();
    const update = () => setSeconds(Math.floor((Date.now() - start) / 1000));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [entryTime]);

  return seconds;
}

export function ParkingSession() {
  const session = useActiveSession();
  const { data: vehicles } = useVehicles();
  const { data: slots } = useSlots();
  const navigate = useNavigate();

  const seconds = useTimer(session?.entry_time ?? null);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const clock = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const vehicle = vehicles?.find((v) => v.id === session?.vehicle_id);
  const slot = slots?.find((s) => s.id === session?.slot_id);

  if (!session) {
    return (
      <>
        <PageHeader eyebrow="Live tracking" title="Current parking session" />
        <Card className="flex flex-col items-center justify-center gap-4 p-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Car size={40} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No active session</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You don't have an active parking session right now
            </p>
          </div>
          <Button onClick={() => navigate("/book")}>Book a parking spot</Button>
        </Card>
      </>
    );
  }

  const currentAmount = seconds > 0 ? calculateAmount(Math.ceil(seconds / 60)) : 0;

  return (
    <>
      <PageHeader eyebrow="Live tracking" title={`Current parking session`} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-8 lg:col-span-2">
          <div className="flex items-center justify-between">
            <Badge variant="success" className="gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              {session.session_status === "active" ? "Active session" : "Payment pending"}
            </Badge>
            <Badge variant={session.slot_verified ? "success" : "warning"}>
              <ShieldCheck size={12} /> {session.slot_verified ? "Slot verified" : "Awaiting IR sensor"}
            </Badge>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">Parked in</p>
            <h2 className="mt-1 text-4xl font-bold">
              {slot ? `${String.fromCharCode(64 + slot.floor)}-${String(slot.slot_number).padStart(2, "0")}` : `Slot ${session.slot_id}`}
            </h2>
          </div>

          <motion.div
            key={clock}
            initial={{ scale: 0.98, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="my-8 rounded-2xl bg-gradient-to-br from-primary to-brand-cyan p-8 text-center text-white shadow-glow"
          >
            <div className="font-mono text-5xl font-bold tracking-tight">{clock}</div>
            <p className="mt-2 text-sm text-white/80">Live parking timer · updates every second</p>
          </motion.div>

          <div className="flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/50">
              <Car size={48} className="text-primary" />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-accent/50 p-4">
              <p className="text-xs text-muted-foreground">Entry time</p>
              <p className="mt-1 font-medium">{formatDateTime(session.entry_time)}</p>
            </div>
            <div className="rounded-xl bg-accent/50 p-4">
              <p className="text-xs text-muted-foreground">Vehicle</p>
              <p className="mt-1 font-medium">{vehicle?.plate_number ?? `Vehicle #${session.vehicle_id}`}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold">Current bill</h3>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold">
                  {formatCurrency(session.amount ?? currentAmount)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Minimum 30 min · {formatCurrency(20)}/hour
                </p>
              </div>
              <Badge variant={session.session_status === "payment_pending" ? "warning" : "info"}>
                {session.session_status}
              </Badge>
            </div>

            <div className="mt-6 space-y-3 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">
                  {session.duration_minutes ? `${session.duration_minutes} min` : `${hours}h ${minutes}m`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Hourly rate</span>
                <span className="font-medium">{formatCurrency(20)}/hr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment status</span>
                <Badge variant={session.session_status === "payment_pending" ? "warning" : "info"}>
                  {session.session_status === "payment_pending" ? "Due now" : "Pending"}
                </Badge>
              </div>
            </div>

            <Button
              className="mt-6 w-full"
              size="lg"
              disabled={session.session_status !== "payment_pending"}
              onClick={() => navigate("/payments")}
            >
              <CreditCard size={16} />
              {session.session_status === "payment_pending" ? "Pay parking fee" : "Active session"}
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold">System status</h3>
            <div className="mt-4 space-y-3">
              <SystemRow icon={<Radio size={14} />} label="IR Sensor" status={session.slot_verified ? "Verified" : "Pending"} ok={session.slot_verified} />
              <SystemRow icon={<DoorOpen size={14} />} label="Gate" status={session.session_status === "active" ? "Open" : "Pending exit"} ok={session.session_status === "active"} />
              <SystemRow icon={<Car size={14} />} label="RFID" status="Installed" ok />
              <SystemRow icon={<Clock3 size={14} />} label="Session" status={session.session_status} ok={session.session_status === "active"} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function SystemRow({
  icon,
  label,
  status,
  ok,
}: {
  icon: React.ReactNode;
  label: string;
  status: string;
  ok: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className={`flex items-center gap-1.5 text-sm font-medium ${ok ? "text-success" : "text-warning"}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${ok ? "bg-success" : "bg-warning"}`} />
        {status}
      </span>
    </div>
  );
}