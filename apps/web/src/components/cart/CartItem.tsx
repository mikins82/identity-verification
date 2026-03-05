import { announce } from "@/lib/announcer";
import { Camera, Package, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { formatCurrency } from "@/lib/formatCurrency";
import { calcDays, formatDateRange } from "@/lib/dateUtils";
import { useCartStore, type CartItem as CartItemType } from "@/store/cartStore";
import { memo, useState } from "react";

export interface CartItemProps {
  item: CartItemType;
}

export const CartItem = memo(function CartItem({ item }: CartItemProps) {
  const [imageError, setImageError] = useState(false);
  const [editing, setEditing] = useState(false);
  const updateDates = useCartStore((s) => s.updateDates);
  const removeItem = useCartStore((s) => s.removeItem);

  const days = calcDays(item.startDate, item.endDate);
  const subtotal = item.drone.dailyPrice * days;

  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-4">
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

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium truncate">{item.drone.name}</h3>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(item.drone.dailyPrice)}/day
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="w-20 text-right font-semibold tabular-nums">
                {formatCurrency(subtotal)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  removeItem(item.drone.id);
                  announce(`${item.drone.name} removed from cart`);
                }}
                aria-label={`Remove ${item.drone.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!editing ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">
                {formatDateRange(item.startDate, item.endDate)} ({days} day{days !== 1 ? "s" : ""})
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground"
                onClick={() => setEditing(true)}
                aria-label={`Edit dates for ${item.drone.name}`}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <DateRangePicker
                startDate={item.startDate}
                endDate={item.endDate}
                onStartChange={(start) => {
                  const end = start >= item.endDate
                    ? new Date(new Date(start).getTime() + 86_400_000).toISOString().slice(0, 10)
                    : item.endDate;
                  updateDates(item.drone.id, start, end);
                  announce(`${item.drone.name} dates updated`);
                }}
                onEndChange={(end) => {
                  updateDates(item.drone.id, item.startDate, end);
                  announce(`${item.drone.name} dates updated`);
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
