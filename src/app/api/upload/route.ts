import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
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
async function normalizeImage(buffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(buffer).metadata();
  const width = metadata.width || TARGET_WIDTH;
  const height = metadata.height || TARGET_HEIGHT;

  // If the image is already smaller than target on both axes, just
  // convert to JPEG + strip metadata without upscaling.
  if (width <= TARGET_WIDTH && height <= TARGET_HEIGHT) {
    return sharp(buffer)
      .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
      .withMetadata({ orientation: undefined }) // strip EXIF orientation
      .toBuffer();
  }

  // Resize to fit within the box, maintaining aspect ratio.
  return sharp(buffer)
    .resize({
      width: TARGET_WIDTH,
      height: TARGET_HEIGHT,
      fit: "inside", // "inside" preserves aspect ratio, no cropping
      withoutReduction: false, // always shrink to fit
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .withMetadata({ orientation: undefined })
    .toBuffer();
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

    // Try Cloudinary first; fallback to local if it fails
    if (hasCloudinary()) {
      try {
        // Cloudinary auto-resize via transformation in uploadImage
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

    // Local fallback — saves under /public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    await writeFile(path.join(uploadsDir, filename), normalizedBuffer);

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
