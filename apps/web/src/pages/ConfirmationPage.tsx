import { Link } from "react-router";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function ConfirmationPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Alert variant="success" className="mb-8">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Rental Confirmed!</AlertTitle>
        <AlertDescription>
          Your drone rental has been confirmed. You will receive a confirmation
          email shortly.
        </AlertDescription>
      </Alert>
      <div className="text-center">
        <Button asChild>
          <Link to="/">Browse More Drones</Link>
        </Button>
      </div>
    </div>
  );
}
