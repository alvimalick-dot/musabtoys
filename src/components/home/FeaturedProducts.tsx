import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { ProductCard } from "@/components/shop/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Section } from "@/components/ui/Section";
import { toProductDTO } from "@/lib/product-dto";
import type { ProductDTO } from "@/types";

async function getFeaturedProducts(): Promise<ProductDTO[]> {
  try {
    await connectDB();
    const products = await Product.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return products.map((p) => toProductDTO(p));
  } catch (error) {
    console.error("Failed to load featured products", error);
    return [];
  }
}

export async function FeaturedProducts() {
  const products = await getFeaturedProducts();

  if (!products.length) return null;

  return (
    <Section>
      <SectionHeading
        eyebrow="Handpicked for you"
        title="Featured"
        accent="toys"
        action={
          <Link
            href="/shop?featured=true"
            className="hidden shrink-0 text-sm font-bold text-coral hover:underline sm:block"
          >
            Shop all featured
          </Link>
        }
      />

      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      <div className="mt-8 sm:hidden">
        <Link
          href="/shop?featured=true"
          className="btn-secondary w-full justify-center"
        >
          Shop all featured
        </Link>
      </div>
    </Section>
  );
}
