import { useState } from "react";
import { toast } from "sonner";
import { Camera, Package, Clock, Navigation, Droplets, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCartStore } from "@/store/cartStore";
import type { Drone } from "@/data/drones";
import { isFilmingDrone, isCargoDrone } from "@/data/drones";

export interface DroneCardProps {
  drone: Drone;
}

export function DroneCard({ drone }: DroneCardProps) {
  const [days, setDays] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem(drone, days);
    toast.success(`${drone.name} added to cart`, {
      description: `${days} day${days > 1 ? "s" : ""} rental`,
    });
    setDays(1);
  };

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] bg-muted">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          {drone.category === "filming" ? (
            <Camera className="h-16 w-16 opacity-20" />
          ) : (
            <Package className="h-16 w-16 opacity-20" />
          )}
        </div>
        <Badge
          variant={drone.category === "filming" ? "default" : "secondary"}
          className="absolute left-3 top-3"
        >
          {drone.category === "filming" ? "Filming" : "Cargo"}
        </Badge>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{drone.name}</CardTitle>
          <span className="shrink-0 text-lg font-bold">
            {formatCurrency(drone.dailyPrice)}
            <span className="text-xs font-normal text-muted-foreground">/day</span>
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{drone.description}</p>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {isFilmingDrone(drone) && (
            <>
              <SpecItem icon={<Camera className="h-3.5 w-3.5" />} label="Resolution" value={drone.specs.resolution} />
              <SpecItem icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Stabilization" value={drone.specs.stabilization} />
              <SpecItem icon={<Clock className="h-3.5 w-3.5" />} label="Flight time" value={`${drone.specs.flightTime} min`} />
              <SpecItem icon={<Navigation className="h-3.5 w-3.5" />} label="Range" value={`${(drone.specs.range / 1000).toFixed(0)} km`} />
            </>
          )}
          {isCargoDrone(drone) && (
            <>
              <div className="col-span-2 rounded-md bg-muted px-3 py-2 text-center">
                <span className="text-2xl font-bold">{drone.specs.maxPayload} kg</span>
                <span className="block text-xs text-muted-foreground">max payload</span>
              </div>
              <SpecItem icon={<Clock className="h-3.5 w-3.5" />} label="Flight time" value={`${drone.specs.flightTime} min`} />
              <SpecItem icon={<Navigation className="h-3.5 w-3.5" />} label="Range" value={`${(drone.specs.range / 1000).toFixed(0)} km`} />
              <SpecItem icon={<Droplets className="h-3.5 w-3.5" />} label="Weather" value={drone.specs.weatherResistance} />
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3 border-t pt-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Days:</span>
          <Stepper value={days} onChange={setDays} min={1} max={30} />
        </div>
        <Button onClick={handleAdd} size="sm">
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}

function SpecItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <span>
        <span className="font-medium text-foreground">{value}</span>{" "}
        <span className="text-xs">{label}</span>
      </span>
    </div>
  );
}
