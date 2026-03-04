import { User, Phone, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/formatCurrency";
import { useCartStore, selectTotalPrice } from "@/store/cartStore";
import { useVerificationStore } from "@/store/verificationStore";

export function CheckoutSummary() {
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore(selectTotalPrice);
  const identityData = useVerificationStore((s) => s.identityData);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item) => {
              const subtotal = item.drone.dailyPrice * item.days;
              return (
                <div
                  key={item.drone.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-medium">{item.drone.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      {item.days} day{item.days !== 1 ? "s" : ""} &times;{" "}
                      {formatCurrency(item.drone.dailyPrice)}/day
                    </span>
                  </div>
                  <span className="ml-4 shrink-0 tabular-nums font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
              );
            })}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-lg font-bold">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        </CardContent>
      </Card>

      {identityData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Verified Identity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {identityData.selfieUrl && (
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      Selfie
                    </p>
                    <div className="mt-1 h-12 w-12 overflow-hidden rounded-md border bg-muted">
                      <img
                        src={identityData.selfieUrl}
                        alt="Verified selfie"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Phone
                  </p>
                  <p className="text-sm">{identityData.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Address
                  </p>
                  <p className="text-sm">
                    {identityData.address.street},{" "}
                    {identityData.address.city}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
