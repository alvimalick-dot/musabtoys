import type { Metadata } from "next";
import { Fredoka, Plus_Jakarta_Sans } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { AppToaster } from "@/components/ui/AppToaster";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageTransition } from "@/components/ui/PageTransition";
import { MouseTrail } from "@/components/ui/MouseTrail";
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
    default: "Karachi Toys | #1 Online Toy Store in Pakistan — Cash on Delivery",
    template: "%s | Karachi Toys",
  },
  description:
    "Shop 4,500+ toys online at Karachi Toys. Best prices in Pakistan — PKR 100 to 150,000+. Free Cash on Delivery nationwide. LEGO, RC cars, baby toys, board games & more.",
  keywords: [
    // High-intent buyer keywords
    "buy toys online Pakistan",
    "toys online Pakistan",
    "online toy store Pakistan",
    "toys Cash on Delivery Pakistan",
    "toys COD Pakistan",
    // Brand + city
    "Karachi Toys",
    "Karachi toy shop",
    "toy store Karachi",
    "kids toys Karachi",
    // Product category keywords
    "LEGO Pakistan",
    "RC cars Pakistan",
    "remote control toys Pakistan",
    "baby toys Pakistan",
    "educational toys Pakistan",
    "STEM toys Pakistan",
    "board games Pakistan",
    "action figures Pakistan",
    "dolls Pakistan",
    "outdoor toys Pakistan",
    // Urdu transliteration (how Pakistanis actually search)
    "khilone online Pakistan",
    "bachon ke khilone",
    "sasta khilona",
    // Long-tail
    "best toys for kids Pakistan",
    "affordable toys Pakistan",
    "toys for 1 year old Pakistan",
    "toys for 5 year old Pakistan",
    "birthday gifts for kids Pakistan",
  ],
  authors: [{ name: "Karachi Toys" }],
  creator: "Karachi Toys",
  publisher: "Karachi Toys",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteUrl,
    siteName: "Karachi Toys",
    title: "Karachi Toys | #1 Online Toy Store in Pakistan",
    description:
      "4,500+ toys for every age. Cash on Delivery across Pakistan. LEGO, RC cars, baby toys & more — starting PKR 100.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Karachi Toys — Pakistan's favourite online toy store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karachi Toys | #1 Online Toy Store in Pakistan",
    description:
      "4,500+ toys. Cash on Delivery across Pakistan. Starting PKR 100.",
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
  name: "Karachi Toys",
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description:
    "Karachi Toys is Pakistan's #1 online toy store offering 4,500+ toys with Cash on Delivery nationwide.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Multan",
    addressRegion: "Punjab",
    addressCountry: "PK",
  },
  areaServed: { "@type": "Country", name: "Pakistan" },
  priceRange: "PKR 100 - PKR 150000+",
  currenciesAccepted: "PKR",
  paymentAccepted: "Cash on Delivery, JazzCash, PayFast",
  openingHours: "Mo-Su 09:00-21:00",
  sameAs: [
    `${siteUrl}`,
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Karachi Toys",
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
    <html lang="en-PK" data-scroll-behavior="smooth">
      <body className={`${fredoka.variable} ${jakarta.variable} antialiased`}>
        <JsonLd data={orgJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <MouseTrail />
        <Header />
        
        <main className="min-h-[70vh]">
          <PageTransition>{children}</PageTransition>
        </main>
        
        <Footer />
        <CartDrawer />
        <WhatsAppFab />
        <AppToaster />
      </body>
    </html>
  );

}
