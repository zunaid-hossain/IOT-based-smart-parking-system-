import { motion } from "framer-motion";
import { Car, Wrench } from "lucide-react";
import type { ParkingSlot } from "@/types";
import { cn } from "@/lib/utils";

interface SlotGridProps {
  slots: ParkingSlot[];
  onSelect?: (slot: ParkingSlot) => void;
}

const statusConfig = {
  available: { label: "Available", dot: "bg-success", ring: "border-success/30 hover:border-success hover:shadow-success/20", icon: null },
  reserved: { label: "Reserved", dot: "bg-brand-blue", ring: "border-blue-500/30 hover:border-blue-500 hover:shadow-blue-500/20", icon: null },
  occupied: { label: "Occupied", dot: "bg-danger", ring: "border-danger/30 hover:border-danger hover:shadow-danger/20", icon: Car },
  maintenance: { label: "Maintenance", dot: "bg-muted-foreground", ring: "border-muted hover:border-muted-foreground", icon: Wrench },
};

export function SlotGrid({ slots, onSelect }: SlotGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {slots.map((slot, i) => {
        const config = statusConfig[slot.status];
        const Icon = config.icon;
        return (
          <motion.button
            key={slot.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => onSelect?.(slot)}
            disabled={slot.status !== "available" && !onSelect}
            className={cn(
              "group relative flex flex-col items-center justify-center rounded-2xl border bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg disabled:cursor-default",
              config.ring
            )}
          >
            <span className={cn("absolute right-3 top-3 h-2 w-2 rounded-full", config.dot)} />
            {Icon ? (
              <Icon size={24} className="mb-1 text-muted-foreground" />
            ) : (
              <div className="mb-1 flex h-6 w-6 items-center justify-center">
                <div className={cn("h-3 w-3 rounded-sm", slot.status === "available" ? "bg-success" : "bg-brand-blue")} />
              </div>
            )}
            <span className="text-sm font-semibold">
              {String.fromCharCode(64 + slot.floor)}-{String(slot.slot_number).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground">{config.label}</span>
            <span className="mt-1 font-mono text-[9px] text-muted-foreground/70">{slot.rfid_uid}</span>
          </motion.button>
        );
      })}
    </div>
  );
}