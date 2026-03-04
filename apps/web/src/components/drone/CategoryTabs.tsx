import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DroneGrid } from "./DroneGrid";
import { DroneCardSkeleton } from "./DroneCard";
import { useDroneStore } from "@/store/droneStore";

const SKELETON_COUNT = 6;

export function CategoryTabs() {
  const [category, setCategory] = useState("all");
  const loaded = useDroneStore((s) => s.loaded);
  const loading = useDroneStore((s) => s.loading);
  const fetchDrones = useDroneStore((s) => s.fetchDrones);
  const drones = useDroneStore((s) => s.drones);
  const filtered = useMemo(
    () => category === "all" ? drones : drones.filter((d) => d.category === category),
    [drones, category],
  );

  useEffect(() => {
    fetchDrones();
  }, [fetchDrones]);

  return (
    <Tabs value={category} onValueChange={setCategory}>
      <TabsList>
        <TabsTrigger value="all">All Drones</TabsTrigger>
        <TabsTrigger value="filming">Filming</TabsTrigger>
        <TabsTrigger value="cargo">Cargo</TabsTrigger>
      </TabsList>
      <TabsContent value={category} className="mt-6">
        {!loaded || loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_COUNT }, (_, i) => (
              <DroneCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <DroneGrid drones={filtered} />
        )}
      </TabsContent>
    </Tabs>
  );
}
