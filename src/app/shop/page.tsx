import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop Toys Online in Pakistan | Karachi Toys",
  description:
    "Browse 4,500+ toys — filter by age, brand, category & price. Building sets, baby toys, STEM kits, RC cars & more. Cash on Delivery available nationwide.",
  alternates: { canonical: "/shop" },
  openGraph: {
    type: "website",
    title: "Shop Toys Online in Pakistan | Karachi Toys",
    description:
      "4,500+ toys. Filter by age, brand & price. COD, JazzCash & card payments.",
    url: "/shop",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Karachi Toys Shop" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Toys Online in Pakistan | Karachi Toys",
    description: "4,500+ toys. COD nationwide. Filter by age, brand & price.",
    images: ["/og-image.svg"],
  },
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-20 text-muted">Loading shop…</div>
      }
    >
      <ShopClient />
    </Suspense>
  );
}
