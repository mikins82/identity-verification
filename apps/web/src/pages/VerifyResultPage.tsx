import { Link, useNavigate, useLocation } from "react-router";
import { ArrowRight, RotateCcw, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteGuardPending } from "@/components/ui/route-guard-pending";
import { ResultCard } from "@/components/verification/ResultCard";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useVerificationStore } from "@/store/verificationStore";

export default function VerifyResultPage() {
  const allowed = useRouteGuard({ requireCart: true });
  const navigate = useNavigate();
  const location = useLocation();
  const identityData = useVerificationStore((s) => s.identityData);
  const reset = useVerificationStore((s) => s.reset);

  const verifyPath = (location.state as { verifyPath?: string } | null)?.verifyPath ?? "/verify";

  if (!allowed) return <RouteGuardPending />;

  if (!identityData) {
    navigate(verifyPath, { replace: true, state: { fromCart: true } });
    return null;
  }

  const isSuccess = identityData.status === "verified";

  const handleRetry = () => {
    reset();
    navigate(verifyPath, { state: { fromCart: true } });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Verification Result
      </h1>

      <ResultCard data={identityData} />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {isSuccess ? (
          <Button asChild>
            <Link to="/checkout">
              Proceed to Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <>
            <Button onClick={handleRetry}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link to="/cart">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Back to Cart
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
