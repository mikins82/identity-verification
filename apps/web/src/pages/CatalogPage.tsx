import { CategoryTabs } from "@/components/drone/CategoryTabs";

export function CatalogPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Drone Catalog</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our fleet of professional filming and cargo drones available for rent.
        </p>
      </div>
      <CategoryTabs />
    </div>
  );
}
