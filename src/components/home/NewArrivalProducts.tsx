import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { ProductCard } from "@/components/shop/ProductCard";
import type { ProductDTO } from "@/types";

async function getNewArrivalProducts(): Promise<ProductDTO[]> {
  try {
    await connectDB();
    const products = await Product.find({ newArrival: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return products.map((p) => ({
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
  } catch (error) {
    console.error("Failed to load new arrival products", error);
    return [];
  }
}

export async function NewArrivalProducts() {
  const products = await getNewArrivalProducts();

  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-sky">
            Just landed
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            New arrivals
          </h2>
        </div>
        <Link
          href="/shop?newArrival=true"
          className="hidden shrink-0 text-sm font-bold text-sky hover:underline sm:block"
        >
          Shop all new arrivals
        </Link>
      </div>

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
    </section>
  );
}
