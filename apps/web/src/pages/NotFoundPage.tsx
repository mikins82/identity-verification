import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-7xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-xl text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Button asChild className="mt-8">
        <Link to="/">Back to Catalog</Link>
      </Button>
    </div>
  );
}
