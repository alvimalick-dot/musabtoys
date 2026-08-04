import type { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

// ISR: re-generate the sitemap at most once per hour so crawls don't hammer
// MongoDB on every request.
export const revalidate = 3600;

// Cap the number of product URLs emitted. Configurable via env.
const MAX_PRODUCTS = Number(process.env.SITEMAP_MAX_PRODUCTS || 10000);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/shop`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${siteUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/track`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/wishlist`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/account`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/checkout`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    await connectDB();
    const products = await Product.find({}, "slug updatedAt images")
      .sort({ updatedAt: -1 })
      .limit(MAX_PRODUCTS)
      .lean();

    const productPages: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${siteUrl}/product/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      images: (() => {
        const productImages: string[] = Array.isArray(p.images) ? p.images : [];
        return productImages.slice(0, 5);
      })(),
    }));

    return [...staticPages, ...productPages];
  } catch (error) {
    // Log so failures are visible in server logs instead of failing silently.
    console.error("Sitemap generation failed, returning static pages only:", error);
    return staticPages;
  }
}
