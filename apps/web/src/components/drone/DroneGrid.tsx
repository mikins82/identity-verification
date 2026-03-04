import { DroneCard } from "./DroneCard";
import type { Drone } from "@/data/drones";

export interface DroneGridProps {
  drones: Drone[];
}

export function DroneGrid({ drones }: DroneGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {drones.map((drone) => (
        <DroneCard key={drone.id} drone={drone} />
      ))}
    </div>
  );
}
