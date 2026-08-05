import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { makeSlug } from "@/lib/utils";
import { getAdminSession } from "@/lib/auth";
import { detectColumns, mapExcelRow } from "@/lib/excel-map";
import { inferAgeGroup, inferCategory } from "@/lib/categorize";
import {
  clearProductImageCache,
  resolveProductImages,
} from "@/lib/product-images";
import { syncProductImages, hasCloudinaryConfigured } from "@/lib/cloudinary-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function stockStatus(stock: number) {
  if (stock <= 0) return "out_of_stock" as const;
  if (stock <= 5) return "low_stock" as const;
  return "in_stock" as const;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized — please log in again" }, { status: 401 });
    }

    await connectDB();
    clearProductImageCache();

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
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    });

    // Also try raw numbers if prices came as strings badly
    const rowsRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: true,
    });

    if (!rows.length) {
      return NextResponse.json({ error: "Excel sheet is empty" }, { status: 400 });
    }

    const { headerMap, warnings, detected } = detectColumns(
      rowsRaw.length ? rowsRaw : rows
    );

    if (!headerMap.has("name") || !headerMap.has("price")) {
      return NextResponse.json(
        {
          error:
            "Could not detect product name and price columns. Add headers like ProductName + RetailPrice (any naming is fine).",
          headers: Object.keys(rows[0]),
          detected,
        },
        { status: 400 }
      );
    }

    const sourceRows = rowsRaw.length ? rowsRaw : rows;
    const results = {
      inserted: 0,
      updated: 0,
      failed: 0,
      imagesLinked: 0,
      errors: [] as { row: number; message: string }[],
    };

    const usedSlugs = new Set<string>();
    const ops: Parameters<typeof Product.bulkWrite>[0] = [];

    // The supplier sheet has no ProductID/SKU, so ProductName is the agreed
    // stable key used to find products to update.
    const names = sourceRows
      .map((r) => {
        const mapped = mapExcelRow(r, headerMap);
        return "error" in mapped ? null : mapped.name;
      })
      .filter((name): name is string => Boolean(name));

    const existing = await Product.find({ name: { $in: names } })
      .select("name slug")
      .lean();
    const existingByName = new Map(existing.map((p) => [p.name, p]));

    for (let i = 0; i < sourceRows.length; i++) {
      const rowNum = i + 2;
      const mapped = mapExcelRow(sourceRows[i], headerMap);
      if ("error" in mapped) {
        results.failed++;
        if (results.errors.length < 25) {
          results.errors.push({ row: rowNum, message: mapped.error });
        }
        continue;
      }

      const baseSlug = makeSlug(mapped.name) || `product-${rowNum}`;
      let slug = baseSlug;
      let n = 1;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${n++}`;
      }
      usedSlugs.add(slug);

      const images = resolveProductImages(mapped.images, mapped.sku);
      if (images.length) results.imagesLinked++;

      // Sync local images to Cloudinary if configured
      let finalImages = images;
      let cloudinarySynced = 0;
      if (images.length && hasCloudinaryConfigured()) {
        const { images: synced, syncedCount } = await syncProductImages(images, mapped.sku);
        finalImages = synced;
        cloudinarySynced = syncedCount;
        results.imagesLinked += cloudinarySynced;
      }

      const payload: Record<string, unknown> = {
        name: mapped.name,
        description: mapped.description,
        price: mapped.price,
        compareAtPrice: mapped.compareAtPrice,
        category:
          mapped.category !== "Toys"
            ? mapped.category
            : inferCategory(mapped.name),
        brand: mapped.brand,
        ageGroup:
          mapped.ageGroup !== "All Ages"
            ? mapped.ageGroup
            : inferAgeGroup(mapped.name),
        stock: mapped.stock,
        stockStatus: stockStatus(mapped.stock),
        specs: {
          ...(mapped.dimensions ? { dimensions: mapped.dimensions } : {}),
          ...(mapped.battery ? { battery: mapped.battery } : {}),
          ...(mapped.pieceCount ? { pieceCount: mapped.pieceCount } : {}),
          ...(mapped.material ? { material: mapped.material } : {}),
          ...(mapped.weight ? { weight: mapped.weight } : {}),
        },
        featured: mapped.featured,
        searchText: [mapped.name, mapped.brand, mapped.category]
          .filter(Boolean)
          .join(" "),
      };

      // Only set images when we resolved some — don't wipe existing photos
      if (finalImages.length) {
        payload.images = finalImages;
      }

      const found = existingByName.get(mapped.name);
      if (found) {
        ops.push({
          updateOne: {
            filter: { name: mapped.name },
            update: {
              $set: payload,
            },
          },
        });
        results.updated++;
      } else {
        ops.push({
          updateOne: {
            filter: { name: mapped.name },
            update: {
              $setOnInsert: {
                slug,
                sku: mapped.sku,
                images: finalImages.length ? finalImages : [],
              },
              $set: payload,
            },
            upsert: true,
          },
        });
        results.inserted++;
      }
    }

    // Bulk write in chunks of 500
    for (let i = 0; i < ops.length; i += 500) {
      const chunk = ops.slice(i, i + 500);
      await Product.bulkWrite(chunk, { ordered: false });
    }

    return NextResponse.json({
      success: true,
      sheet: sheetName,
      detectedColumns: detected,
      warnings: [
        ...warnings,
        hasCloudinaryConfigured()
          ? "Images uploaded to Cloudinary CDN."
          : "Photos: put files in public/images/ and list the filename in the Image column (or name the file after ProductID).",
      ],
      summary: {
        totalRows: sourceRows.length,
        inserted: results.inserted,
        updated: results.updated,
        failed: results.failed,
        imagesLinked: results.imagesLinked,
        errors: results.errors,
      },
      message: `Processed ${sourceRows.length} rows: ${results.inserted} inserted, ${results.updated} updated, ${results.imagesLinked} with photos, ${results.failed} failed.`,
    }, { headers: { "X-Deprecated-Route": "true", "X-Deprecated-Note": "Use /api/imports (resumable) instead" } });
  } catch (error) {
    console.error("POST /api/excel-upload", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
        hint: "If this mentions querySrv/ECONNREFUSED, restart npm run dev after updating .env.local",
      },
      { status: 500 }
    );
  }
}
