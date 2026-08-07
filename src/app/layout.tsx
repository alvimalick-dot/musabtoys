import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { AppToaster } from "@/components/ui/AppToaster";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { RouterRefreshOnFocus } from "@/components/ui/RouterRefreshOnFocus";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageTransition } from "@/components/ui/PageTransition";
import { MouseTrail } from "@/components/ui/MouseTrail";
import { storeJsonLd, websiteJsonLd, getSiteUrl } from "@/lib/seo";
import "./globals.css";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Karachi Toys",
  title: {
    default:
      "Karachi Toys | #1 Online Toy Store in Pakistan — Cash on Delivery",
    template: "%s | Karachi Toys",
  },
  description:
    "Shop 4,500+ toys online at Karachi Toys. Best prices in Pakistan — PKR 100 to 150,000+. Free Cash on Delivery nationwide. LEGO, RC cars, baby toys, board games & more. Based in Multan, delivering across Pakistan.",
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
    // Multan / local
    "toy shop Multan",
    "toys Multan",
    "toy store Multan Punjab",
    "buy toys Multan",
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
  formatDetection: { telephone: false },
  alternates: { canonical: "https://karachitoys.com" },
  openGraph: {
    type: "website",
    locale: "en_PK",
    alternateLocale: "ur_PK",
    url: siteUrl,
    siteName: "Karachi Toys",
    title: "Karachi Toys | #1 Online Toy Store in Pakistan",
    description:
      "4,500+ toys for every age. Cash on Delivery across Pakistan. LEGO, RC cars, baby toys & more — starting PKR 100. Based in Multan.",
    images: [
      {
        url: "/images/logo.png",
        width: 1200,
        height: 630,
        alt: "Karachi Toys logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karachi Toys | #1 Online Toy Store in Pakistan",
    description:
      "4,500+ toys. Cash on Delivery across Pakistan. Starting PKR 100.",
    images: ["/images/logo.png"],
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
  appleWebApp: {
    capable: true,
    title: "Karachi Toys",
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/logo.svg", sizes: "180x180", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
return (
    <html lang="en-PK" data-scroll-behavior="smooth">
<body className="antialiased">
<NextTopLoader
          color="#ff8a00"
          height={5}
          showSpinner={false}
          shadow="0 0 12px #ff8a00, 0 0 24px #ff8a00"
          zIndex={1600}
        />
        <ThemeProvider>
          <RouterRefreshOnFocus />

          <JsonLd data={websiteJsonLd()} />
          <MouseTrail />
          <AnnouncementBar />
          <Header />

          <main className="min-h-[70vh]">
            <PageTransition>{children}</PageTransition>
          </main>

<Footer />
          <CartDrawer />
          <WhatsAppFab />
          <MobileBottomBar />
          <AppToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
