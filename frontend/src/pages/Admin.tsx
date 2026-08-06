import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Bell,
  Car,
  CircleDollarSign,
  Clock3,
  DoorOpen,
  MapPin,
  ParkingSquare,
  Radio,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { SlotGrid } from "@/components/shared/SlotGrid";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSlots } from "@/hooks/useParkingData";
import { formatCurrency } from "@/lib/utils";

const revenueData = [
  { m: "Jan", v: 1240 },
  { m: "Feb", v: 1880 },
  { m: "Mar", v: 1520 },
  { m: "Apr", v: 2400 },
  { m: "May", v: 2100 },
  { m: "Jun", v: 3100 },
  { m: "Jul", v: 2860 },
];

const bookingTrend = [
  { m: "Mon", v: 12 },
  { m: "Tue", v: 18 },
  { m: "Wed", v: 15 },
  { m: "Thu", v: 22 },
  { m: "Fri", v: 28 },
  { m: "Sat", v: 35 },
  { m: "Sun", v: 30 },
];

const occupancyData = [
  { name: "Available", value: 8, color: "#22C55E" },
  { name: "Reserved", value: 2, color: "#2563EB" },
  { name: "Occupied", value: 2, color: "#EF4444" },
];

export function Admin() {
  const { data: slots, isLoading } = useSlots();

  const available = slots?.filter((s) => s.status === "available").length ?? 0;
  const reserved = slots?.filter((s) => s.status === "reserved").length ?? 0;
  const occupied = slots?.filter((s) => s.status === "occupied").length ?? 0;
  const maintenance = slots?.filter((s) => s.status === "maintenance").length ?? 0;

  return (
    <>
      <PageHeader
        eyebrow="Operations control"
        title="Admin analytics"
        description="Monitor parking operations and revenue"
        action={
          <Button>
            <Bell size={16} /> Send announcement
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value="1,284" icon={Users} tone="blue" detail="+14 this week" delay={0} />
        <StatCard label="Active sessions" value={String(occupied)} icon={Car} tone="cyan" detail="Live now" delay={0.05} />
        <StatCard label="Occupancy rate" value={`${Math.round(((occupied + reserved) / (slots?.length || 1)) * 100)}%`} icon={ParkingSquare} tone="orange" detail="Peak at 6:00 PM" delay={0.1} />
        <StatCard label="Revenue" value={formatCurrency(2860)} icon={CircleDollarSign} tone="green" detail="This month" delay={0.15} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Revenue overview */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Revenue overview</h3>
              <p className="text-sm text-muted-foreground">Daily parking revenue this year</p>
            </div>
            <Badge variant="secondary">This year</Badge>
          </div>
          <div className="h-[245px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop stopColor="#06B6D4" stopOpacity={0.35} />
                    <stop offset="1" stopColor="#06B6D4" stopOpacity={0} />
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
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="v" stroke="#06B6D4" strokeWidth={3} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Occupancy */}
        <Card className="p-6">
          <h3 className="font-semibold">Slot occupancy</h3>
          <div className="h-[245px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={occupancyData} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {occupancyData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    background: "hsl(var(--card))",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Booking trend */}
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-semibold">Booking trend</h3>
            <p className="text-sm text-muted-foreground">Weekly booking volume</p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingTrend}>
                <XAxis dataKey="m" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    background: "hsl(var(--card))",
                  }}
                />
                <Bar dataKey="v" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* System health */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">System health</h3>
          <div className="space-y-3">
            <HealthRow icon={<Radio size={14} />} label="MQTT broker" status="Online" ok />
            <HealthRow icon={<DoorOpen size={14} />} label="ESP32 controllers" status="8 / 8 online" ok />
            <HealthRow icon={<MapPin size={14} />} label="RFID readers" status="8 / 8 online" ok />
            <HealthRow icon={<Wrench size={14} />} label="IR sensor A-04" status="Needs attention" ok={false} />
            <HealthRow icon={<Clock3 size={14} />} label="Scheduler" status="Running" ok />
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Slot status</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs"><span className="h-2 w-2 rounded-full bg-success" /> {available}</span>
                <span className="flex items-center gap-1 text-xs"><span className="h-2 w-2 rounded-full bg-brand-blue" /> {reserved}</span>
                <span className="flex items-center gap-1 text-xs"><span className="h-2 w-2 rounded-full bg-danger" /> {occupied}</span>
                <span className="flex items-center gap-1 text-xs"><span className="h-2 w-2 rounded-full bg-muted-foreground" /> {maintenance}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Live slots */}
      <div className="mt-8 mb-4">
        <h2 className="text-lg font-semibold">Live slot status</h2>
        <p className="text-sm text-muted-foreground">Real-time parking slot updates</p>
      </div>
      {isLoading ? (
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

function HealthRow({
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