import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadImageOptions {
  folder?: string;
  publicId?: string;
  /** Whether to re-encode as webp. Defaults to true. */
  webp?: boolean;
  /** Extra transformations to prepend. */
  transformations?: Array<Record<string, string | number | boolean>>;
  /** Currently-signed upload (requires explicit tags / eager fields as needed). */
  context?: Record<string, string>;
  tags?: string[];
}

function mimeToDataUri(buffer: Buffer, mimeType?: string): string {
  const base64 = buffer.toString("base64");
  const mime = mimeType && mimeType.startsWith("image/") ? mimeType : "image/jpeg";
  return `data:${mime};base64,${base64}`;
}

export function hasCloudinaryConfigured(): boolean {
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
 * Upload a file (Buffer or remote URL/path string) to Cloudinary.
 *
 * - Defaults to the `karachi-toys` folder and webp re-encoding (same as before).
 * - Supports a stable `publicId` for idempotent re-uploads (SKU-based sync).
 * - Passing `webp: false` preserves the original format (useful for GIF thumbs etc.).
 */
export async function uploadImage(
  file: Buffer | string,
  mimeType?: string,
  options: UploadImageOptions = {}
): Promise<{ url: string; publicId: string }> {
  const {
    folder = "karachi-toys",
    publicId,
    webp = true,
    transformations = [],
    context,
    tags,
  } = options;

  const uploadSource = typeof file === "string" ? file : mimeToDataUri(file, mimeType);
  const transformation = [
    ...transformations,
    ...(webp
      ? [{ quality: "auto", fetch_format: "webp" }]
      : [{ quality: "auto" }]),
  ];

  const result = await cloudinary.uploader.upload(uploadSource, {
    folder,
    public_id: publicId,
    transformation,
    context: context
      ? Object.entries(context)
          .map(([k, v]) => `${k}=${v}`)
          .join("|")
      : undefined,
    tags,
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export { cloudinary };

