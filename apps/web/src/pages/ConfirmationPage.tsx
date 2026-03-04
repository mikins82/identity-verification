import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { ConfirmationScreen } from "@/components/checkout/ConfirmationScreen";
import { useCartStore, selectTotalPrice } from "@/store/cartStore";
import { useVerificationStore } from "@/store/verificationStore";

function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SR-${timestamp}-${random}`;
}

export function ConfirmationPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore(selectTotalPrice);
  const isVerified = useVerificationStore(
    (s) => s.identityData?.status === "verified",
  );
  const clearCart = useCartStore((s) => s.clear);
  const resetVerification = useVerificationStore((s) => s.reset);

  const orderId = useMemo(() => generateOrderId(), []);
  const snapshot = useRef({ items, totalPrice });
  const hasCleaned = useRef(false);

  useEffect(() => {
    if (!isVerified && items.length === 0 && hasCleaned.current) return;

    if (!isVerified || items.length === 0) {
      navigate("/", { replace: true });
      return;
    }

    if (!hasCleaned.current) {
      snapshot.current = { items, totalPrice };
      hasCleaned.current = true;
      clearCart();
      resetVerification();
    }
  }, [isVerified, items.length, navigate, clearCart, resetVerification, items, totalPrice]);

  if (!hasCleaned.current && (items.length === 0 || !isVerified)) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Rental Confirmed
      </h1>

      <ConfirmationScreen
        orderId={orderId}
        items={snapshot.current.items}
        totalPrice={snapshot.current.totalPrice}
      />
    </div>
  );
}
