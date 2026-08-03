import { readFileSync } from "fs";
import XLSX from "xlsx";
import { connectDB } from "@/lib/mongodb";
import { ImportJob } from "@/models/ImportJob";
import mongoose from "mongoose";
import { mapRow } from "./import-map";
import { syncProductImages } from "@/lib/cloudinary-sync";

/**
 * Process a single batch from the Excel file referenced by job.filePath.
 * Returns true when job is complete.
 */
export async function processImportBatch(jobId: string, batchSize = 20) {
  await connectDB();
  const job = await ImportJob.findById(jobId);
  if (!job) throw new Error("Import job not found");
  if (job.status === "done") return true;

  // Load workbook
  const wb = XLSX.readFile(job.filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true });

  const start = job.processed || 0;
  const end = Math.min(start + batchSize, rawRows.length);

  for (let i = start; i < end; i++) {
    const raw = rawRows[i];
    const row = mapRow(raw);
    try {
      // Sync images and update product by SKU
      const { images } = row;
      if (images && images.length && row.sku) {
        const res = await syncProductImages(images, row.sku);
        await mongoose.connection.collection("products").updateOne({ sku: row.sku }, { $set: { images: res.images } });
      }
      job.processed = (job.processed || 0) + 1;
    } catch (err) {
      job.errors.push({ row: i + 2, message: (err as Error).message });
      job.processed = (job.processed || 0) + 1;
    }
  }

  job.totalRows = rawRows.length;
  job.status = job.processed >= rawRows.length ? "done" : "processing";
  await job.save();
  return job.status === "done";
}
import * as XLSX from "xlsx";
import { Product } from "@/models/Product";
import type { ImportJob, ImportRow } from "@/models/ImportJob";
import { makeSlug } from "@/lib/utils";
import { detectColumns, mapExcelRow } from "@/lib/excel-map";
import { inferAgeGroup, inferCategory } from "@/lib/categorize";
import { resolveProductImages } from "@/lib/product-images";
import { syncProductImages } from "@/lib/cloudinary-sync";

export const DEFAULT_BATCH_SIZE = 20;

function stockStatus(stock: number) {
  if (stock <= 0) return "out_of_stock" as const;
  if (stock <= 5) return "low_stock" as const;
  return "in_stock" as const;
}

/** Parse an Excel/CSV buffer into mapped rows (mirrors the legacy route). */
export function parseExcel(buffer: Buffer): {
  mapped: ReturnType<typeof mapExcelRow>[];
  sheetName: string;
  warnings: string[];
  detected: Record<string, string>;
} {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  const rowsRaw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: true,
  });

  const sourceRows = rowsRaw.length ? rowsRaw : rows;
  const { headerMap, warnings, detected } = detectColumns(sourceRows);

  const mapped = sourceRows.map((r, i) => mapExcelRow(r, headerMap, i + 2));
  return {
    mapped,
    sheetName,
    warnings,
    detected: (detected || {}) as Record<string, string>,
  };
}

/** Convert a mapped row into a serializable plain object (for job storage). */
export function serializeMappedRow(
  mapped: ReturnType<typeof mapExcelRow>
): Record<string, unknown> | null {
  if ("error" in mapped) return null;
  return { ...mapped };
}

