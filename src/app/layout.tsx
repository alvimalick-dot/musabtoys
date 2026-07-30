import type { Metadata } from "next";
import { Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Karachi Toy Shop | Buy Toys Online in Karachi — Cash on Delivery",
    template: "%s | Karachi Toy Shop",
  },
  description:
    "Buy toys online in Karachi. Thousands of toys for every age. Cash on Delivery across Pakistan. From PKR 100 to 150,000+.",
  keywords: [
    "toys in Karachi",
    "buy toys online Pakistan",
    "Karachi toy shop",
    "kids toys Karachi",
    "toys COD Karachi",
    "Cash on Delivery toys",
    "baby toys Pakistan",
    "STEM toys Karachi",
    "RC cars Karachi",
    "toy store Pakistan",
  ],
  authors: [{ name: "Karachi Toy Shop" }],
  creator: "Karachi Toy Shop",
  publisher: "Karachi Toy Shop",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteUrl,
    siteName: "Karachi Toy Shop",
    title: "Karachi Toy Shop | Buy Toys Online in Karachi",
    description:
      "Thousands of toys for every age. Cash on Delivery across Pakistan. From PKR 100 to 150,000+.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Karachi Toy Shop — Toys for every age",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karachi Toy Shop | Buy Toys Online in Karachi",
    description:
      "Thousands of toys for every age. Cash on Delivery across Pakistan.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "shopping",
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "ToyStore",
  name: "Karachi Toy Shop",
  url: siteUrl,
  description:
    "Online toy store in Karachi offering thousands of toys with Cash on Delivery.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Karachi",
    addressRegion: "Sindh",
    addressCountry: "PK",
  },
  areaServed: {
    "@type": "Country",
    name: "Pakistan",
  },
  priceRange: "PKR 100 - PKR 150000+",
  currenciesAccepted: "PKR",
  paymentAccepted: "Cash on Delivery",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Karachi Toy Shop",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-PK">
      <body className={`${fredoka.variable} ${jakarta.variable} antialiased`}>
        <JsonLd data={orgJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <CartDrawer />
        <WhatsAppFab />
      </body>
    </html>
  );
}
