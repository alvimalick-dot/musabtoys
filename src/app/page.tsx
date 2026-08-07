import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { AgeShopBadges } from "@/components/home/AgeShopBadges";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { NewArrivalProducts } from "@/components/home/NewArrivalProducts";
import { FeatureBand } from "@/components/home/FeatureBand";
import { SectionDivider } from "@/components/home/SectionDivider";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, getSiteUrl, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Karachi Toy Shop | Buy Toys Online — COD & JazzCash",
  description:
    "Shop toys online from Karachi Toy Shop. Building sets, baby toys, STEM kits, RC cars & more. Cash on Delivery and JazzCash. From PKR 100 to 150,000+. Based in Multan, delivering nationwide.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Karachi Toy Shop | Buy Toys Online — COD & JazzCash",
    description:
      "4,500+ toys for every age. Cash on Delivery across Pakistan. Starting PKR 100.",
    url: "/",
    images: [{ url: "/images/logo.png", width: 1200, height: 630, alt: "Karachi Toys logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karachi Toy Shop | Buy Toys Online — COD & JazzCash",
    description: "4,500+ toys. COD across Pakistan. Starting PKR 100.",
    images: ["/images/logo.png"],
  },
};

export const revalidate = 60;

const siteUrl = getSiteUrl();

const homePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${siteUrl}/#webpage`,
  url: siteUrl,
  name: "Karachi Toy Shop | Buy Toys Online in Pakistan",
  description:
    "Pakistan's #1 online toy store. 4,500+ toys — building sets, baby toys, STEM kits, RC cars & more. Cash on Delivery nationwide. Based in Multan.",
  isPartOf: { "@id": `${siteUrl}/#website` },
  about: { "@id": `${siteUrl}/#store` },
  primaryImageOfPage: absoluteUrl("/opengraph-image"),
  inLanguage: "en-PK",
  dateModified: new Date().toISOString(),
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={homePageJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([{ name: "Home", url: "/" }])}
      />
<Hero />
      <AgeShopBadges />
      <SectionDivider />
      <FeaturedProducts />
      <NewArrivalProducts />
      <SectionDivider />
      <CategoryStrip />
      <FeatureBand />
    </>
  );
}

