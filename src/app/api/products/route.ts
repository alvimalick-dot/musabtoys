import { NextRequest, NextResponse } from "next/server";
import Fuse from "fuse.js";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { productFilterSchema } from "@/lib/validators";
import { makeSlug } from "@/lib/utils";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const filters = productFilterSchema.parse(params);

    const query: Record<string, unknown> = {};

    if (filters.category) query.category = filters.category;
    if (filters.brand) query.brand = filters.brand;
    if (filters.ageGroup) query.ageGroup = filters.ageGroup;
    if (filters.stockStatus) query.stockStatus = filters.stockStatus;
    if (filters.featured !== undefined) query.featured = filters.featured;

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {
        ...(filters.minPrice !== undefined ? { $gte: filters.minPrice } : {}),
        ...(filters.maxPrice !== undefined ? { $lte: filters.maxPrice } : {}),
      };
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name: { name: 1 },
    };

    let products = await Product.find(query)
      .sort(sortMap[filters.sort])
      .lean();

    if (filters.q?.trim()) {
      const fuse = new Fuse(products, {
        keys: ["name", "brand", "category", "description", "sku", "searchText"],
        threshold: 0.35,
        ignoreLocation: true,
      });
      products = fuse.search(filters.q.trim()).map((r) => r.item);
    }

    const total = products.length;
    const start = (filters.page - 1) * filters.limit;
    const pageItems = products.slice(start, start + filters.limit);

    const [categories, brands, ageGroups] = await Promise.all([
      Product.distinct("category"),
      Product.distinct("brand"),
      Product.distinct("ageGroup"),
    ]);

    return NextResponse.json({
      products: pageItems,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit) || 1,
      },
      facets: { categories, brands, ageGroups },
    });
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
    const slug = body.slug || makeSlug(body.name);

    const product = await Product.create({
      ...body,
      slug,
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
