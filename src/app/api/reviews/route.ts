import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Review } from "@/models/Review";
import { Product } from "@/models/Product";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/security";
import { z } from "zod";

export const dynamic = "force-dynamic";

const reviewSchema = z.object({
  productSlug: z.string().min(1),
  authorName: z.string().min(2).max(60),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(5).max(1000),
});

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  const all = req.nextUrl.searchParams.get("all") === "true";

  // Admin view — list every review (pending + approved). Requires admin.
  if (all) {
    const session = await requireAdmin();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    return NextResponse.json({ reviews });
  }

  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  await connectDB();
  const reviews = await Review.find({ productSlug: slug, approved: true })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
  return NextResponse.json({
    reviews,
    average: Math.round(avg * 10) / 10,
    count: reviews.length,
  });
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(`review:${clientIp(req)}`, 10, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many reviews. Try later." }, { status: 429 });
  }

  try {
    const body = reviewSchema.parse(await req.json());
    await connectDB();
    const product = await Product.findOne({ slug: body.productSlug });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const review = await Review.create({
      productId: product._id,
      productSlug: product.slug,
      authorName: body.authorName,
      rating: body.rating,
      comment: body.comment,
      // New reviews are hidden until an admin approves them.
      approved: false,
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}
