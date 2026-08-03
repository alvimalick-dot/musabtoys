import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { getAdminSession } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";
export const maxDuration = 30;
export const runtime = "nodejs";

// Target dimension — all product images are resized to this width while
// preserving aspect ratio. This keeps the shop grid uniform and organized.
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 1200; // max height (tall images get letterboxed)
const JPEG_QUALITY = 85;

function hasCloudinary() {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  return Boolean(
    name &&
      key &&
      secret &&
      !name.includes("your_cloud") &&
      !key.includes("your_key") &&
      !secret.includes("your_secret")
  );
}

/**
 * Resize + optimise an image buffer to a standard product photo.
 * - Scales to fit within TARGET_WIDTH × TARGET_HEIGHT (maintains aspect ratio)
 * - Converts to JPEG for consistent quality
 * - Strips EXIF metadata
 */
async function normalizeImage(input: Buffer): Promise<Buffer> {
  // Validate it is a real image first — throws if not
  const metadata = await sharp(input).metadata();
  if (!metadata.format) throw new Error("Unrecognised image format");

  const w = metadata.width ?? TARGET_WIDTH;
  const h = metadata.height ?? TARGET_HEIGHT;

  const pipeline = sharp(input).jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).withMetadata({ orientation: undefined });

  if (w > TARGET_WIDTH || h > TARGET_HEIGHT) {
    pipeline.resize({ width: TARGET_WIDTH, height: TARGET_HEIGHT, fit: "inside", withoutReduction: false });
  }

  return pipeline.toBuffer();
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Cap ~8MB
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image must be under 8MB" },
        { status: 400 }
      );
    }

    // Read raw buffer
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Normalize: resize + optimise to standard product photo
    const normalizedBuffer = await normalizeImage(rawBuffer);

    // 1. Vercel Blob — persistent cloud storage, survives deployments
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`, normalizedBuffer, {
          contentType: "image/jpeg",
          access: "public",
        });
        return NextResponse.json({
          url: blob.url,
          storage: "vercel-blob",
        });
      } catch (blobErr) {
        console.warn("Vercel Blob upload failed, trying Cloudinary:", blobErr);
        // fall through to Cloudinary below
      }
    }

    // 2. Cloudinary — persistent cloud storage
    if (hasCloudinary()) {
      try {
        const result = await uploadImage(normalizedBuffer, "image/jpeg");
        return NextResponse.json({
          url: result.url,
          publicId: result.publicId,
          storage: "cloudinary",
        });
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to local:", cloudErr);
        // fall through to local fallback below
      }
    }

    // 3. Local fallback — dev only; files won't persist on Vercel
    const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    // Filename is 100% server-generated — no user input involved
    const filename = `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}.jpg`;
    const dest = path.resolve(uploadsDir, filename);
    await writeFile(dest, normalizedBuffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      storage: "local",
      dimensions: { width: TARGET_WIDTH, height: TARGET_HEIGHT },
    });
  } catch (error) {
    console.error("upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
