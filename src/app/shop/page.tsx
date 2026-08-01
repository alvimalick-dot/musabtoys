import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopClient } from "@/components/shop/ShopClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  collectionJsonLd,
  getSiteUrl,
} from "@/lib/seo";
import { connectDB } from "@/lib/mongodb";
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
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/twitter-image"],
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

async function getCollectionProducts() {
  try {
    await connectDB();
    return await Product.find({}, "name slug price images")
      .sort({ createdAt: -1 })
      .limit(24)
      .lean();
  } catch {
    return [];
  }
}

export default async function ShopPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = sanitizeLabel(params.category);
  const brand = sanitizeLabel(params.brand);
  const ageGroup = sanitizeLabel(params.ageGroup);
  const q = sanitizeLabel(params.q);

  const collectionProducts = await getCollectionProducts();

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

