import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function mimeToDataUri(buffer: Buffer, mimeType?: string): string {
  const base64 = buffer.toString("base64");
  const mime = mimeType && mimeType.startsWith("image/") ? mimeType : "image/jpeg";
  return `data:${mime};base64,${base64}`;
}

export async function uploadImage(
  file: Buffer | string,
  mimeType?: string,
  folder = "karachi-toys"
): Promise<{ url: string; publicId: string }> {
  const uploadSource =
    typeof file === "string"
      ? file
      : mimeToDataUri(file, mimeType);

  const result = await cloudinary.uploader.upload(uploadSource, {
    folder,
    format: "webp",
    transformation: [{ quality: "auto", fetch_format: "webp" }],
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export { cloudinary };

