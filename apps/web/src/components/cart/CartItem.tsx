import { Camera, Package, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/stepper";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCartStore, type CartItem as CartItemType } from "@/store/cartStore";
import { useState } from "react";

export interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const [imageError, setImageError] = useState(false);
  const updateDays = useCartStore((s) => s.updateDays);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = item.drone.dailyPrice * item.days;

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
          {!imageError ? (
            <img
              src={item.drone.image}
              alt={item.drone.name}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              {item.drone.category === "filming" ? (
                <Camera className="h-8 w-8 opacity-20" />
              ) : (
                <Package className="h-8 w-8 opacity-20" />
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{item.drone.name}</h3>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(item.drone.dailyPrice)}/day
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Days:</span>
            <Stepper
              value={item.days}
              onChange={(days) => updateDays(item.drone.id, days)}
              min={1}
              max={30}
            />
          </div>

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
