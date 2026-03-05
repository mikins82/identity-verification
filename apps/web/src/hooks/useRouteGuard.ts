import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useCartStore, selectItemCount } from "@/store/cartStore";
import {
  useVerificationStore,
  selectIsVerified,
} from "@/store/verificationStore";

interface RouteGuardOptions {
  requireCart?: boolean;
  requireVerified?: boolean;
  requireCartNavigation?: boolean;
}

export function useRouteGuard({
  requireCart,
  requireVerified,
  requireCartNavigation,
}: RouteGuardOptions): boolean {
  const navigate = useNavigate();
  const location = useLocation();
  const itemCount = useCartStore(selectItemCount);
  const isVerified = useVerificationStore(selectIsVerified);

  const cartEmpty = requireCart === true && itemCount === 0;
  const noNavIntent =
    requireCartNavigation === true && !location.state?.fromCart;
  const notVerified = requireVerified === true && !isVerified;
  const shouldRedirect = cartEmpty || noNavIntent || notVerified;

  useEffect(() => {
    if (cartEmpty) {
      navigate("/", { replace: true });
    } else if (noNavIntent) {
      navigate("/cart", { replace: true });
    } else if (notVerified) {
      navigate("/verify", { replace: true, state: { fromCart: true } });
    }
  }, [cartEmpty, noNavIntent, notVerified, navigate]);

  return !shouldRedirect;
}
