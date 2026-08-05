import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Review } from "@/models/Review";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ProductReviews } from "@/components/product/ProductReviews";
import { JsonLd } from "@/components/seo/JsonLd";
import { productJsonLd, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import type { ProductDTO } from "@/types";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectDB();
    const product = await Product.findOne({ slug }).lean();
    if (!product) return { title: "Product not found", robots: { index: false } };

    const title = `Buy ${product.name} Online in Pakistan | Karachi Toys`;
    const description =
      product.description?.slice(0, 155) ||
      `Buy ${product.name} online in Pakistan. ${product.brand ? product.brand + " · " : ""}${product.ageGroup ? product.ageGroup + ". " : ""}Cash on Delivery available across Pakistan.`;
    const image = product.images?.[0];
    const url = absoluteUrl(`/product/${product.slug}`);

    return {
      title,
      description,
      keywords: [
        product.name,
        `${product.name} price in Pakistan`,
        `buy ${product.name} online`,
        product.brand,
        `${product.brand} toys Pakistan`,
        product.category,
        `${product.category} toys Pakistan`,
        product.ageGroup,
        "toys Karachi",
        "toys Multan",
        "buy toys online Pakistan",
        "Cash on Delivery toys",
      ].filter(Boolean) as string[],
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        url,
        title,
        description,
        siteName: "Karachi Toys",
        locale: "en_PK",
        images: image
          ? [{ url: image, width: 1200, height: 1200, alt: product.name }]
          : [{ url: "/images/logo.png", width: 1200, height: 630, alt: product.name }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : ["/images/logo.png"],
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
  } catch {
    return { title: "Product", robots: { index: false } };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  try {
    await connectDB();
    const product = await Product.findOne({ slug }).lean();
    if (!product) notFound();

    const dto = {
      _id: String(product._id),
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      category: product.category,
      brand: product.brand,
      ageGroup: product.ageGroup,
      stock: product.stock,
      stockStatus: product.stockStatus,
      images: product.images || [],
      specs: product.specs || {},
      featured: product.featured,
      newArrival: product.newArrival,
      sku: product.sku,
    } satisfies ProductDTO;

// Run the related-products and reviews queries in parallel — they are
    // independent of each other, so running them sequentially wastes time.
    // Related cards only need name/slug/price/first image, so project a small
    // field set instead of shipping full documents (descriptions, specs,
    // full image arrays) to the client.
    type RelatedDoc = {
      _id: unknown;
      name: string;
      slug: string;
      price: number;
      compareAtPrice?: number;
      images?: string[];
    };
    type ReviewDoc = { authorName: string; rating: number; comment: string; createdAt?: Date };

    const [related, reviews] = await Promise.all([
      Product.find({
        category: product.category,
        _id: { $ne: product._id },
        stock: { $gt: 0 },
      })
        .select("name slug price compareAtPrice images")
        .sort({ featured: -1, createdAt: -1 })
        .limit(8)
        .lean(),
      Review.find({ productSlug: product.slug, approved: true })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
    ]).catch(() => [[], []] as [RelatedDoc[], ReviewDoc[]]);

    const relatedDto: { _id: string; name: string; slug: string; price: number; compareAtPrice?: number; images: string[] }[] =
      (related as RelatedDoc[]).map((p) => ({
        _id: String(p._id),
        name: p.name,
        slug: p.slug,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        images: p.images || [],
      }));

    let aggregateRating: { ratingValue: number; reviewCount: number } | undefined;
    if (reviews.length > 0) {
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      aggregateRating = {
        ratingValue: Math.round(avg * 10) / 10,
        reviewCount: reviews.length,
      };
    }

    const productLd = productJsonLd({
      name: product.name,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      brand: product.brand,
      category: product.category,
      images: product.images || [],
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      inStock: product.stock > 0,
      stockCount: product.stock,
      ageGroup: product.ageGroup,
      specs: product.specs,
      aggregateRating,
      reviews: reviews.map((r) => ({
        author: r.authorName,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
      })),
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : undefined,
    });

    const breadcrumb = breadcrumbJsonLd([
      { name: "Home", url: "/" },
{ name: "Shop", url: "/shop" },
      {
        name: product.category,
        url: `/shop?category=${encodeURIComponent(product.category)}`,
      },
      { name: product.name, url: `/product/${product.slug}` },
    ]);

    return (
      <>
        <JsonLd data={productLd} />
        <JsonLd data={breadcrumb} />
        <ProductDetailClient product={dto} />
        <RelatedProducts products={relatedDto} />
        <ProductReviews
          slug={product.slug}
          initial={reviews.map((r) => ({
            _id:
              typeof (r as unknown as { _id?: unknown })._id === "string"
                ? (r as unknown as { _id: string })._id
                : `${product.slug}-${r.authorName}-${r.rating}`,
            authorName: r.authorName,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : undefined,
          }))}
        />
      </>
    );
  } catch {
    notFound();
  }
}

