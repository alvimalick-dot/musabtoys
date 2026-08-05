import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  collectionJsonLd,
  getSiteUrl,
} from "@/lib/seo";
import { Product } from "@/models/Product";

const siteUrl = getSiteUrl();

type Props = {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    ageGroup?: string;
    q?: string;
    page?: string;
  }>;
};

function sanitizeLabel(value?: string): string {
  return (value || "").trim().slice(0, 60);
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const category = sanitizeLabel(params.category);
  const brand = sanitizeLabel(params.brand);
  const ageGroup = sanitizeLabel(params.ageGroup);
  const q = sanitizeLabel(params.q);
  const page = Number(params.page || 1);

  let title = "Shop Toys Online in Pakistan | Karachi Toys";
  let description =
    "Browse 4,500+ toys — filter by age, brand, category & price. Building sets, baby toys, STEM kits, RC cars & more. Cash on Delivery available nationwide.";

  if (category) {
    title = `${category} Toys Online in Pakistan | Karachi Toys`;
    description = `Shop ${category} toys online in Pakistan at Karachi Toys. Best prices, cash on delivery nationwide, fast delivery in Multan & all cities.`;
  } else if (brand) {
    title = `${brand} Toys Online in Pakistan | Karachi Toys`;
    description = `Buy ${brand} toys online in Pakistan at Karachi Toys. Original ${brand} products, cash on delivery, affordable prices.`;
  } else if (ageGroup) {
    title = `Toys for ${ageGroup} in Pakistan | Karachi Toys`;
    description = `Discover toys for kids aged ${ageGroup} in Pakistan. Age-appropriate, safe & fun toys with cash on delivery nationwide.`;
  }

  if (q) {
    title = `Search results for "${q}" | Karachi Toys`;
    description = `Search results for "${q}" — ${description}`;
  }

  const url = new URL(siteUrl);
  url.pathname = "/shop";
  for (const [key, value] of Object.entries({
    category: params.category,
    brand: params.brand,
    ageGroup: params.ageGroup,
    q: params.q,
  })) {
    if (value) url.searchParams.set(key, value);
  }
  if (page > 1) url.searchParams.set("page", String(page));

  return {
    title,
    description,
    alternates: { canonical: url.toString() },
    openGraph: {
      type: "website",
      title,
      description,
      url: url.toString(),
      siteName: "Karachi Toys",
      images: [{ url: "/images/logo.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
      },
    },
  };
}

// The shop page's server component runs on every request (it awaits
// searchParams, so it can't be fully static). The collection query below is
// only used to seed JSON-LD structured data, not the visible grid (which is
// fetched client-side). It must NOT block the page render on a DB round-trip.
// We serve the last-known cached value synchronously and refresh it in the
// background, so the shop UI (and the client-side product fetch) renders
// immediately.
type CollectionItem = { name: string; slug: string; price: number; images?: string[] };
const COLLECTION_CACHE_TTL_MS = 5 * 60 * 1000;
let collectionCache: { at: number; data: CollectionItem[] } | null = null;
let latestCollection: CollectionItem[] = [];

function getCollectionProducts(): CollectionItem[] {
  const now = Date.now();
  if (collectionCache && now - collectionCache.at < COLLECTION_CACHE_TTL_MS) {
    latestCollection = collectionCache.data;
    return latestCollection;
  }
  if (!collectionCache) {
    // Refresh in the background; never block the page on this query.
    void Product.find({}, "name slug price images")
      .sort({ createdAt: -1 })
      .limit(24)
      .lean()
      .then((data) => {
        collectionCache = {
          at: Date.now(),
          data: data as unknown as CollectionItem[],
        };
        latestCollection = collectionCache.data;
      })
      .catch(() => {});
  }
  return latestCollection;
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = sanitizeLabel(params.category);
  const brand = sanitizeLabel(params.brand);
  const ageGroup = sanitizeLabel(params.ageGroup);
  const q = sanitizeLabel(params.q);

const collectionProducts = getCollectionProducts();

  const queryParams = new URLSearchParams();
  if (category) queryParams.set("category", category);
  if (brand) queryParams.set("brand", brand);
  if (ageGroup) queryParams.set("ageGroup", ageGroup);
  if (q) queryParams.set("q", q);
  const queryString = queryParams.toString();

  const pageName = category
    ? `${category} Toys`
    : brand
      ? `${brand} Toys`
      : ageGroup
        ? `Toys for ${ageGroup}`
        : q
          ? `Search results for "${q}"`
          : "Shop all toys";

  const pageDescription = category
    ? `Browse our full range of ${category} toys — cash on delivery across Pakistan.`
    : "Shop the full Karachi Toys catalog — filter by category, age, brand and price.";

  const breadcrumbs: { name: string; url?: string }[] = [
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
  ];
  if (category) breadcrumbs.push({ name: category });
  else if (brand) breadcrumbs.push({ name: brand });
  else if (ageGroup) breadcrumbs.push({ name: `Age ${ageGroup}` });
  else if (q) breadcrumbs.push({ name: `Search: ${q}` });

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(breadcrumbs)}
      />
      <JsonLd
        data={collectionJsonLd({
          name: pageName,
          description: pageDescription,
          url: `/shop${queryString ? `?${queryString}` : ""}`,
          products: collectionProducts.map((p) => ({
            name: p.name,
            slug: p.slug,
            price: p.price,
            image: p.images?.[0],
          })),
        })}
      />
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-20 text-muted">
            Loading shop…
          </div>
        }
      >
        <ShopClient />
      </Suspense>
    </>
  );
}

