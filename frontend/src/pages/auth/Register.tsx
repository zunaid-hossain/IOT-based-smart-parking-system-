import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Car, Check, ChevronLeft, ChevronRight, Mail, ParkingSquare, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const step1Schema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const step2Schema = z.object({
  plate_number: z.string().min(3, "Vehicle number is required"),
  vehicle_type: z.string().min(1, "Vehicle type is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  color: z.string().min(1, "Color is required"),
});

type Step1Form = z.infer<typeof step1Schema>;
type Step2Form = z.infer<typeof step2Schema>;

const steps = ["Account", "Vehicle", "Confirm"];

export function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState<Step1Form | null>(null);
  const [vehicleData, setVehicleData] = useState<Step2Form | null>(null);

  const step1 = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: { full_name: "", email: "", phone: "", password: "" },
  });

  const step2 = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: { plate_number: "", vehicle_type: "Sedan", brand: "", model: "", color: "" },
  });

  const onStep1Submit = (data: Step1Form) => {
    setAccountData(data);
    setStep(1);
  };

  const onStep2Submit = (data: Step2Form) => {
    setVehicleData(data);
    setStep(2);
  };

  const onConfirm = async () => {
    if (!accountData) return;
    setLoading(true);
    try {
      await registerUser(accountData);
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand-cyan/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow">
            <ParkingSquare size={28} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create your <span className="text-primary">ParkFlow</span> account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join the smart parking revolution
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  i < step
                    ? "bg-success text-white"
                    : i === step
                      ? "bg-primary text-white shadow-glow"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={`hidden text-xs font-medium sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
              {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-card/80 p-6 shadow-soft-lg backdrop-blur-xl sm:p-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={step1.handleSubmit(onStep1Submit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full name</Label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="full_name" placeholder="Zunaid Ahmed" className="pl-9" {...step1.register("full_name")} />
                  </div>
                  {step1.formState.errors.full_name && (
                    <p className="text-xs text-danger">{step1.formState.errors.full_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="you@example.com" className="pl-9" {...step1.register("email")} />
                  </div>
                  {step1.formState.errors.email && (
                    <p className="text-xs text-danger">{step1.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="phone" placeholder="+880 1712 345678" className="pl-9" {...step1.register("phone")} />
                  </div>
                  {step1.formState.errors.phone && (
                    <p className="text-xs text-danger">{step1.formState.errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" {...step1.register("password")} />
                  {step1.formState.errors.password && (
                    <p className="text-xs text-danger">{step1.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Continue <ChevronRight size={16} />
                </Button>
              </motion.form>
            )}

            {step === 1 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={step2.handleSubmit(onStep2Submit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="plate_number">Vehicle number</Label>
                  <div className="relative">
                    <Car size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input id="plate_number" placeholder="DHAKA METRO GA-11-9821" className="pl-9" {...step2.register("plate_number")} />
                  </div>
                  {step2.formState.errors.plate_number && (
                    <p className="text-xs text-danger">{step2.formState.errors.plate_number.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_type">Type</Label>
                    <select
                      id="vehicle_type"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      {...step2.register("vehicle_type")}
                    >
                      <option>Sedan</option>
                      <option>SUV</option>
                      <option>Motorcycle</option>
                      <option>Hatchback</option>
                      <option>Truck</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input id="color" placeholder="Pearl white" {...step2.register("color")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input id="brand" placeholder="Toyota" {...step2.register("brand")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input id="model" placeholder="Corolla" {...step2.register("model")} />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Continue <ChevronRight size={16} />
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="rounded-xl bg-accent/50 p-4">
                  <h3 className="mb-3 text-sm font-semibold">Account details</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Name:</span> {accountData?.full_name}</p>
                    <p><span className="text-muted-foreground">Email:</span> {accountData?.email}</p>
                    <p><span className="text-muted-foreground">Phone:</span> {accountData?.phone}</p>
                  </div>
                </div>

                <div className="rounded-xl bg-accent/50 p-4">
                  <h3 className="mb-3 text-sm font-semibold">Vehicle details</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Number:</span> {vehicleData?.plate_number}</p>
                    <p><span className="text-muted-foreground">Type:</span> {vehicleData?.vehicle_type}</p>
                    <p><span className="text-muted-foreground">Brand:</span> {vehicleData?.brand} {vehicleData?.model}</p>
                    <p><span className="text-muted-foreground">Color:</span> {vehicleData?.color}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button onClick={onConfirm} disabled={loading} className="flex-1">
                    {loading ? "Creating account..." : "Create account"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}