import { useNavigate } from "react-router";
import {
  VerificationFlow,
  ThemeProvider,
} from "@identity-verification/react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { RouteGuardPending } from "@/components/ui/route-guard-pending";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useVerificationStore } from "@/store/verificationStore";
import type { IdentityData } from "@identity-verification/core";

const SKYRENT_THEME = {
  colors: {
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    success: "#16a34a",
    successLight: "#dcfce7",
  },
  borderRadius: "0.5rem",
} as const;

export default function VerifyAutoPage() {
  const allowed = useRouteGuard({ requireCart: true, requireCartNavigation: true });
  const navigate = useNavigate();
  const setIdentityData = useVerificationStore((s) => s.setIdentityData);

  if (!allowed) return <RouteGuardPending />;

  const handleResult = (data: IdentityData) => {
    setIdentityData(data);
    navigate("/verify/result", { state: { fromCart: true, verifyPath: "/verify/auto" } });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Identity Verification
      </h1>
      <ErrorBoundary>
        <ThemeProvider theme={SKYRENT_THEME}>
          <VerificationFlow
            onComplete={() => {}}
            onResult={handleResult}
          />
        </ThemeProvider>
      </ErrorBoundary>
    </div>
  );
}
