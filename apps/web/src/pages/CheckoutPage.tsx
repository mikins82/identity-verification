import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CheckoutPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Rental</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Checkout summary will appear here with cart items and verified
            identity information.
          </p>
          <Button asChild>
            <Link to="/checkout/confirmation">Complete Rental</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
