import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { ProductCard } from "@/components/shop/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Section } from "@/components/ui/Section";
import { toProductDTO } from "@/lib/product-dto";
import type { ProductDTO } from "@/types";

async function getNewArrivalProducts(): Promise<ProductDTO[]> {
  try {
    await connectDB();
    const products = await Product.find({ newArrival: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return products.map((p) => toProductDTO(p));
  } catch (error) {
    console.error("Failed to load new arrival products", error);
    return [];
  }
}

export async function NewArrivalProducts() {
  const products = await getNewArrivalProducts();

  if (!products.length) return null;

  return (
    <Section band bandClassName="bg-sky/5 dark:bg-sky/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Just landed"
          title="New"
          accent="arrivals"
          eyebrowColor="text-sky"
          accentColor="text-sky"
          action={
            <Link
              href="/shop?newArrival=true"
              className="hidden shrink-0 text-sm font-bold text-sky hover:underline sm:block"
            >
              Shop all new arrivals
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
            href="/shop?newArrival=true"
            className="btn-secondary w-full justify-center"
          >
            Shop all new arrivals
          </Link>
        </div>
      </div>
    </Section>
  );
}
