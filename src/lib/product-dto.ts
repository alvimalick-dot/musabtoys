import type { ProductDTO, ProductSpec, StockStatus } from "@/types";

/**
 * Minimal shape of a lean Product document as produced by
 * `Product.find(...).lean()` — all optional fields default gracefully so
 * the mapper is resilient to partial projections (e.g. `view=card`).
 */
interface LeanProduct {
  _id: unknown;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  brand: string;
  ageGroup: string;
  stock: number;
  stockStatus?: StockStatus;
  images?: string[];
  specs?: ProductSpec;
  featured?: boolean;
  newArrival?: boolean;
  sku?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Shared mapper that converts a lean Mongoose Product document into the
 * public ProductDTO shape consumed by ProductCard, FeaturedProducts,
 * NewArrivalProducts and the API. Keeping this in one place prevents the
 * drift that happens when each consumer hand-rolls its own mapping.
 */
export function toProductDTO(p: LeanProduct): ProductDTO {
  return {
    _id: String(p._id),
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    category: p.category,
    brand: p.brand,
    ageGroup: p.ageGroup,
    stock: p.stock,
    stockStatus: p.stockStatus ?? "in_stock",
    images: p.images || [],
    specs: p.specs || {},
    featured: p.featured,
    newArrival: p.newArrival,
    sku: p.sku,
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString(),
  };
}

