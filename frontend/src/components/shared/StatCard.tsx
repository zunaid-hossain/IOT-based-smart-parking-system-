import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "blue" | "cyan" | "green" | "orange" | "red" | "purple";
  detail?: string;
  delay?: number;
}

const toneStyles = {
  blue: "bg-primary/10 text-primary",
  cyan: "bg-brand-cyan/10 text-brand-cyan",
  green: "bg-success/10 text-success",
  orange: "bg-warning/10 text-warning",
  red: "bg-danger/10 text-danger",
  purple: "bg-purple-500/10 text-purple-500",
};

export function StatCard({ label, value, icon: Icon, tone, detail, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="p-5 transition-all hover:-translate-y-0.5 hover:shadow-soft-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{value}</h2>
            {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", toneStyles[tone])}>
            <Icon size={20} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}