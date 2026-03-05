import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { Loader2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { CatalogPage } from "@/pages/CatalogPage";

const CartPage = lazy(() => import("@/pages/CartPage"));
const VerifyPage = lazy(() => import("@/pages/VerifyPage"));
const VerifyResultPage = lazy(() => import("@/pages/VerifyResultPage"));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage"));
const ConfirmationPage = lazy(() => import("@/pages/ConfirmationPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function PageFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: "cart", element: <Lazy><CartPage /></Lazy> },
      { path: "verify", element: <Lazy><VerifyPage /></Lazy> },
      { path: "verify/result", element: <Lazy><VerifyResultPage /></Lazy> },
      { path: "checkout", element: <Lazy><CheckoutPage /></Lazy> },
      { path: "checkout/confirmation", element: <Lazy><ConfirmationPage /></Lazy> },
      { path: "*", element: <Lazy><NotFoundPage /></Lazy> },
    ],
  },
]);
