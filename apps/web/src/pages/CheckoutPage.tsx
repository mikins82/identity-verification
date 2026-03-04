import { useState } from "react";
import { useNavigate } from "react-router";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { useRouteGuard } from "@/hooks/useRouteGuard";

export function CheckoutPage() {
  const allowed = useRouteGuard({ requireCart: true, requireVerified: true });
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleComplete = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    navigate("/checkout/confirmation");
  };

  if (!allowed) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>

      <CheckoutSummary />

      <div className="mt-6">
        <Button
          className="w-full sm:w-auto"
          size="lg"
          onClick={handleComplete}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Complete Rental
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
