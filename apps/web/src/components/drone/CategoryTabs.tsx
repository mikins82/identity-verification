import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DroneGrid } from "./DroneGrid";
import { DroneCardSkeleton } from "./DroneCard";
import { DRONES } from "@/data/drones";

const SKELETON_COUNT = 6;
const SIMULATED_DELAY_MS = 1500;

export function CategoryTabs() {
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), SIMULATED_DELAY_MS);
    return () => clearTimeout(timer);
  }, [category]);

  const filtered = category === "all"
    ? DRONES
    : DRONES.filter((d) => d.category === category);

  return (
    <Tabs value={category} onValueChange={setCategory}>
      <TabsList>
        <TabsTrigger value="all">All Drones</TabsTrigger>
        <TabsTrigger value="filming">Filming</TabsTrigger>
        <TabsTrigger value="cargo">Cargo</TabsTrigger>
      </TabsList>
      <TabsContent value={category} className="mt-6">
        {loading ? (
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
