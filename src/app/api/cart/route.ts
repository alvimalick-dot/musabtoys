import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { isValidObjectId, safeErrorMessage } from "@/lib/security";
import { z } from "zod";

export const dynamic = "force-dynamic";

const cartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.coerce.number().int().min(1),
    })
  ),
});

/** Validate cart items against live stock & prices */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = cartSchema.parse(await req.json());

    // Strictly validate every productId is a real ObjectId before it reaches
    // a Mongo query. Rejects injected operator objects / malformed ids.
    for (const item of body.items) {
      if (!isValidObjectId(item.productId)) {
        return NextResponse.json(
          { error: "One or more cart items reference an invalid product" },
          { status: 400 }
        );
      }
    }

    const ids = body.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: ids } }).lean();
    const map = new Map(products.map((p) => [String(p._id), p]));

    const validated = body.items.map((item) => {
      const product = map.get(item.productId);
      if (!product) {
        return {
          productId: item.productId,
          valid: false,
          error: "Product not found",
        };
      }
      if (product.stock < item.quantity) {
        return {
          productId: item.productId,
          valid: false,
          error: `Only ${product.stock} left in stock`,
          product,
          requested: item.quantity,
          stock: product.stock,
        };
      }
      return {
        productId: item.productId,
        valid: true,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] ?? "",
        stock: product.stock,
      };
    });

    const allValid = validated.every((v) => v.valid);
    const subtotal = validated
      .filter((v) => v.valid && "price" in v)
      .reduce((sum, v) => sum + (v.price as number) * (v.quantity as number), 0);

    return NextResponse.json({ valid: allValid, items: validated, subtotal });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorMessage(error, "Cart validation failed") },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST cart items to validate stock and prices",
  });
}
