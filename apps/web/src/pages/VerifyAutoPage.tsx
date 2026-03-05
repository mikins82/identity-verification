import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  VerificationFlow,
  ThemeProvider,
} from "@identity-verification/react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { RouteGuardPending } from "@/components/ui/route-guard-pending";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useVerificationStore } from "@/store/verificationStore";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [hasUnsavedData, setHasUnsavedData] = useState(false);
  const { blocker, allowNavigation } = useUnsavedChanges(hasUnsavedData);

  const handleDirtyChange = useCallback((dirty: boolean) => {
    setHasUnsavedData(dirty);
  }, []);

  if (!allowed) return <RouteGuardPending />;

  const handleResult = (data: IdentityData) => {
    setIdentityData(data);
    allowNavigation();
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
            onDirtyChange={handleDirtyChange}
          />
        </ThemeProvider>
      </ErrorBoundary>

      <AlertDialog open={blocker.state === "blocked"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave verification?</AlertDialogTitle>
            <AlertDialogDescription>
              Your progress will be lost. You'll need to retake your selfie and
              re-enter your information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              Stay
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => blocker.proceed?.()}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
