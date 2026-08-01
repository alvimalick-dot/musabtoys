import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Karachi Toy Shop order with COD or online payment.",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}
