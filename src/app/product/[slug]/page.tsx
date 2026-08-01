import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { ProductReviews } from "@/components/product/ProductReviews";
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

    const title = `Buy ${product.name} Online in Pakistan | Karachi Toys`;
    const description =
      product.description?.slice(0, 155) ||
      `Buy ${product.name} online in Pakistan. ${product.brand ? product.brand + " · " : ""}${product.ageGroup ? product.ageGroup + ". " : ""}Cash on Delivery available across Pakistan.`;
    const image = product.images?.[0];
    const url = `${siteUrl}/product/${product.slug}`;

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
      newArrival: product.newArrival,
      sku: product.sku,
    } satisfies ProductDTO;

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      stock: { $gt: 0 },
    })
      .sort({ featured: -1, createdAt: -1 })
      .limit(8)
      .lean();

    const relatedDto: ProductDTO[] = related.map((p) => ({
      _id: String(p._id),
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      category: p.category,
      brand: p.brand,
      ageGroup: p.ageGroup,
      stock: p.stock,
      stockStatus: p.stockStatus,
      images: p.images || [],
      specs: p.specs || {},
      featured: p.featured,
      newArrival: p.newArrival,
      sku: p.sku,
    }));

    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      sku: product.sku,
      brand: { "@type": "Brand", name: product.brand },
      category: product.category,
      image: product.images?.length ? product.images : undefined,
      offers: {
        "@type": "Offer",
        url: `${siteUrl}/product/${product.slug}`,
        priceCurrency: "PKR",
        price: product.price,
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: "Karachi Toys" },
        shippingDetails: {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "PKR",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
            transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
          },
        },
        hasMerchantReturnPolicy: {
          "@type": "MerchantReturnPolicy",
          applicableCountry: "PK",
          returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
          merchantReturnDays: 7,
          returnMethod: "https://schema.org/ReturnByMail",
          returnFees: "https://schema.org/FreeReturn",
        },
      },
    };

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
        { "@type": "ListItem", position: 2, name: "Shop", item: `${siteUrl}/shop` },
        {
          "@type": "ListItem",
          position: 3,
          name: product.category,
          item: `${siteUrl}/shop?category=${encodeURIComponent(product.category)}`,
        },
        { "@type": "ListItem", position: 4, name: product.name, item: url },
      ],
    };

    return (
      <>
        <JsonLd data={productJsonLd} />
        <JsonLd data={breadcrumbJsonLd} />
        <ProductDetailClient product={dto} />
        <RelatedProducts products={relatedDto} />
        <ProductReviews slug={product.slug} />
      </>
    );
  } catch {
    notFound();
  }
}
