import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Drone } from "@/data/drones";
import { isCargoDrone, isFilmingDrone } from "@/data/drones";
import { formatCurrency } from "@/lib/formatCurrency";
import { Camera, Clock, Droplets, Navigation, Package, ShieldCheck } from "lucide-react";
import { memo, useState } from "react";

export interface DroneCardProps {
  drone: Drone;
}

export const DroneCard = memo(function DroneCard({ drone }: DroneCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link to={`/drone/${drone.id}`} className="block">
      <Card data-testid="drone-card" className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg cursor-pointer">
        <div className="relative aspect-4/3 bg-muted overflow-hidden">
          {!imageError ? (
            <img
              src={drone.image}
              alt={drone.name}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : null}
          {imageError ? (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted">
              {drone.category === "filming" ? (
                <Camera className="h-16 w-16 opacity-20" />
              ) : (
                <Package className="h-16 w-16 opacity-20" />
              )}
            </div>
          ) : null}
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
          <div className="grid grid-cols-1 gap-2 text-sm">
            {isFilmingDrone(drone) && (
              <>
                <SpecItem
                  icon={<Camera className="h-3.5 w-3.5" />}
                  label="Resolution"
                  value={drone.specs.resolution}
                />
                <SpecItem
                  icon={<ShieldCheck className="h-3.5 w-3.5" />}
                  label="Stabilization"
                  value={drone.specs.stabilization}
                />
                <SpecItem
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Flight time"
                  value={`${drone.specs.flightTime} min`}
                />
                <SpecItem
                  icon={<Navigation className="h-3.5 w-3.5" />}
                  label="Range"
                  value={`${(drone.specs.range / 1000).toFixed(0)} km`}
                />
              </>
            )}
            {isCargoDrone(drone) && (
              <>
                <div className="rounded-md bg-muted px-3 py-2 text-center">
                  <span className="text-2xl font-bold">{drone.specs.maxPayload} kg</span>
                  <span className="block text-xs text-muted-foreground">max payload</span>
                </div>
                <SpecItem
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Flight time"
                  value={`${drone.specs.flightTime} min`}
                />
                <SpecItem
                  icon={<Navigation className="h-3.5 w-3.5" />}
                  label="Range"
                  value={`${(drone.specs.range / 1000).toFixed(0)} km`}
                />
                <SpecItem
                  icon={<Droplets className="h-3.5 w-3.5" />}
                  label="Weather"
                  value={drone.specs.weatherResistance}
                />
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

function SpecItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <span>
        <span className="text-xs">{label}</span>{" "}
        <span className="font-medium text-foreground">{value}</span>
      </span>
    </div>
  );
}

export function DroneCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <Skeleton className="aspect-4/3 rounded-none" />

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-1 h-4 w-3/4" />
      </CardHeader>

      <CardContent className="flex-1">
        <div className="grid grid-cols-1 gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  );
}
