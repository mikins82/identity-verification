import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DroneGrid } from "./DroneGrid";
import { DRONES } from "@/data/drones";

export function CategoryTabs() {
  const [category, setCategory] = useState("all");

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
        <DroneGrid drones={filtered} />
      </TabsContent>
    </Tabs>
  );
}
