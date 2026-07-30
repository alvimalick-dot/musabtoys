import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { JsonLd } from "@/components/seo/JsonLd";
import type { ProductDTO } from "@/types";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    await connectDB();
    const product = await Product.findOne({ slug }).lean();
    if (!product) return { title: "Product not found" };

    const title = `${product.name} — Buy Online in Karachi`;
    const description =
      product.description?.slice(0, 155) ||
      `Buy ${product.name} online from Karachi Toy Shop. ${product.brand} · ${product.ageGroup}. COD & JazzCash available.`;
    const image = product.images?.[0];
    const url = `${siteUrl}/product/${product.slug}`;

    return {
      title,
      description,
      keywords: [
        product.name,
        product.brand,
        product.category,
        "toys Karachi",
        "buy online Pakistan",
      ],
      alternates: { canonical: url },
      openGraph: {
        type: "website",
        url,
        title,
        description,
        siteName: "Karachi Toy Shop",
        locale: "en_PK",
        images: image
          ? [{ url: image, alt: product.name }]
          : [{ url: "/og-image.svg", alt: product.name }],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : ["/og-image.svg"],
      },
    };
  } catch {
    return { title: "Product" };
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
      sku: product.sku,
    } satisfies ProductDTO;

    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      sku: product.sku,
      brand: {
        "@type": "Brand",
        name: product.brand,
      },
      category: product.category,
      image: product.images?.length ? product.images : undefined,
      offers: {
        "@type": "Offer",
        url: `${siteUrl}/product/${product.slug}`,
        priceCurrency: "PKR",
        price: product.price,
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: {
          "@type": "Organization",
          name: "Karachi Toy Shop",
        },
      },
    };

    return (
      <>
        <JsonLd data={productJsonLd} />
        <ProductDetailClient product={dto} />
      </>
    );
  } catch {
    notFound();
  }
}
