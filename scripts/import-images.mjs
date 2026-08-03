#!/usr/bin/env node
/**
 * Offline Cloudinary image sync script for large catalogs (3,000+ rows).
 *
 * Reads an Excel catalog, resolves each product's local image(s) in public/images/,
 * uploads them to Cloudinary (idempotent via SKU-derived public_id), and updates
 * MongoDB with the permanent CDN URLs.
 *
 * Run (from the project root):
 *   node scripts/import-images.mjs --excel catalog.xlsx
 *   node scripts/import-images.mjs --backfill                 # re-sync existing products
 *   node scripts/import-images.mjs --excel catalog.xlsx --limit 500 --concurrency 5
 *
 * Flags:
 *   --excel <path>       Excel file (.xlsx/.xls/.csv) to import
 *   --backfill           Scan existing DB products with /images/... URLs and sync them
 *   --limit <n>          Only process the first n rows
 *   --concurrency <n>    Parallel Cloudinary uploads (default 5)
 *   --resume             Skip rows already marked done in the state file
 *   --force              Re-upload even if already synced (overrides idempotency)
 *   --state <path>       State/resume file (default .cloudinary-sync-state.json)
 *   --failures <path>    CSV of failed rows (default import-failures.csv)
 *
 * Requires env vars: MONGODB_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
 * CLOUDINARY_API_SECRET (load from .env.local automatically).
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ---- Load .env.local (plain KEY=VALUE, tolerant of values containing =) ----
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnv();

// ---- Parse CLI args ----
const args = process.argv.slice(2);
function flag(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : undefined;
}
function booleanFlag(name) {
  return args.includes(`--${name}`);
}

const EXCEL = flag("excel");
const BACKFILL = booleanFlag("backfill");
const LIMIT = flag("limit") ? Number(flag("limit")) : undefined;
const CONCURRENCY = flag("concurrency") ? Number(flag("concurrency")) : 5;
const RESUME = booleanFlag("resume");
const FORCE = booleanFlag("force");
const STATE_FILE = flag("state") || path.join(__dirname, "..", ".cloudinary-sync-state.json");
const FAILURES_FILE = flag("failures") || path.join(__dirname, "..", "import-failures.csv");

if (!EXCEL && !BACKFILL) {
  console.error(
    "Usage: node scripts/import-images.mjs --excel catalog.xlsx  OR  --backfill"
  );
  process.exit(1);
}

// ---- Dependencies (already installed: xlsx, cloudinary, mongoose) ----
const cloudinary = require("cloudinary").v2;
const XLSX = require("xlsx");
const mongoose = require("mongoose");

const CLOUDINARY_FOLDER = "karachi-toys/products";
const PRODUCT_IMAGES_DIR = path.join(__dirname, "..", "public", "images");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function assertEnv() {
  const cfg = {
    MONGODB_URI: process.env.MONGODB_URI,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  };
  const missing = Object.entries(cfg).filter(([, v]) => !v);
  if (missing.length) {
    console.error("Missing env vars:", missing.map(([k]) => k).join(", "));
    console.error("Add them to .env.local (or export them) and re-run.");
    process.exit(1);
  }
}

// ---- State / resume helpers ----
function loadState() {
  if (!existsSync(STATE_FILE)) return { done: {} };
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { done: {} };
  }
}
function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ---- Sanitize a value into a stable public_id ----
function publicIdFor(fileName, sku, index) {
  const base = (sku || path.basename(fileName, path.extname(fileName)) || "photo")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return index > 0 ? `${base}-${index}` : base;
}

// ---- Resolve an Excel image cell to a local file path (or remote URL) ----
function resolveLocalFile(ref) {
  const raw = String(ref || "").trim().replace(/\\/g, "/");
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return null; // remote URL — skip (kept as-is upstream)
  let cleaned = raw
    .replace(/^public\//i, "")
    .replace(/^images\//i, "")
    .replace(/^image\//i, "")
    .replace(/^photos?\//i, "")
    .replace(/^product[-_]?images\//i, "");
  if (cleaned.startsWith("/")) cleaned = cleaned.slice(1);
  const candidates = [
    path.join(PRODUCT_IMAGES_DIR, cleaned),
    path.join(PRODUCT_IMAGES_DIR, path.basename(cleaned)),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  // try extension-less with common extensions
  const stem = path.basename(cleaned, path.extname(cleaned));
  for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".gif"]) {
    const p = path.join(PRODUCT_IMAGES_DIR, `${stem}${ext}`);
    if (existsSync(p)) return p;
  }
  return null;
}

// ---- Upload a single file to Cloudinary (idempotent via public_id) ----
async function uploadToCloudinary(filePath, publicId, retries = 3) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: CLOUDINARY_FOLDER,
        public_id: publicId,
        transformation: [{ quality: "auto", fetch_format: "webp" }],
      });
      return { url: result.secure_url, publicId: result.public_id };
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const wait = 1000 * Math.pow(2, attempt - 1);
        console.log(`  retry ${attempt}/${retries} in ${wait}ms…`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  throw lastErr;
}

// ---- Map an Excel row to a product record (mirrors src/lib/excel-map.ts) ----
function norm(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, "");
}
const ALIASES = {
  name: "name", productname: "name", product: "name", itemname: "name", item: "name",
  title: "name", toyname: "name", producttitle: "name",
  sku: "sku", productsku: "sku", productid: "sku", productcode: "sku", itemcode: "sku",
  itemid: "sku", code: "sku", barcode: "sku", id: "sku",
  price: "price", retailprice: "price", saleprice: "price", sellingprice: "price",
  unitprice: "price", amount: "price", cost: "price", rate: "price", pkr: "price", rs: "price",
  image: "images", imageurl: "images", imageurls: "images", imagepath: "images",
  imagefile: "images", imagename: "images", filename: "images", photo: "images",
  photos: "images", picture: "images", pic: "images", img: "images",
};

function mapRow(raw) {
  const headers = Object.keys(raw);
  const map = new Map();
  for (const h of headers) {
    const field = ALIASES[norm(h)];
    if (field && !map.has(field)) map.set(field, h);
  }
  const get = (f) => (map.has(f) ? raw[map.get(f)] : undefined);
  const name = get("name") != null ? String(get("name")).trim() : "";
  const sku = get("sku") != null ? String(get("sku")).trim() : "";
  const price = get("price");
  const images = get("images")
    ? String(get("images"))
        .split(/[,|;]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  return { name, sku, price, images };
}

// ---- Process a single product row: upload images + update DB ----
async function processRow(state, row, rowNum) {
  const key = row.sku || row.name || `row-${rowNum}`;
  if (RESUME && state.done[key]) {
    return { key, status: "skipped" };
  }
  if (!row.images.length) {
    state.done[key] = true;
    return { key, status: "no-images" };
  }

  const syncedUrls = [];
  let failed = 0;
  for (let i = 0; i < row.images.length; i++) {
    const ref = row.images[i];
    const filePath = resolveLocalFile(ref);
    if (!filePath) {
      // remote URL or unresolvable — keep as-is
      syncedUrls.push(ref);
      continue;
    }
    const publicId = publicIdFor(filePath, row.sku, i);
    try {
      const { url } = await uploadToCloudinary(filePath, publicId, FORCE ? 0 : 3);
      syncedUrls.push(url);
    } catch (err) {
      failed++;
      console.error(`  ✗ upload fail for ${ref}: ${err.message}`);
      syncedUrls.push(`/images/${path.basename(filePath)}`);
    }
  }

  // Update MongoDB product images
  if (row.sku) {
    const filter = { sku: row.sku };
    const update = { $set: { images: syncedUrls } };
    await mongoose.connection.collection("products").updateOne(filter, update);
  }

  state.done[key] = true;
  return { key, status: failed ? "partial" : "synced", syncedUrls };
}

// ---- Main ----
async function main() {
  assertEnv();
  const state = loadState();

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log("📦 Connected to MongoDB");

  const rows = [];
  if (EXCEL) {
    const wb = XLSX.readFile(EXCEL);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true });
    rows.push(...rawRows.map((r, i) => ({ ...mapRow(r), rowNum: i + 2 })));
  } else if (BACKFILL) {
    const docs = await mongoose.connection
      .collection("products")
      .find({ images: { $regex: "^/images/" } })
      .limit(LIMIT || 0)
      .toArray();
    for (const d of docs) {
      rows.push({
        name: d.name || "",
        sku: d.sku || "",
        price: d.price,
        images: Array.isArray(d.images) ? d.images : [],
        rowNum: 0,
      });
    }
  }

  if (LIMIT) rows.splice(LIMIT);
  console.log(`📄 ${rows.length} rows to process`);

  const start = Date.now();
  let synced = 0;
  let partial = 0;
  let noImages = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  // Simple concurrency-limited runner
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (rows.length) {
      const row = rows.shift();
      if (!row) break;
      try {
        const res = await processRow(state, row, row.rowNum);
        if (res.status === "synced") synced++;
        else if (res.status === "partial") partial++;
        else if (res.status === "no-images") noImages++;
        else skipped++;
        process.stdout.write(
          `\r  done: ${synced + partial + noImages + skipped} / ${rows.length + synced + partial + noImages + skipped}`
        );
      } catch (err) {
        failed++;
        failures.push({ row: row.rowNum, sku: row.sku, error: err.message });
        console.error(`\n  ✗ row failed: ${err.message}`);
      }
    }
  });
  await Promise.all(workers);

  saveState(state);

  // Write failure CSV
  if (failures.length) {
    const csv = ["sku,row,error", ...failures.map((f) => `"${[f.sku ?? "", f.row, f.error].join('","')}"`)].join("\n");
    writeFileSync(FAILURES_FILE, csv);
    console.log(`\n⚠️  ${failures.length} failures written to ${FAILURES_FILE}`);
  }

  const secs = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n✅ Done");
  console.log("  synced:", synced);
  console.log("  partial:", partial);
  console.log("  no-images:", noImages);
  console.log("  skipped:", skipped);
  console.log("  failed:", failed);
  console.log(`  time: ${secs}s`);
  console.log(`\nState saved to ${STATE_FILE}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
