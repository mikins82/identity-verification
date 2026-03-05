import { CheckCircle, Package } from "lucide-react";
import { Link } from "react-router";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/formatCurrency";
import { calcDays, formatDateRange } from "@/lib/dateUtils";
import type { CartItem } from "@/store/cartStore";

export interface ConfirmationScreenProps {
  orderId: string;
  items: CartItem[];
  totalPrice: number;
}

export function ConfirmationScreen({
  orderId,
  items,
  totalPrice,
}: ConfirmationScreenProps) {
  return (
    <div className="space-y-6">
      <Alert variant="success">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Rental Confirmed!</AlertTitle>
        <AlertDescription>
          Your drone rental has been confirmed. You&apos;ll receive a
          confirmation email shortly.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-base">Order #{orderId}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {items.length} item{items.length !== 1 ? "s" : ""} rented
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.drone.id}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {item.drone.name}{" "}
                  <span className="text-muted-foreground">
                    {formatDateRange(item.startDate, item.endDate)} ({calcDays(item.startDate, item.endDate)} day{calcDays(item.startDate, item.endDate) !== 1 ? "s" : ""})
                  </span>
                </span>
                <span className="tabular-nums">
                  {formatCurrency(item.drone.dailyPrice * calcDays(item.startDate, item.endDate))}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button asChild>
          <Link to="/">Browse More Drones</Link>
        </Button>
      </div>
    </div>
  );
}
