import { useEffect, useRef } from "react";
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
  const navValidated = useRef(false);

  if (requireCartNavigation && location.state?.fromCart && !navValidated.current) {
    navValidated.current = true;
  }

  const cartEmpty = requireCart === true && itemCount === 0;
  const noNavIntent =
    requireCartNavigation === true &&
    !navValidated.current &&
    !location.state?.fromCart;
  const notVerified = requireVerified === true && !isVerified;
  const shouldRedirect = cartEmpty || noNavIntent || notVerified;

  useEffect(() => {
    if (!requireCartNavigation || !location.state?.fromCart) return;
    const { fromCart, ...rest } = location.state;
    navigate(location.pathname + (location.search ?? ""), {
      replace: true,
      state: Object.keys(rest).length > 0 ? rest : undefined,
    });
  }, [requireCartNavigation, location, navigate]);

  useEffect(() => {
    if (cartEmpty) {
      navigate("/", { replace: true });
    } else if (noNavIntent) {
      navigate("/", { replace: true });
    } else if (notVerified) {
      navigate("/verify", { replace: true, state: { fromCart: true } });
    }
  }, [cartEmpty, noNavIntent, notVerified, navigate]);

  return !shouldRedirect;
}
