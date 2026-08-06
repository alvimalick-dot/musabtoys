import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getAdminSession } from "@/lib/auth";
import { safeErrorMessage } from "@/lib/security";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/products/clear
 *
 * Removes ALL products (and everything product-related, including the
 * featured / newArrival flags living on product documents) from the database.
 * Cached pages that surface products (homepage featured & new-arrival
 * sections, shop, and sitemap) are revalidated so they reset immediately.
 *
 * Guarded by:
 *  - an admin session (cookies)
 *  - an explicit `{ confirm: true }` body flag to prevent accidental wipes
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json().catch(() => ({}));
    if (body.confirm !== true) {
      return NextResponse.json(
        { error: "Missing confirmation. Send { confirm: true } to delete all products." },
        { status: 400 }
      );
    }

    const result = await Product.deleteMany({});

    // Purge cached pages that surface product data (homepage featured/new
    // arrival sections, shop, and sitemap) so they reset immediately after
    // the wipe instead of waiting for the revalidate window to expire.
    revalidatePath("/", "page");
    revalidatePath("/shop");
    revalidatePath("/sitemap.xml");

return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("DELETE /api/products/clear", error);
    return NextResponse.json(
      { error: safeErrorMessage(error, "Failed to clear products") },
      { status: 500 }
    );
  }
}
