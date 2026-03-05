import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Camera, Clock, Droplets, Navigation, Package, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { isCargoDrone, isFilmingDrone } from "@/data/drones";
import { calcDays, todayISO, tomorrowISO } from "@/lib/dateUtils";
import { formatCurrency } from "@/lib/formatCurrency";
import { announce } from "@/lib/announcer";
import { useDroneStore } from "@/store/droneStore";
import { useCartStore } from "@/store/cartStore";

export function DroneDetailModal() {
  const { droneId } = useParams<{ droneId: string }>();
  const navigate = useNavigate();
  const drones = useDroneStore((s) => s.drones);
  const addItem = useCartStore((s) => s.addItem);

  const drone = drones.find((d) => d.id === droneId);

  const [startDate, setStartDate] = useState(todayISO);
  const [endDate, setEndDate] = useState(tomorrowISO);
  const [imageError, setImageError] = useState(false);
  const [open, setOpen] = useState(true);

  const close = () => {
    setOpen(false);
    setTimeout(() => navigate("/"), 200);
  };

  if (!drone) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Drone not found</DialogTitle>
            <DialogDescription>
              The requested drone could not be found.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const days = calcDays(startDate, endDate);
  const totalPrice = drone.dailyPrice * days;

  const handleAdd = () => {
    addItem(drone, startDate, endDate);
    toast.success(`${drone.name} added to cart`, {
      description: `${days} day${days > 1 ? "s" : ""} rental`,
    });
    announce(
      `${drone.name} added to cart for ${days} day${days > 1 ? "s" : ""}`,
    );
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl">{drone.name}</DialogTitle>
            <Badge variant={drone.category === "filming" ? "default" : "secondary"}>
              {drone.category === "filming" ? "Filming" : "Cargo"}
            </Badge>
          </div>
          <DialogDescription>{drone.description}</DialogDescription>
        </DialogHeader>

        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          {!imageError ? (
            <img
              src={drone.image}
              alt={drone.name}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              {drone.category === "filming" ? (
                <Camera className="h-16 w-16 opacity-20" />
              ) : (
                <Package className="h-16 w-16 opacity-20" />
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          {isFilmingDrone(drone) && (
            <>
              <SpecRow icon={<Camera className="h-3.5 w-3.5" />} label="Resolution" value={drone.specs.resolution} />
              <SpecRow icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Stabilization" value={drone.specs.stabilization} />
              <SpecRow icon={<Clock className="h-3.5 w-3.5" />} label="Flight time" value={`${drone.specs.flightTime} min`} />
              <SpecRow icon={<Navigation className="h-3.5 w-3.5" />} label="Range" value={`${(drone.specs.range / 1000).toFixed(0)} km`} />
            </>
          )}
          {isCargoDrone(drone) && (
            <>
              <SpecRow icon={<Package className="h-3.5 w-3.5" />} label="Max payload" value={`${drone.specs.maxPayload} kg`} />
              <SpecRow icon={<Clock className="h-3.5 w-3.5" />} label="Flight time" value={`${drone.specs.flightTime} min`} />
              <SpecRow icon={<Navigation className="h-3.5 w-3.5" />} label="Range" value={`${(drone.specs.range / 1000).toFixed(0)} km`} />
              <SpecRow icon={<Droplets className="h-3.5 w-3.5" />} label="Weather" value={drone.specs.weatherResistance} />
            </>
          )}
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Daily rate</span>
            <span className="text-lg font-bold">{formatCurrency(drone.dailyPrice)}/day</span>
          </div>

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
          />

          <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-bold">{formatCurrency(totalPrice)}</span>
          </div>

          <Button onClick={handleAdd} className="w-full" size="lg">
            Add to Cart
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SpecRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <span className="text-xs">{label}</span>
      <span className="ml-auto font-medium text-foreground">{value}</span>
    </div>
  );
}
