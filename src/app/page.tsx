import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { FeatureBand } from "@/components/home/FeatureBand";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "Karachi Toy Shop | Buy Toys Online in Karachi — COD & JazzCash",
  description:
    "Shop toys online in Karachi. Building sets, baby toys, STEM kits, RC cars & more. Cash on Delivery and JazzCash. From PKR 100 to 150,000+.",
  alternates: { canonical: "/" },
};

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryStrip />
      <FeaturedProducts />
      <FeatureBand />
      <CtaBanner />
    </>
  );
}
