import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VerifyPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Identity Verification
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Verify Your Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Identity verification components will be integrated here. This
            includes selfie capture, phone verification, and address
            confirmation.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/cart">Back to Cart</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
