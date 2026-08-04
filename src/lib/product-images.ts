import { existsSync, readdirSync } from "fs";
import path from "path";

/** Catalog photos live here — commit to GitHub with the repo. */
export const PRODUCT_IMAGES_DIR = path.join(process.cwd(), "public", "images");
export const PRODUCT_IMAGES_PUBLIC_PREFIX = "/images";

const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".JPG", ".JPEG", ".PNG", ".WEBP", ".GIF"];

let cachedFiles: Map<string, string> | null = null;

/** Map lowercase basename (with + without ext) → actual filename on disk */
function listImageFiles(): Map<string, string> {
  if (cachedFiles) return cachedFiles;
  const map = new Map<string, string>();
  try {
    if (!existsSync(PRODUCT_IMAGES_DIR)) {
      cachedFiles = map;
      return map;
    }
    for (const name of readdirSync(PRODUCT_IMAGES_DIR)) {
      if (name.startsWith(".")) continue;
      const ext = path.extname(name).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) continue;
      map.set(name.toLowerCase(), name);
      map.set(path.basename(name, path.extname(name)).toLowerCase(), name);
    }
  } catch {
    // folder missing / unreadable
  }
  cachedFiles = map;
  return map;
}

/** Clear cache between Excel uploads so new files are picked up */
export function clearProductImageCache() {
  cachedFiles = null;
}

function toPublicUrl(filename: string) {
  return `${PRODUCT_IMAGES_PUBLIC_PREFIX}/${filename}`;
}

/**
 * Turn an Excel cell value into a public URL.
 * Accepts: full URL, /images/foo.jpg, images/foo.jpg, foo.jpg, foo
 */
export function resolveImageRef(ref: string): string | null {
  const raw = ref.trim().replace(/\\/g, "/");
  if (!raw) return null;

  // The storefront only renders secure remote images. Ignoring HTTP avoids
  // mixed-content failures on the live HTTPS site.
  if (/^https:\/\//i.test(raw)) return raw;
  if (/^http:\/\//i.test(raw)) return null;

  // Already a site path
  if (raw.startsWith("/images/")) return raw;
  if (raw.startsWith("/uploads/")) return raw;

  // Strip common folder prefixes from Excel paths
  let cleaned = raw
    .replace(/^public\//i, "")
    .replace(/^images\//i, "")
    .replace(/^image\//i, "")
    .replace(/^photos?\//i, "")
    .replace(/^product[-_]?images\//i, "");

  if (cleaned.startsWith("/")) cleaned = cleaned.slice(1);

  const files = listImageFiles();
  const lower = cleaned.toLowerCase();
  const base = path.basename(cleaned);
  const baseLower = base.toLowerCase();
  const stem = path.basename(base, path.extname(base)).toLowerCase();

  const hit =
    files.get(lower) ||
    files.get(baseLower) ||
    files.get(stem) ||
    null;

  if (hit) return toPublicUrl(hit);

  // File not on disk yet — still store expected public path if it looks like an image
  if (IMAGE_EXTS.some((e) => baseLower.endsWith(e.toLowerCase()))) {
    return toPublicUrl(base);
  }

  // Bare name without extension — try known extensions
  for (const ext of [".jpg", ".jpeg", ".png", ".webp", ".gif"]) {
    const found = files.get(`${stem}${ext}`);
    if (found) return toPublicUrl(found);
  }

  // Store as /images/{stem}.jpg so adding the file later works after re-upload
  return toPublicUrl(`${stem}.jpg`);
}

/** Find photo(s) in public/images whose filename starts with or equals the SKU */
export function imagesForSku(sku: string): string[] {
  const key = sku.trim().toLowerCase();
  if (!key) return [];
  const files = listImageFiles();
  const matches: string[] = [];

  for (const [lookup, filename] of files) {
    // only use entries that include extension (avoid double from stem map)
    if (!path.extname(lookup)) continue;
    const stem = path.basename(filename, path.extname(filename)).toLowerCase();
    if (stem === key || stem.startsWith(`${key}-`) || stem.startsWith(`${key}_`)) {
      const url = toPublicUrl(filename);
      if (!matches.includes(url)) matches.push(url);
    }
  }

  return matches.sort();
}

/**
 * Resolve Excel image cells + optional SKU auto-match from public/images.
 */
export function resolveProductImages(
  excelImages: string[],
  sku: string
): string[] {
  const fromExcel = excelImages
    .map(resolveImageRef)
    .filter((u): u is string => Boolean(u));

  if (fromExcel.length) {
    return [...new Set(fromExcel)];
  }

  return imagesForSku(sku);
}
