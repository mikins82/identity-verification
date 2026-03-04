import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useCartStore, selectItemCount } from "@/store/cartStore";
import {
  useVerificationStore,
  selectIsVerified,
} from "@/store/verificationStore";

interface RouteGuardOptions {
  requireCart?: boolean;
  requireVerified?: boolean;
}

export function useRouteGuard({
  requireCart,
  requireVerified,
}: RouteGuardOptions): boolean {
  const navigate = useNavigate();
  const itemCount = useCartStore(selectItemCount);
  const isVerified = useVerificationStore(selectIsVerified);

  const cartEmpty = requireCart === true && itemCount === 0;
  const notVerified = requireVerified === true && !isVerified;
  const shouldRedirect = cartEmpty || notVerified;

  useEffect(() => {
    if (cartEmpty) {
      navigate("/", { replace: true });
    } else if (notVerified) {
      navigate("/verify", { replace: true });
    }
  }, [cartEmpty, notVerified, navigate]);

  return !shouldRedirect;
}
