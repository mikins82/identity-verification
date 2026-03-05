import { Loader2 } from "lucide-react";

export function RouteGuardPending() {
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      role="status"
      aria-label="Redirecting"
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Redirecting…</span>
    </div>
  );
}
