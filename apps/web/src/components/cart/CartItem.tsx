import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCartStore, type CartItem as CartItemType } from "@/store/cartStore";

export interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateDays = useCartStore((s) => s.updateDays);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = item.drone.dailyPrice * item.days;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-muted">
          <span className="text-2xl opacity-30">
            {item.drone.category === "filming" ? "🎬" : "📦"}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{item.drone.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(item.drone.dailyPrice)}/day
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Stepper
            value={item.days}
            onChange={(days) => updateDays(item.drone.id, days)}
            min={1}
            max={30}
          />

          <span className="w-20 text-right font-semibold tabular-nums">
            {formatCurrency(subtotal)}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeItem(item.drone.id)}
            aria-label={`Remove ${item.drone.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
