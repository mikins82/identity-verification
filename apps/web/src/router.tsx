import { createBrowserRouter } from "react-router";
import { Layout } from "@/components/layout/Layout";
import { CatalogPage } from "@/pages/CatalogPage";
import { CartPage } from "@/pages/CartPage";
import { VerifyPage } from "@/pages/VerifyPage";
import { VerifyResultPage } from "@/pages/VerifyResultPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { ConfirmationPage } from "@/pages/ConfirmationPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "verify", element: <VerifyPage /> },
      { path: "verify/result", element: <VerifyResultPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "checkout/confirmation", element: <ConfirmationPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
