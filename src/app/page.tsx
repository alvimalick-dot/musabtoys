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
  openGraph: {
    type: "website",
    title: "Karachi Toy Shop | Buy Toys Online — COD & JazzCash",
    description:
      "4,500+ toys for every age. Cash on Delivery across Pakistan. Starting PKR 100.",
    url: "/",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Karachi Toys" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karachi Toy Shop | Buy Toys Online — COD & JazzCash",
    description: "4,500+ toys. COD across Pakistan. Starting PKR 100.",
    images: ["/og-image.svg"],
  },
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
