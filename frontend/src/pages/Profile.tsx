import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, KeyRound, Moon, ShieldCheck, Sun, UserRound, Bell } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { getInitials } from "@/lib/utils";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone"),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current_password: z.string().min(6, "Enter your current password"),
    new_password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Confirm your password"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export function Profile() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const profile = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    },
  });

  const password = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const onProfileSubmit = (data: ProfileForm) => {
    toast.success("Profile updated successfully");
  };

  const onPasswordSubmit = (data: PasswordForm) => {
    toast.success("Password changed successfully");
    password.reset();
  };

  return (
    <>
      <PageHeader eyebrow="Account preferences" title="Profile" description="Manage your personal information" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User card */}
        <Card className="flex flex-col items-center p-8 text-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-semibold text-primary">
              {user ? getInitials(user.full_name) : <UserRound size={40} />}
            </div>
            <button
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-4 border-card bg-primary text-white shadow transition-transform hover:scale-110"
              aria-label="Upload avatar"
            >
              <Camera size={14} />
            </button>
          </div>
          <h2 className="mt-4 text-lg font-semibold">{user?.full_name}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <Badge variant="info" className="mt-2">{user?.role ?? "user"}</Badge>

          <div className="mt-6 w-full space-y-2 border-t pt-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{user?.phone ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium">2026</span>
            </div>
          </div>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          {/* Personal information */}
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Personal information</h3>
            <form onSubmit={profile.handleSubmit(onProfileSubmit)} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" {...profile.register("full_name")} />
                {profile.formState.errors.full_name && (
                  <p className="text-xs text-danger">{profile.formState.errors.full_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...profile.register("email")} />
                {profile.formState.errors.email && (
                  <p className="text-xs text-danger">{profile.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...profile.register("phone")} />
                {profile.formState.errors.phone && (
                  <p className="text-xs text-danger">{profile.formState.errors.phone.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </Card>

          {/* Password */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <KeyRound size={16} /> Change password
            </h3>
            <form onSubmit={password.handleSubmit(onPasswordSubmit)} className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current password</Label>
                <Input id="current_password" type="password" {...password.register("current_password")} />
                {password.formState.errors.current_password && (
                  <p className="text-xs text-danger">{password.formState.errors.current_password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password">New password</Label>
                <Input id="new_password" type="password" {...password.register("new_password")} />
                {password.formState.errors.new_password && (
                  <p className="text-xs text-danger">{password.formState.errors.new_password.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm password</Label>
                <Input id="confirm_password" type="password" {...password.register("confirm_password")} />
                {password.formState.errors.confirm_password && (
                  <p className="text-xs text-danger">{password.formState.errors.confirm_password.message}</p>
                )}
              </div>
              <div className="sm:col-span-3">
                <Button type="submit" variant="secondary">Update password</Button>
              </div>
            </form>
          </Card>

          {/* Theme */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />} Theme
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                  theme === "light" ? "border-primary bg-primary/5 text-primary" : "border-input"
                }`}
              >
                <Sun size={16} /> Light
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all ${
                  theme === "dark" ? "border-primary bg-primary/5 text-primary" : "border-input"
                }`}
              >
                <Moon size={16} /> Dark
              </button>
            </div>
          </Card>

          {/* Notification preferences */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Bell size={16} /> Notifications
            </h3>
            <div className="space-y-3">
              {[
                "Booking status updates",
                "Payment confirmations",
                "Gate open alerts",
                "Session expiry warnings",
              ].map((item) => (
                <label key={item} className="flex items-center justify-between">
                  <span className="text-sm">{item}</span>
                  <input type="checkbox" defaultChecked className="rounded border-input" />
                </label>
              ))}
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <ShieldCheck size={16} /> Security
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Two-factor authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
              <input type="checkbox" className="rounded border-input" />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}