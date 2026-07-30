import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { excelRowSchema } from "@/lib/validators";
import { makeSlug } from "@/lib/utils";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function normalizeKey(key: string) {
  return key.trim().toLowerCase().replace(/\s+/g, "");
}

const KEY_MAP: Record<string, string> = {
  name: "name",
  productname: "name",
  title: "name",
  sku: "sku",
  productsku: "sku",
  description: "description",
  desc: "description",
  price: "price",
  saleprice: "price",
  compareatprice: "compareAtPrice",
  mrp: "compareAtPrice",
  category: "category",
  brand: "brand",
  agegroup: "ageGroup",
  age: "ageGroup",
  stock: "stock",
  quantity: "stock",
  qty: "stock",
  images: "images",
  image: "images",
  imageurl: "images",
  featured: "featured",
  dimensions: "dimensions",
  battery: "battery",
  piececount: "pieceCount",
  pieces: "pieceCount",
  material: "material",
  weight: "weight",
};

function mapRow(raw: Record<string, unknown>) {
  const mapped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    const mappedKey = KEY_MAP[normalizeKey(key)];
    if (mappedKey && value !== undefined && value !== null && value !== "") {
      mapped[mappedKey] = value;
    }
  }
  return mapped;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Excel file is required" }, { status: 400 });
    }

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      return NextResponse.json(
        { error: "Only .xlsx, .xls, or .csv files are allowed" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (!rows.length) {
      return NextResponse.json({ error: "Excel sheet is empty" }, { status: 400 });
    }

    const results = {
      inserted: 0,
      updated: 0,
      failed: 0,
      errors: [] as { row: number; message: string }[],
    };

    const usedSlugs = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 2;
      try {
        const mapped = mapRow(rows[i]);
        const parsed = excelRowSchema.parse(mapped);

        let baseSlug = makeSlug(parsed.name);
        if (!baseSlug) baseSlug = `product-${Date.now()}-${i}`;

        let slug = baseSlug;
        let n = 1;
        while (usedSlugs.has(slug)) {
          slug = `${baseSlug}-${n++}`;
        }
        usedSlugs.add(slug);

        const images = parsed.images
          ? parsed.images
              .split(/[,|]/)
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        const specs: Record<string, string | number> = {};
        if (parsed.dimensions) specs.dimensions = parsed.dimensions;
        if (parsed.battery) specs.battery = parsed.battery;
        if (parsed.pieceCount) specs.pieceCount = parsed.pieceCount;
        if (parsed.material) specs.material = parsed.material;
        if (parsed.weight) specs.weight = parsed.weight;

        const payload = {
          name: parsed.name,
          slug,
          description: parsed.description,
          price: parsed.price,
          compareAtPrice: parsed.compareAtPrice,
          category: parsed.category,
          brand: parsed.brand,
          ageGroup: parsed.ageGroup,
          stock: parsed.stock,
          images,
          specs,
          featured: parsed.featured ?? false,
          sku: parsed.sku || `SKU-${slug.toUpperCase()}`,
        };

        const filter = parsed.sku
          ? { sku: parsed.sku }
          : { slug: payload.slug };

        const existing = await Product.findOne(filter);

        if (existing) {
          // Upsert by SKU — keep existing slug to avoid breaking SEO links
          existing.name = payload.name;
          existing.description = payload.description;
          existing.price = payload.price;
          if (payload.compareAtPrice !== undefined) {
            existing.compareAtPrice = payload.compareAtPrice;
          }
          existing.category = payload.category;
          existing.brand = payload.brand;
          existing.ageGroup = payload.ageGroup;
          existing.stock = payload.stock;
          if (images.length) existing.images = images;
          existing.specs = { ...existing.specs, ...specs };
          existing.featured = payload.featured;
          await existing.save();
          results.updated++;
        } else {
          // Ensure unique slug in DB
          let finalSlug = payload.slug;
          let attempt = 1;
          while (await Product.exists({ slug: finalSlug })) {
            finalSlug = `${payload.slug}-${attempt++}`;
          }
          await Product.create({ ...payload, slug: finalSlug });
          results.inserted++;
        }
      } catch (err) {
        results.failed++;
        results.errors.push({
          row: rowNum,
          message: err instanceof Error ? err.message : "Invalid row",
        });
      }
    }

    return NextResponse.json({
      success: true,
      summary: results,
      message: `Processed ${rows.length} rows: ${results.inserted} inserted, ${results.updated} updated, ${results.failed} failed.`,
    });
  } catch (error) {
    console.error("POST /api/excel-upload", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
