import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getAdminSession } from "@/lib/auth";
import { syncProductImages, hasCloudinaryConfigured } from "@/lib/cloudinary-sync";

export const dynamic = "force-dynamic";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasCloudinaryConfigured()) return NextResponse.json({ error: "Cloudinary not configured" }, { status: 400 });

  await connectDB();
  const product = await Product.findById(params.id).select("_id sku images").lean();
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const { images: newImages, syncedCount } = await syncProductImages(product.images || [], product.sku || String(product._id));
  if (syncedCount > 0) {
    await Product.updateOne({ _id: product._id }, { $set: { images: newImages } });
  }

  return NextResponse.json({ success: true, synced: syncedCount, updated: syncedCount > 0 });
}
