import { Link } from "react-router";
import { ShoppingCart } from "lucide-react";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const items = useCartStore((s) => s.items);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart />}
        title="Your cart is empty"
        description="Browse our drone catalog and add some drones to get started."
        action={
          <Button asChild>
            <Link to="/">Browse Drones</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Your Cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-4">
          {items.map((item) => (
            <CartItem key={item.drone.id} item={item} />
          ))}
        </div>
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
