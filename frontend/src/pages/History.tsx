import { useState } from "react";
import { Download, FileSpreadsheet, History as HistoryIcon, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSessions,
  useSlots,
  useVehicles,
} from "@/hooks/useParkingData";
import { formatCurrency, formatDateTime, formatDuration } from "@/lib/utils";

const statusVariant = {
  completed: "success" as const,
  active: "info" as const,
  payment_pending: "warning" as const,
};

export function History() {
  const { data: sessions, isLoading } = useSessions();
  const { data: slots } = useSlots();
  const { data: vehicles } = useVehicles();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = sessions?.filter((s) => {
    const slot = slots?.find((x) => x.id === s.slot_id);
    const vehicle = vehicles?.find((v) => v.id === s.vehicle_id);
    const q = `${slot?.rfid_uid ?? ""} ${vehicle?.plate_number ?? ""}`.toLowerCase();

    const matchesSearch = q.includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.session_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <PageHeader
        eyebrow="Your parking history"
        title="Parking history"
        description="View all your past and current parking sessions"
        action={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download size={16} /> Export PDF
            </Button>
            <Button variant="outline">
              <FileSpreadsheet size={16} /> Export Excel
            </Button>
          </div>
        }
      />

      <Card className="p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by slot or vehicle..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 rounded-xl border bg-card p-1">
            {["all", "active", "completed", "payment_pending"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : filtered?.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center">
            <HistoryIcon size={32} className="text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No parking sessions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Vehicle</th>
                  <th className="pb-3 font-medium">Slot</th>
                  <th className="pb-3 font-medium">Entry</th>
                  <th className="pb-3 font-medium">Exit</th>
                  <th className="pb-3 font-medium">Duration</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((s) => {
                  const slot = slots?.find((x) => x.id === s.slot_id);
                  const vehicle = vehicles?.find((v) => v.id === s.vehicle_id);
                  return (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{vehicle?.plate_number ?? "-"}</td>
                      <td className="py-3">
                        {slot
                          ? `${String.fromCharCode(64 + slot.floor)}-${String(slot.slot_number).padStart(2, "0")}`
                          : `Slot ${s.slot_id}`}
                      </td>
                      <td className="py-3 text-muted-foreground">{formatDateTime(s.entry_time)}</td>
                      <td className="py-3 text-muted-foreground">
                        {s.exit_time ? formatDateTime(s.exit_time) : "—"}
                      </td>
                      <td className="py-3">
                        {s.duration_minutes ? formatDuration(s.duration_minutes) : "—"}
                      </td>
                      <td className="py-3 font-medium">{s.amount ? formatCurrency(s.amount) : "—"}</td>
                      <td className="py-3">
                        <Badge variant={statusVariant[s.session_status]}>
                          {s.session_status.replace("_", " ")}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}