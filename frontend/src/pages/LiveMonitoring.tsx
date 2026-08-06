import { motion } from "framer-motion";
import { Car, DoorOpen, MapPin, Radio, ShieldCheck, Wifi, Wrench } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSlots, useGateLogs } from "@/hooks/useParkingData";
import { formatDateTime } from "@/lib/utils";

const systemComponents = [
  { label: "MQTT Broker", icon: Radio, ok: true, detail: "Connected" },
  { label: "Entry Gate", icon: DoorOpen, ok: true, detail: "Operational" },
  { label: "Exit Gate", icon: DoorOpen, ok: true, detail: "Operational" },
  { label: "RFID Readers", icon: MapPin, ok: true, detail: "8 / 8 online" },
  { label: "IR Sensors", icon: ShieldCheck, ok: true, detail: "7 / 8 online" },
  { label: "ESP32 Controllers", icon: Wifi, ok: true, detail: "8 / 8 online" },
];

export function LiveMonitoring() {
  const { data: slots, isLoading } = useSlots();
  const { data: gateLogs } = useGateLogs();

  return (
    <>
      <PageHeader
        eyebrow="IoT monitoring"
        title="Live monitoring"
        description="Real-time status of all parking system hardware"
      />

      {/* System health grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {systemComponents.map(({ label, icon: Icon, ok, detail }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="flex items-center gap-4 p-5">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${ok ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                <Icon size={22} />
              </div>
              <div className="flex-1">
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </div>
              <span className={`flex items-center gap-1.5 text-xs font-medium ${ok ? "text-success" : "text-warning"}`}>
                <span className={`h-2 w-2 rounded-full ${ok ? "bg-success" : "bg-warning"}`} />
                {ok ? "Online" : "Attention"}
              </span>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Live slot status */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Parking slot status</h3>
              <p className="text-sm text-muted-foreground">Live updates via MQTT</p>
            </div>
            <Badge variant="success" className="gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Live
            </Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {slots?.map((slot) => (
                <div
                  key={slot.id}
                  className={`flex flex-col items-center rounded-2xl border p-3 text-center ${
                    slot.status === "available"
                      ? "border-success/30 bg-success/5"
                      : slot.status === "reserved"
                        ? "border-brand-blue/30 bg-blue-500/5"
                        : slot.status === "occupied"
                          ? "border-danger/30 bg-danger/5"
                          : "border-muted bg-muted/30"
                  }`}
                >
                  <span className="text-sm font-semibold">
                    {String.fromCharCode(64 + slot.floor)}-{String(slot.slot_number).padStart(2, "0")}
                  </span>
                  <span
                    className={`mt-1 h-2 w-2 rounded-full ${
                      slot.status === "available"
                        ? "bg-success"
                        : slot.status === "reserved"
                          ? "bg-brand-blue"
                          : slot.status === "occupied"
                            ? "bg-danger"
                            : "bg-muted-foreground"
                    }`}
                  />
                  <span className="mt-1 text-[10px] capitalize text-muted-foreground">{slot.status}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Gate logs */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold">Gate activity</h3>
            <p className="text-sm text-muted-foreground">Recent gate events</p>
          </div>

          {!gateLogs || gateLogs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <DoorOpen size={32} className="text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No gate events yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {gateLogs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 rounded-xl border bg-card/50 p-3"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      log.action === "FAILED"
                        ? "bg-danger/10 text-danger"
                        : log.action === "OPENED"
                          ? "bg-success/10 text-success"
                          : log.action === "VERIFIED"
                            ? "bg-brand-blue/10 text-brand-blue"
                            : "bg-warning/10 text-warning"
                    }`}
                  >
                    {log.gate_type === "ENTRY" ? <DoorOpen size={16} /> : <Car size={16} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {log.gate_type} · {log.action}
                      {log.rfid_uid && (
                        <span className="ml-1 font-mono text-xs text-muted-foreground">{log.rfid_uid}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.user_id ? `User #${log.user_id} · ` : ""}
                      {formatDateTime(log.created_at)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      log.action === "FAILED"
                        ? "danger"
                        : log.action === "OPENED"
                          ? "success"
                          : log.action === "VERIFIED"
                            ? "info"
                            : "warning"
                    }
                  >
                    {log.action}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}