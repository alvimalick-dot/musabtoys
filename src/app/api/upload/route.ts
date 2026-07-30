import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getAdminSession } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

function hasCloudinary() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET &&
      !process.env.CLOUDINARY_CLOUD_NAME.includes("your_cloud")
  );
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

    const buffer = Buffer.from(await file.arrayBuffer());

    if (hasCloudinary()) {
      const result = await uploadImage(buffer);
      return NextResponse.json({
        url: result.url,
        publicId: result.publicId,
        storage: "cloudinary",
      });
    }

    // Local fallback — saves under /public/uploads (works without Cloudinary)
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext =
      path.extname(file.name).toLowerCase() ||
      (file.type === "image/png" ? ".png" : ".jpg");
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)
      ? ext
      : ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;
    await writeFile(path.join(uploadsDir, filename), buffer);

    return NextResponse.json({
      url: `/uploads/${filename}`,
      storage: "local",
    });
  } catch (error) {
    console.error("upload", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
