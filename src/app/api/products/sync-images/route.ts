import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getAdminSession } from "@/lib/auth";
import { syncProductImages, isLocalImageUrl, hasCloudinaryConfigured } from "@/lib/cloudinary-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** POST /api/products/sync-images — upload all local product images to Cloudinary */
export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!hasCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to .env.local" },
        { status: 400 }
      );
    }

    await connectDB();

    // Only fetch products that still have at least one local image URL
    const products = await Product.find({
      images: { $elemMatch: { $regex: "^(/images|/uploads|images/|uploads/|public/)" } },
    }).select("_id sku images").lean();

    if (!products.length) {
      return NextResponse.json({ message: "No products with local images found.", synced: 0, updated: 0 });
    }

    let totalSynced = 0;
    let totalUpdated = 0;

    for (const product of products) {
      const hasLocal = (product.images ?? []).some((u: string) => isLocalImageUrl(u));
      if (!hasLocal) continue;

      const { images: newImages, syncedCount } = await syncProductImages(
        product.images ?? [],
        product.sku || String(product._id)
      );

      if (syncedCount > 0) {
        await Product.updateOne({ _id: product._id }, { $set: { images: newImages } });
        totalSynced += syncedCount;
        totalUpdated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${totalSynced} image(s) across ${totalUpdated} product(s).`,
      synced: totalSynced,
      updated: totalUpdated,
    });
  } catch (error) {
    console.error("POST /api/products/sync-images", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}
