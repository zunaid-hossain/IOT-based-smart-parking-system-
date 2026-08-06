import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Car, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useVehicles, useCreateVehicle, useDeleteVehicle } from "@/hooks/useParkingData";
import { getErrorMessage } from "@/lib/api";

const vehicleSchema = z.object({
  plate_number: z.string().min(3, "Vehicle number is required"),
  vehicle_type: z.string().min(1, "Type is required"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  color: z.string().min(1, "Color is required"),
});

type VehicleForm = z.infer<typeof vehicleSchema>;

export function Vehicles() {
  const { data: vehicles, isLoading } = useVehicles();
  const createVehicle = useCreateVehicle();
  const deleteVehicle = useDeleteVehicle();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      plate_number: "",
      vehicle_type: "Sedan",
      brand: "",
      model: "",
      color: "",
    },
  });

  const onSubmit = async (data: VehicleForm) => {
    try {
      await createVehicle.mutateAsync(data);
      toast.success("Vehicle added successfully");
      setDialogOpen(false);
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVehicle.mutateAsync(id);
      toast.success("Vehicle removed");
      setPendingDelete(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Your garage"
        title="Vehicles"
        description="Manage the vehicles registered to your account"
        action={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus size={16} /> Add vehicle
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : vehicles?.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 p-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Car size={40} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No vehicles yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a vehicle to start booking parking spaces
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus size={16} /> Add your first vehicle
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles?.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-6 transition-all hover:-translate-y-0.5 hover:shadow-soft-lg">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Car size={24} />
                  </div>
                  <Badge variant="info">{v.vehicle_type}</Badge>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{v.plate_number}</h3>
                <p className="text-sm text-muted-foreground">
                  {v.brand} {v.model} · {v.color}
                </p>
                <div className="mt-4 flex gap-2 border-t pt-4">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setPendingDelete(v.id)}
                  >
                    <Trash2 size={14} /> Remove
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add vehicle dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add vehicle</DialogTitle>
            <DialogDescription>
              Register a new vehicle to your account
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plate_number">Vehicle number</Label>
              <Input
                id="plate_number"
                placeholder="DHAKA METRO GA-11-9821"
                {...register("plate_number")}
              />
              {errors.plate_number && (
                <p className="text-xs text-danger">{errors.plate_number.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_type">Type</Label>
                <select
                  id="vehicle_type"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...register("vehicle_type")}
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
                <Input id="color" placeholder="Pearl white" {...register("color")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input id="brand" placeholder="Toyota" {...register("brand")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" placeholder="Corolla" {...register("model")} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createVehicle.isPending}>
                {createVehicle.isPending ? "Adding..." : "Add vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove vehicle</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this vehicle from your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => pendingDelete && handleDelete(pendingDelete)}
              disabled={deleteVehicle.isPending}
            >
              {deleteVehicle.isPending ? "Removing..." : "Remove vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}