import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Menu, Moon, Search, Sun, UserRound } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMenuClick: () => void;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: "success" | "info" | "warning" | "danger";
}

const mockNotifications: Notification[] = [
  { id: 1, title: "Booking confirmed", message: "Slot A-05 reserved for today 10:30 AM", time: "2m ago", type: "success" },
  { id: 2, title: "Payment successful", message: "৳100 booking fee paid via bKash", time: "1h ago", type: "success" },
  { id: 3, title: "Gate opened", message: "Entry gate opened for slot A-05", time: "3h ago", type: "info" },
  { id: 4, title: "Booking expired", message: "Slot B-03 booking expired due to no-show", time: "1d ago", type: "warning" },
];

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </Button>

      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search parking, payments, vehicles..."
          className="h-9 w-full rounded-xl border border-input bg-transparent pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Search"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger" />
          </Button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 z-50 w-80 rounded-2xl border bg-card p-2 shadow-soft-lg"
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  <Badge variant="info">{mockNotifications.length} new</Badge>
                </div>
                <div className="max-h-80 space-y-1 overflow-y-auto">
                  {mockNotifications.map((n) => (
                    <button
                      key={n.id}
                      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent"
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          n.type === "success"
                            ? "bg-success"
                            : n.type === "warning"
                              ? "bg-warning"
                              : n.type === "danger"
                                ? "bg-danger"
                                : "bg-brand-blue"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{n.message}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground/70">{n.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={() => navigate("/settings")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary transition-transform hover:scale-105"
          aria-label="Profile"
        >
          {user ? getInitials(user.full_name) : <UserRound size={18} />}
        </button>
      </div>
    </header>
  );
}