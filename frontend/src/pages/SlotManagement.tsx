import { motion } from "framer-motion";
import { Car, ParkingSquare, Plus, Wrench } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSlots } from "@/hooks/useParkingData";
import type { ParkingSlot } from "@/types";

const statusConfig = {
  available: { label: "Available", dot: "bg-success", ring: "border-success/30", text: "text-success", bg: "bg-success/10" },
  reserved: { label: "Reserved", dot: "bg-brand-blue", ring: "border-blue-500/30", text: "text-brand-blue", bg: "bg-blue-500/10" },
  occupied: { label: "Occupied", dot: "bg-danger", ring: "border-danger/30", text: "text-danger", bg: "bg-danger/10" },
  maintenance: { label: "Maintenance", dot: "bg-muted-foreground", ring: "border-muted", text: "text-muted-foreground", bg: "bg-muted/30" },
};

export function SlotManagement() {
  const { data: slots, isLoading } = useSlots();

  const counts = {
    available: slots?.filter((s) => s.status === "available").length ?? 0,
    reserved: slots?.filter((s) => s.status === "reserved").length ?? 0,
    occupied: slots?.filter((s) => s.status === "occupied").length ?? 0,
    maintenance: slots?.filter((s) => s.status === "maintenance").length ?? 0,
  };

  return (
    <>
      <PageHeader
        eyebrow="Parking infrastructure"
        title="Slot management"
        description="Manage parking slots across all floors"
        action={
          <Button>
            <Plus size={16} /> Add slot
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(Object.entries(counts) as [keyof typeof counts, number][]).map(([key, value], i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${statusConfig[key].bg} ${statusConfig[key].text}`}>
                {key === "occupied" ? <Car size={20} /> : key === "maintenance" ? <Wrench size={20} /> : <ParkingSquare size={20} />}
              </div>
              <div>
                <p className="text-sm capitalize text-muted-foreground">{key}</p>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h3 className="font-semibold">All slots</h3>
          <p className="text-sm text-muted-foreground">Each slot has a permanently-installed RFID card</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {slots?.map((slot: ParkingSlot, i) => {
              const config = statusConfig[slot.status];
              return (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex flex-col items-center rounded-2xl border bg-card p-4 ${config.ring}`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                    <Badge variant="outline" className="text-[10px]">Floor {slot.floor}</Badge>
                  </div>
                  <span className="mt-2 text-sm font-semibold">
                    {String.fromCharCode(64 + slot.floor)}-{String(slot.slot_number).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{slot.rfid_uid}</span>
                  <span className={`mt-1 text-xs capitalize ${config.text}`}>{slot.status}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}