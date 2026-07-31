import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { NewArrivalProducts } from "@/components/home/NewArrivalProducts";
import { FeatureBand } from "@/components/home/FeatureBand";
import { CtaBanner } from "@/components/home/CtaBanner";

export const metadata: Metadata = {
  title: "Karachi Toy Shop | Buy Toys Online — COD & JazzCash",
  description:
    "Shop toys online from Karachi Toy Shop. Building sets, baby toys, STEM kits, RC cars & more. Cash on Delivery and JazzCash. From PKR 100 to 150,000+.",
  alternates: { canonical: "/" },
};

export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Hero />
       <FeaturedProducts />
       <NewArrivalProducts />
       
       <CategoryStrip />
     
        <FeatureBand />
      
    </>
  );
}
