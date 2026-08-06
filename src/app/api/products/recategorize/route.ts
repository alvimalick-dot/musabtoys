import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { getAdminSession } from "@/lib/auth";
import { inferAgeGroup, inferCategory } from "@/lib/categorize";
import { safeErrorMessage } from "@/lib/security";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Re-tag products that are still Generic/Toys/All Ages using name keywords */
export async function POST() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const products = await Product.find({
      $or: [
        { category: "Toys" },
        { brand: "Generic" },
        { ageGroup: "All Ages" },
      ],
    }).select("name category brand ageGroup");

    let updated = 0;
    for (const p of products) {
      const category = inferCategory(p.name);
      const ageGroup = inferAgeGroup(p.name);
      let changed = false;
      if (p.category === "Toys" && category !== "Toys") {
        p.category = category;
        changed = true;
      }
      if (p.ageGroup === "All Ages" && ageGroup !== "All Ages") {
        p.ageGroup = ageGroup;
        changed = true;
      }
      if (changed) {
        await p.save();
        updated++;
      }
    }

return NextResponse.json({
      success: true,
      scanned: products.length,
      updated,
      message: `Scanned ${products.length} products, updated ${updated} categories/ages from names.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorMessage(error, "Recategorize failed") },
      { status: 500 }
    );
  }
}
