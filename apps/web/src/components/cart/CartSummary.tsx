import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCartStore, selectTotalPrice, selectItemCount } from "@/store/cartStore";

export function CartSummary() {
  const totalPrice = useCartStore(selectTotalPrice);
  const itemCount = useCartStore(selectItemCount);

  return (
    <div className="rounded-xl border bg-card p-6">
      <h2 className="font-semibold">Order Summary</h2>
      <Separator className="my-4" />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </span>
        <span className="text-lg font-bold">{formatCurrency(totalPrice)}</span>
      </div>
      {itemCount === 0 ? (
        <Button className="mt-6 w-full" disabled>
          Proceed to Verification
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button asChild className="mt-6 w-full">
          <Link to="/verify" state={{ fromCart: true }}>
            Proceed to Verification
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}
