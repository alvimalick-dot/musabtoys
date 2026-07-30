import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { StockAlert } from "@/models/StockAlert";
import { Product } from "@/models/Product";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  productSlug: z.string().min(1),
  phone: z.string().min(10),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(`stock-alert:${clientIp(req)}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = schema.parse(await req.json());
    await connectDB();
    const product = await Product.findOne({ slug: body.productSlug });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (product.stock > 0) {
      return NextResponse.json({ error: "Product is already in stock" }, { status: 400 });
    }

    await StockAlert.findOneAndUpdate(
      { productId: product._id, phone: body.phone },
      {
        productId: product._id,
        productSlug: product.slug,
        phone: body.phone,
        email: body.email || undefined,
        notified: false,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message:
        "Saved! WhatsApp will open so you can also message us about this toy.",
      whatsappHint: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}
