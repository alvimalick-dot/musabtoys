import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/products/clear
 *
 * Removes ALL products from the database. Guarded by:
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

    return NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("DELETE /api/products/clear", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to clear products" },
      { status: 500 }
    );
  }
}
