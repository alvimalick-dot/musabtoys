import { NextRequest, NextResponse } from "next/server";
import Fuse from "fuse.js";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { productFilterSchema } from "@/lib/validators";
import { makeSlug } from "@/lib/utils";
import { getAdminSession } from "@/lib/auth";
import { normalizeImagePath } from "@/lib/image-path";

export const dynamic = "force-dynamic";

// Facet values (category/brand/ageGroup) change rarely. Cache them in memory
// with a short TTL so we don't rescan the entire catalog on every request.
// The catalog is 4,500+ products, so this avoids three full-collection scans
// per page load / filter change.
const FACET_TTL_MS = 5 * 60 * 1000;
let facetCache: { at: number; categories: string[]; brands: string[]; ageGroups: string[] } | null =
  null;

async function getFacets() {
  const now = Date.now();
  if (facetCache && now - facetCache.at < FACET_TTL_MS) {
    return facetCache;
  }
  const [categories, brands, ageGroups] = await Promise.all([
    Product.distinct("category"),
    Product.distinct("brand"),
    Product.distinct("ageGroup"),
  ]);
  facetCache = { at: now, categories, brands, ageGroups };
  return facetCache;
}

function buildFilterQuery(filters: ReturnType<typeof productFilterSchema.parse>) {
  const query: Record<string, unknown> = {};
  if (filters.category) query.category = filters.category;
  if (filters.brand) query.brand = filters.brand;
  if (filters.ageGroup) query.ageGroup = filters.ageGroup;
  if (filters.stockStatus) query.stockStatus = filters.stockStatus;
  if (filters.featured !== undefined) query.featured = filters.featured;
  if (filters.newArrival !== undefined) query.newArrival = filters.newArrival;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {
      ...(filters.minPrice !== undefined ? { $gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { $lte: filters.maxPrice } : {}),
    };
  }
  return query;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const filters = productFilterSchema.parse(params);
    const cardView = req.nextUrl.searchParams.get("view") === "card";
    const query = buildFilterQuery(filters);

    // Keep Shop listing queries lean. Product detail and admin requests still
    // receive the full document by omitting `view=card`.
    const cardProjection =
      "name slug price compareAtPrice category brand ageGroup stock stockStatus images featured newArrival sku searchText";

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name: { name: 1 },
    };
    const sort = sortMap[filters.sort];

    let pageItems;
    let total: number;

    const q = filters.q?.trim();

    if (q) {
      // Narrow candidates in DB first (avoid loading entire catalog)
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchQuery = {
        ...query,
        $or: [
          { name: { $regex: escaped, $options: "i" } },
          { sku: { $regex: escaped, $options: "i" } },
          { brand: { $regex: escaped, $options: "i" } },
          { category: { $regex: escaped, $options: "i" } },
          { searchText: { $regex: escaped, $options: "i" } },
        ],
      };

      let candidates = await Product.find(searchQuery)
        .sort(sort)
        .limit(400)
        .select(cardView ? cardProjection : {})
        .lean();

      // Typo-tolerant pass on the narrowed set
      if (candidates.length > 0) {
        const fuse = new Fuse(candidates, {
          keys: ["name", "brand", "category", "sku", "searchText"],
          threshold: 0.4,
          ignoreLocation: true,
        });
        const fused = fuse.search(q).map((r) => r.item);
        if (fused.length) candidates = fused;
      } else {
        // Fallback: broader fuzzy over a capped newest set
        const pool = await Product.find(query)
          .sort(sort)
          .limit(800)
          .select(cardView ? cardProjection : {})
          .lean();
        const fuse = new Fuse(pool, {
          keys: ["name", "brand", "category", "sku", "searchText"],
          threshold: 0.45,
          ignoreLocation: true,
        });
        candidates = fuse.search(q).map((r) => r.item);
      }

      total = candidates.length;
      const start = (filters.page - 1) * filters.limit;
      pageItems = candidates.slice(start, start + filters.limit);
    } else {
      total = await Product.countDocuments(query);
      pageItems = await Product.find(query)
        .sort(sort)
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .select(cardView ? cardProjection : {})
        .lean();
    }

const { categories, brands, ageGroups } = await getFacets();

    const response = NextResponse.json({
      products: cardView
        ? pageItems.map((product) => ({
            _id: String(product._id),
            name: product.name,
            slug: product.slug,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            category: product.category,
            brand: product.brand,
            ageGroup: product.ageGroup,
            stock: product.stock,
            stockStatus: product.stockStatus,
            // Cards render only the first image. The full gallery remains on
            // the product-detail response.
            images: product.images?.slice(0, 1) || [],
            featured: product.featured,
            newArrival: product.newArrival,
            sku: product.sku,
          }))
        : pageItems,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit) || 1,
      },
      facets: { categories, brands, ageGroups },
    });
    // This response contains public catalog data only. CDN caching avoids
    // repeated identical database reads while still refreshing quickly.
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return response;
  } catch (error) {
    console.error("GET /api/products", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    if (!body.name || body.price === undefined) {
      return NextResponse.json(
        { error: "name and price are required" },
        { status: 400 }
      );
    }

    const baseSlug = body.slug || makeSlug(body.name);
    let slug = baseSlug;
    let slugCounter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    const featured = Boolean(body.featured);
    const newArrival = Boolean(body.newArrival);
    const price = Math.round(Number(body.price) * 100) / 100;
    const product = await Product.create({
      name: body.name,
      slug,
      description: body.description || "",
      price,
      compareAtPrice: body.compareAtPrice ? Math.round(Number(body.compareAtPrice) * 100) / 100 : undefined,
      category: body.category || "Toys",
      brand: body.brand || "Generic",
      ageGroup: body.ageGroup || "All Ages",
      stock: Number(body.stock ?? 10),
      images: Array.isArray(body.images)
        ? body.images.map((img: string) => normalizeImagePath(String(img))).filter(Boolean)
        : [],
      specs: body.specs || {},
      featured,
      // Enforce mutual exclusivity: a product is either Featured or New Arrival
      newArrival: newArrival && !featured,
      sku: body.sku || `SKU-${Date.now()}`,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("POST /api/products", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    );
  }
}
