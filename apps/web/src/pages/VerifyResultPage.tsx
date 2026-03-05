import { Link, useNavigate } from "react-router";
import { ArrowRight, RotateCcw, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/verification/ResultCard";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useVerificationStore } from "@/store/verificationStore";

export function VerifyResultPage() {
  const allowed = useRouteGuard({ requireCart: true });
  const navigate = useNavigate();
  const identityData = useVerificationStore((s) => s.identityData);
  const reset = useVerificationStore((s) => s.reset);

  if (!allowed) return null;

  if (!identityData) {
    navigate("/verify", { replace: true, state: { fromCart: true } });
    return null;
  }

  const isSuccess = identityData.status === "verified";

  const handleRetry = () => {
    reset();
    navigate("/verify", { state: { fromCart: true } });
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
