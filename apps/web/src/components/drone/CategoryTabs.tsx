import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DroneGrid } from "./DroneGrid";
import { DroneCardSkeleton } from "./DroneCard";
import { useDroneStore } from "@/store/droneStore";

const SKELETON_COUNT = 6;

export function CategoryTabs() {
  const [category, setCategory] = useState("all");
  const loaded = useDroneStore((s) => s.loaded);
  const loading = useDroneStore((s) => s.loading);
  const error = useDroneStore((s) => s.error);
  const fetchDrones = useDroneStore((s) => s.fetchDrones);
  const drones = useDroneStore((s) => s.drones);
  const filtered = useMemo(
    () => category === "all" ? drones : drones.filter((d) => d.category === category),
    [drones, category],
  );

  useEffect(() => {
    fetchDrones();
  }, [fetchDrones]);

  const retry = useCallback(() => {
    useDroneStore.setState({ error: null, loaded: false });
    fetchDrones();
  }, [fetchDrones]);

  const content = () => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load drones</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={retry}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    if (!loaded || loading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <DroneCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    return <DroneGrid drones={filtered} />;
  };

  return (
    <Tabs value={category} onValueChange={setCategory}>
      <TabsList>
        <TabsTrigger value="all">All Drones</TabsTrigger>
        <TabsTrigger value="filming">Filming</TabsTrigger>
        <TabsTrigger value="cargo">Cargo</TabsTrigger>
      </TabsList>
      <TabsContent value={category} className="mt-6">
        {content()}
      </TabsContent>
    </Tabs>
  );
}
