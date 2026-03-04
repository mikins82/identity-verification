import {
  CheckCircle,
  XCircle,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { IdentityData } from "@/store/verificationStore";

export interface ResultCardProps {
  data: IdentityData;
}

export function ResultCard({ data }: ResultCardProps) {
  const isSuccess = data.status === "verified";

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            {isSuccess ? "Verification Passed" : "Verification Failed"}
          </CardTitle>
          <Badge variant={isSuccess ? "success" : "destructive"}>
            Score: {data.score}/100
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${isSuccess ? "bg-emerald-500" : "bg-destructive"}`}
            style={{ width: `${data.score}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {isSuccess
            ? "Your identity has been successfully verified. You may proceed to checkout."
            : "We were unable to verify your identity. Please try again with clearer information."}
        </p>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-3">
          {data.selfieUrl && (
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Selfie
                </p>
                <div className="mt-1 h-16 w-16 overflow-hidden rounded-md border bg-muted">
                  <img
                    src={data.selfieUrl}
                    alt="Captured selfie"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">Phone</p>
              <p className="text-sm break-all">{data.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Address
              </p>
              <p className="text-sm">
                {data.address.street}
                <br />
                {data.address.city}, {data.address.state}{" "}
                {data.address.postalCode}
                <br />
                {data.address.country}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
