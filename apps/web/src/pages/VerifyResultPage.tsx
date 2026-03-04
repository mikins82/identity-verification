import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VerifyResultPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Verification Result
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Verification result will be displayed here after SDK integration.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/verify">Try Again</Link>
            </Button>
            <Button asChild>
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
