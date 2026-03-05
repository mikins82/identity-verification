import { useEffect } from "react";
import { useNavigate } from "react-router";
import { ConfirmationScreen } from "@/components/checkout/ConfirmationScreen";
import { useCartStore } from "@/store/cartStore";

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const completedOrder = useCartStore((s) => s.completedOrder);

  useEffect(() => {
    if (!completedOrder) {
      navigate("/", { replace: true });
    }
  }, [completedOrder, navigate]);

  if (!completedOrder) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        Rental Confirmed
      </h1>

      <ConfirmationScreen
        orderId={completedOrder.orderId}
        items={completedOrder.items}
        totalPrice={completedOrder.totalPrice}
      />
    </div>
  );
}
