import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ParkingSquare,
  Clock3,
  CreditCard,
  Car,
  History,
  MapPin,
  Radio,
  ShieldCheck,
  Settings,
  X,
  Zap,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/book", icon: ParkingSquare, label: "Book parking" },
  { to: "/session", icon: Clock3, label: "Live session" },
  { to: "/payments", icon: CreditCard, label: "Payments" },
  { to: "/history", icon: History, label: "Parking history" },
  { to: "/vehicles", icon: Car, label: "Vehicles" },
  { to: "/admin", icon: ShieldCheck, label: "Admin analytics" },
  { to: "/monitor", icon: Radio, label: "Live monitoring" },
  { to: "/slots", icon: MapPin, label: "Slot management" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

interface SidebarProps {
  mobile: boolean;
  onClose: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <motion.aside
      initial={false}
      animate={{ x: mobile ? 0 : 0 }}
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card/80 backdrop-blur-xl transition-transform lg:static lg:translate-x-0",
        mobile ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow">
          <ParkingSquare size={20} />
        </div>
        <span className="text-lg font-bold tracking-tight">
          Park<span className="text-primary">Flow</span>
        </span>
        <button className="ml-auto lg:hidden" onClick={onClose} aria-label="Close menu">
          <X size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 px-6 py-3">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
        </span>
        <span className="text-xs font-medium text-muted-foreground">Dhaka Central</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-accent/50 px-3 py-2.5 text-sm">
          <Zap size={16} className="text-warning" />
          <span className="text-muted-foreground">Need support?</span>
          <ChevronRight size={16} className="ml-auto text-muted-foreground" />
        </div>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {user ? getInitials(user.full_name) : "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.full_name || "User"}</p>
            <p className="truncate text-xs text-muted-foreground">Parking member</p>
          </div>
          <button
            onClick={logout}
            className="text-muted-foreground transition-colors hover:text-destructive"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}