/** Build a Mongo upsert operation for a single mapped row (with Cloudinary sync). */
export async function buildProductOp(
  mapped: ReturnType<typeof mapExcelRow>,
  rowNum: number,
  usedSlugs: Set<string>
): Promise<{ op?: Parameters<typeof Product.bulkWrite>[0][number]; sku?: string; imagesSynced: number }> {
  if (!mapped || "error" in mapped) {
    return { imagesSynced: 0 };
  }

  const baseSlug = makeSlug(mapped.name) || `product-${rowNum}`;
  let slug = baseSlug;
  let n = 1;
  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${n++}`;
  }
  usedSlugs.add(slug);

  const localImages = resolveProductImages(mapped.images, mapped.sku);
  const { images, syncedCount } = await syncProductImages(localImages, mapped.sku);

  const payload: Record<string, unknown> = {
    name: mapped.name,
    description: mapped.description,
    price: mapped.price,
    compareAtPrice: mapped.compareAtPrice,
    category:
      mapped.category !== "Toys" ? mapped.category : inferCategory(mapped.name),
    brand: mapped.brand,
    ageGroup:
      mapped.ageGroup !== "All Ages" ? mapped.ageGroup : inferAgeGroup(mapped.name),
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
    sku: mapped.sku,
    searchText: [mapped.name, mapped.brand, mapped.category, mapped.sku]
      .filter(Boolean)
      .join(" "),
  };

  if (images.length) payload.images = images;

  return {
    op: {
      updateOne: {
        filter: { sku: mapped.sku },
        update: {
          $setOnInsert: { slug, images: images.length ? images : [] },
          $set: payload,
        },
        upsert: true,
      },
    },
    sku: mapped.sku,
    imagesSynced: syncedCount,
  };
}

/** Rehydrate a mapped row from the stored ImportRow.data (or row defaults). */
export function mappedFromImportRow(row: ImportRow): ReturnType<typeof mapExcelRow> {
  if (row.data && typeof row.data === "object") {
    const m = row.data as Record<string, unknown>;
    return {
      name: m.name ? String(m.name) : row.name,
      sku: m.sku ? String(m.sku) : row.sku,
      price: Number(m.price ?? 0),
      compareAtPrice: m.compareAtPrice
        ? Number(m.compareAtPrice)
        : undefined,
      category: m.category ? String(m.category) : "Toys",
      brand: m.brand ? String(m.brand) : "Generic",
      ageGroup: m.ageGroup ? String(m.ageGroup) : "All Ages",
      stock: Number(m.stock ?? 10),
      description: m.description ? String(m.description) : "",
      images: Array.isArray(m.images) ? (m.images as string[]) : [],
      featured: Boolean(m.featured),
      dimensions: m.dimensions ? String(m.dimensions) : undefined,
      battery: m.battery ? String(m.battery) : undefined,
      pieceCount: m.pieceCount ? Number(m.pieceCount) : undefined,
      material: m.material ? String(m.material) : undefined,
      weight: m.weight ? String(m.weight) : undefined,
    };
  }
  return {
    name: row.name,
    sku: row.sku,
    price: 0,
    category: "Toys",
    brand: "Generic",
    ageGroup: "All Ages",
    stock: 10,
    description: "",
    images: [],
    featured: false,
  };
}

/**
 * Process one batch of a job starting at `startIndex`.
 * Returns the count of rows processed and number of images synced.
 */
export async function processBatch(
  job: InstanceType<typeof ImportJob>,
  startIndex: number
): Promise<{ processed: number; imagesSynced: number }> {
  const batchSize = job.batchSize || DEFAULT_BATCH_SIZE;
  const slice = job.rows.slice(startIndex, startIndex + batchSize);
  if (!slice.length) return { processed: 0, imagesSynced: 0 };

  const usedSlugs = new Set<string>();
  const ops: Parameters<typeof Product.bulkWrite>[0] = [];
  let imagesSynced = 0;
  const rowUpdates: { index: number; success: boolean; error?: string }[] = [];

  for (const row of slice) {
    if (row.status === "success") continue; // resume safety
    const mapped = mappedFromImportRow(row);
    const res = await buildProductOp(mapped, row.row, usedSlugs);
    if (res.op) {
      ops.push(res.op);
      imagesSynced += res.imagesSynced;
      rowUpdates.push({ index: startIndex + slice.indexOf(row), success: true });
    } else {
      rowUpdates.push({
        index: startIndex + slice.indexOf(row),
        success: false,
        error: "Invalid row data",
      });
    }
  }

  if (ops.length) {
    await Product.bulkWrite(ops, { ordered: false });
  }

  // Update batch row statuses
  for (const ru of rowUpdates) {
    const row = job.rows[ru.index];
    if (row) {
      row.status = ru.success ? "success" : "error";
      if (ru.error) row.error = ru.error;
    }
  }

  return { processed: slice.length, imagesSynced };
}
