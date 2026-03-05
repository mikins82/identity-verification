import { Suspense } from "react";
import { useNavigate } from "react-router";
import { ManualVerification } from "@/components/verification/ManualVerification";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { RouteGuardPending } from "@/components/ui/route-guard-pending";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useVerificationStore } from "@/store/verificationStore";
import type { IdentityData } from "@identity-verification/core";

function VerificationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-1 w-12" />
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-1 w-12" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
      <div className="flex justify-between">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const allowed = useRouteGuard({ requireCart: true, requireCartNavigation: true });
  const navigate = useNavigate();
  const setIdentityData = useVerificationStore((s) => s.setIdentityData);

  if (!allowed) return <RouteGuardPending />;

  const handleComplete = (data: IdentityData) => {
    setIdentityData(data);
    navigate("/verify/result", { state: { fromCart: true, verifyPath: "/verify" } });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Identity Verification
      </h1>
      <ErrorBoundary>
        <Suspense fallback={<VerificationSkeleton />}>
          <ManualVerification onComplete={handleComplete} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
