import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop Toys Online in Multan",
  description:
    "Browse thousands of toys in Multan — filter by age, brand, category & price. Building sets, baby toys, STEM kits, RC cars & more. COD available.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Shop Toys Online in Multan | Karachi Toy Shop",
    description:
      "Filter by age, brand, category and price. COD, JazzCash & card payments.",
    url: "/shop",
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
