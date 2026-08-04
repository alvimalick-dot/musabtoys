/**
 * Central SEO helpers for Karachi Toys.
 *
 * Brand city: Multan, Punjab, Pakistan
 * Domain: karachitoys (NEXT_PUBLIC_APP_URL)
 */

export const BRAND = "Karachi Toys";
export const BRAND_CITY = "Multan";
export const BRAND_REGION = "Punjab";
export const BRAND_COUNTRY = "PK";
export const BRAND_COUNTRY_NAME = "Pakistan";
export const BRAND_PHONE = "+92 331 3956602";
export const BRAND_WHATSAPP = "923313956602";
export const BRAND_ADDRESS = "6G36+2M5, T Block, New Multan Colony, Multan";
export const BRAND_GEO = { latitude: 30.20, longitude: 71.51 };
export const BRAND_PHONE_DISPLAY = "+92 331 3956602";
export const BRAND_LOCATION_NOTE = "Based in Multan — delivering nationwide across Pakistan";
export const BRAND_MAPS_URL = "https://maps.google.com/?q=6G36+2M5,+T+Block,+New+Multan+Colony,+Multan";
export const BRAND_SOCIAL = {
  instagram: "https://www.instagram.com/karachitoyshop",
  facebook: "https://www.facebook.com/karachitoyshop",
  tiktok: "https://www.tiktok.com/@karachitoyshop",
  whatsapp: "https://wa.me/923313956602",
};
export const CURRENCY = "PKR";

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Escape a string so it is safe to embed inside a <script> JSON-LD block.
 * Prevents `</script>` from prematurely closing the tag.
 */
export function escapeJsonLd(value: string): string {
  return value
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export interface ProductLd {
  name: string;
  slug: string;
  description?: string;
  sku?: string;
  brand?: string;
  category?: string;
  images?: string[];
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  stockCount?: number;
  ageGroup?: string;
  specs?: Record<string, string | number | undefined>;
  aggregateRating?: { ratingValue: number; reviewCount: number };
  reviews?: { author: string; rating: number; comment: string; createdAt?: string }[];
  updatedAt?: string;
}

export function storeJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${siteUrl}/#store`,
    name: BRAND,
    alternateName: "Karachi Toy Shop",
    url: siteUrl,
    logo: absoluteUrl("/logo.svg"),
    image: [
      absoluteUrl("/opengraph-image"),
      absoluteUrl("/logo.svg"),
    ],
    description:
      "Karachi Toys is Pakistan's #1 online toy store offering 4,500+ toys with Cash on Delivery nationwide. Based in Multan, Punjab — serving all of Pakistan.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "6G36+2M5, T Block, New Multan Colony",
      addressLocality: BRAND_CITY,
      addressRegion: BRAND_REGION,
      postalCode: "60000",
      addressCountry: BRAND_COUNTRY,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: BRAND_GEO.latitude,
      longitude: BRAND_GEO.longitude,
    },
    areaServed: [
      { "@type": "City", name: BRAND_CITY },
      { "@type": "Country", name: BRAND_COUNTRY_NAME },
    ],
    priceRange: "PKR 100 - PKR 150000+",
    currenciesAccepted: CURRENCY,
    paymentAccepted: "Cash on Delivery, JazzCash, PayFast",
    telephone: BRAND_PHONE,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BRAND_PHONE,
        contactType: "customer service",
        areaServed: BRAND_COUNTRY_NAME,
        availableLanguage: ["en", "ur"],
      },
      {
        "@type": "ContactPoint",
        telephone: `+${BRAND_WHATSAPP}`,
        contactType: "sales",
        areaServed: BRAND_COUNTRY_NAME,
        availableLanguage: ["en", "ur"],
      },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "21:00",
      },
    ],
    sameAs: [siteUrl],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Toy categories",
      itemListElement: [
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Building Sets" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Vehicles & RC Cars" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Baby & Toddler Toys" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Puzzles" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "STEM Toys" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Games & Board Games" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Action Figures & Dolls" } },
        { "@type": "Offer", itemOffered: { "@type": "Product", name: "Outdoor & Sports Toys" } },
      ],
    },
  };
}

export function websiteJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: BRAND,
    url: siteUrl,
    publisher: { "@id": `${siteUrl}/#store` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(p: ProductLd) {
  const siteUrl = getSiteUrl();
  const url = absoluteUrl(`/product/${p.slug}`);
  const image = p.images?.length ? p.images.map((i) => absoluteUrl(i)) : [absoluteUrl("/opengraph-image")];

  const additionalProperty = p.specs
    ? Object.entries(p.specs)
        .filter(([, v]) => v !== undefined && v !== "")
        .map(([k, v]) => ({
          "@type": "PropertyValue",
          name: k,
          value: String(v),
        }))
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.name,
    description: p.description,
    sku: p.sku,
    mpn: p.sku,
    url,
    image,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    category: p.category,
    ...(p.ageGroup ? { audience: { "@type": "PeopleAudience", suggestedAge: p.ageGroup } } : {}),
    additionalProperty,
    ...(p.aggregateRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: p.aggregateRating.ratingValue,
            reviewCount: p.aggregateRating.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
          review: p.reviews?.length
            ? p.reviews.slice(0, 10).map((r) => ({
                "@type": "Review",
                author: { "@type": "Person", name: r.author },
                reviewRating: {
                  "@type": "Rating",
                  ratingValue: r.rating,
                  bestRating: 5,
                  worstRating: 1,
                },
                reviewBody: r.comment,
                ...(r.createdAt ? { datePublished: r.createdAt } : {}),
              }))
            : undefined,
        }
      : {}),
    offers: {
      "@type": "Offer",
      "@id": `${url}#offer`,
      url,
      priceCurrency: CURRENCY,
      price: p.price,
      ...(p.compareAtPrice
        ? {
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            priceSpecification: {
              "@type": "PriceSpecification",
              price: p.price,
              priceCurrency: CURRENCY,
              valueAddedTaxIncluded: false,
            },
          }
        : {}),
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      ...(p.stockCount !== undefined
        ? { inventoryLevel: { "@type": "QuantitativeValue", value: p.stockCount } }
        : {}),
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${siteUrl}/#store` },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: CURRENCY,
        },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: BRAND_COUNTRY },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: BRAND_COUNTRY,
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: absoluteUrl(item.url) } : {}),
    })),
  };
}

export function collectionJsonLd(opts: {
  name: string;
  description?: string;
  url?: string;
  products: { name: string; slug: string; price: number; image?: string }[];
}) {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl(opts.url || "/shop"),
    name: opts.name,
    description: opts.description,
    url: absoluteUrl(opts.url || "/shop"),
    isPartOf: { "@id": `${siteUrl}/#website` },
    about: { "@id": `${siteUrl}/#store` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: opts.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/product/${p.slug}`),
        name: p.name,
        image: p.image ? absoluteUrl(p.image) : undefined,
        offers: {
          "@type": "Offer",
          priceCurrency: CURRENCY,
          price: p.price,
          availability: "https://schema.org/InStock",
        },
      })),
    },
  };
}

