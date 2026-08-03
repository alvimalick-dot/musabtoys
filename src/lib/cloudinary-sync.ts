import { existsSync, readFileSync } from "fs";
import path from "path";
import { uploadImage, hasCloudinaryConfigured } from "@/lib/cloudinary";

export const CLOUDINARY_FOLDER = "karachi-toys/products";

/** A URL that is purely local (served from the repo's public/ folder). */
export function isLocalImageUrl(url: string): boolean {
  return (
    url.startsWith("/images/") ||
    url.startsWith("/uploads/") ||
    url.startsWith("images/") ||
    url.startsWith("uploads/") ||
    url.startsWith("public/")
  );
}

/** Convert a public URL path (e.g. /images/HW-001.jpg) to an absolute disk path. */
export function localUrlToFilePath(url: string): string | null {
  const cleaned = url.trim().replace(/\\/g, "/").replace(/^\/+/, "");
  // Turn "images/..." or "public/images/..." into public/images/...
  const rel = cleaned.startsWith("public/")
    ? cleaned.slice("public/".length)
    : cleaned;
  const abs = path.join(process.cwd(), "public", rel);
  return existsSync(abs) ? abs : null;
}

/**
 * Derive a stable Cloudinary public_id from a SKU so re-uploads are idempotent.
 * Sanitizes to Cloudinary-safe characters (alphanumeric, underscore, hyphen).
 */
export function publicIdForSku(sku: string, index = 0): string {
  const base = (sku || "photo")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return index > 0 ? `${base}-${index}` : base;
}

export interface SyncResult {
  url: string;
  publicId: string;
  /** true when the image was uploaded to Cloudinary; false when fell back to local path */
  synced: boolean;
  /** null when synced, otherwise a reason string */
  skipped?: string;
}

/**
 * Upload a single local image (public URL path) to Cloudinary and return the CDN URL.
 * Falls back to the original local path when Cloudinary isn't configured or the
 * upload fails — so import never breaks on a missing CDN.
 */
export async function syncLocalImageToCloudinary(
  localUrl: string,
  sku = "photo",
  index = 0
): Promise<SyncResult> {
  if (!hasCloudinaryConfigured()) {
    return { url: localUrl, publicId: "", synced: false, skipped: "cloudinary-not-configured" };
  }

  const filePath = localUrlToFilePath(localUrl);
  if (!filePath) {
    return { url: localUrl, publicId: "", synced: false, skipped: "file-not-found-on-disk" };
  }

  try {
    const buffer = readFileSync(filePath);
    const publicId = publicIdForSku(sku, index);
    const { url, publicId: returnedId } = await uploadImage(buffer, "image/jpeg", {
      folder: CLOUDINARY_FOLDER,
      publicId,
    });
    return { url, publicId: returnedId, synced: true };
  } catch (err) {
    console.warn(`syncLocalImageToCloudinary failed for ${localUrl}:`, err);
    return { url: localUrl, publicId: "", synced: false, skipped: "upload-failed" };
  }
}

/**
 * Map an array of image URLs for a product to Cloudinary CDN URLs.
 * - Full remote URLs (https://...) are kept as-is.
 * - Local /images/... paths are uploaded to Cloudinary.
 * Returns the new array (unchanged URLs + synced CDN URLs).
 */
export async function syncProductImages(
  images: string[],
  sku: string
): Promise<{ images: string[]; syncedCount: number }> {
  const out: string[] = [];
  let syncedCount = 0;
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (!img) continue;
    if (/^https?:\/\//i.test(img) || !isLocalImageUrl(img)) {
      out.push(img);
      continue;
    }
    const res = await syncLocalImageToCloudinary(img, sku, i);
    if (res.synced) syncedCount++;
    out.push(res.url);
  }
  return { images: out, syncedCount };
}

export { hasCloudinaryConfigured };
