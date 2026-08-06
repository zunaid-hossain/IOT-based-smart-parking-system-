import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Car,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  DoorOpen,
  MapPin,
  ParkingSquare,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { SlotGrid } from "@/components/shared/SlotGrid";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import {
  useSlots,
  useActiveSession,
  useBookings,
  useOpenGate,
  useVehicles,
} from "@/hooks/useParkingData";
import { formatCurrency, formatDateTime } from "@/lib/utils";

// Mock chart data (will be replaced with real API data)
const chartData = [
  { m: "Jan", v: 28 },
  { m: "Feb", v: 36 },
  { m: "Mar", v: 31 },
  { m: "Apr", v: 54 },
  { m: "May", v: 43 },
  { m: "Jun", v: 68 },
  { m: "Jul", v: 62 },
];

export function Dashboard() {
  const { user } = useAuth();
  const { data: slots, isLoading: slotsLoading } = useSlots();
  const activeSession = useActiveSession();
  const { data: bookings } = useBookings();
  const { data: vehicles } = useVehicles();
  const openGate = useOpenGate();

  const activeBooking = bookings?.find(
    (b) => b.booking_status === "reserved" || b.booking_status === "confirmed"
  );

  const availableCount = slots?.filter((s) => s.status === "available").length ?? 0;
  const occupiedCount = slots?.filter((s) => s.status === "occupied").length ?? 0;

  const firstName = user?.full_name?.split(" ")[0] || "there";

  const handleOpenGate = async () => {
    if (!activeBooking) {
      toast.error("No active booking found");
      return;
    }
    try {
      await openGate.mutateAsync(activeBooking.id);
      toast.success("Entry gate open! Please enter.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open gate");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={new Date().toLocaleDateString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        title={`Good ${new Date().getHours() < 12 ? "morning" : "evening"}, ${firstName}`}
        action={
          <Button asChild>
            <Link to="/book">
              Book a parking spot <ChevronRight size={16} />
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Available slots"
          value={slotsLoading ? "..." : String(availableCount)}
          icon={MapPin}
          tone="blue"
          detail="Across 2 floors"
          delay={0}
        />
        <StatCard
          label="Current booking"
          value={activeBooking ? `A-${String(activeBooking.slot_id).padStart(2, "0")}` : "None"}
          icon={ParkingSquare}
          tone="cyan"
          detail={activeBooking ? formatDateTime(activeBooking.created_at) : "No active booking"}
          delay={0.05}
        />
        <StatCard
          label="Monthly spending"
          value="৳ 1,240"
          icon={CircleDollarSign}
          tone="green"
          detail="↓ 12% vs last month"
          delay={0.1}
        />
        <StatCard
          label="Parking time"
          value={activeSession ? `${Math.floor((Date.now() - new Date(activeSession.entry_time).getTime()) / 60000)}m` : "0h"}
          icon={Clock3}
          tone="orange"
          detail={activeSession ? "This session" : "This month"}
          delay={0.15}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Parking activity chart */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Parking activity</h3>
              <p className="text-sm text-muted-foreground">Your time parked this year</p>
            </div>
            <Badge variant="secondary">This year</Badge>
          </div>
          <div className="h-[245px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="1" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    background: "hsl(var(--card))",
                  }}
                />
                <Area type="monotone" dataKey="v" stroke="#2563EB" strokeWidth={3} fill="url(#fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Live parking status */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Live parking status</h3>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                Connected to parking system
              </p>
            </div>
            <Button variant="outline" size="icon" aria-label="Door">
              <DoorOpen size={18} />
            </Button>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-dashed bg-accent/30 py-10">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Car size={32} className="text-primary" />
              </div>
              <p className="text-sm font-medium">
                {activeSession ? "Currently parked" : "Not parked"}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {activeSession ? (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Slot</span>
                  <span className="font-medium">A-{String(activeSession.slot_id).padStart(2, "0")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Entry time</span>
                  <span className="font-medium">{formatDateTime(activeSession.entry_time)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={activeSession.slot_verified ? "success" : "warning"}>
                    {activeSession.slot_verified ? "Verified" : "Awaiting sensor"}
                  </Badge>
                </div>
              </>
            ) : (
              <Button className="w-full" onClick={handleOpenGate} disabled={openGate.isPending}>
                {openGate.isPending ? "Opening gate..." : "Open gate"}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Parking spaces */}
      <div className="mt-8 mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Parking spaces</h2>
          <p className="text-sm text-muted-foreground">
            Real-time occupancy · {occupiedCount} occupied · {availableCount} available
          </p>
        </div>
        <Link to="/book" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View parking map <ChevronRight size={16} />
        </Link>
      </div>

      {slotsLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        slots && <SlotGrid slots={slots} />
      )}
    </>
  );
}