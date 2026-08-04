import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Coupon } from "@/models/Coupon";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  code: z.string().min(3),
  type: z.enum(["percent", "fixed"]),
  value: z.coerce.number().min(0),
  minOrder: z.coerce.number().min(0).default(0),
  maxUses: z.coerce.number().min(0).default(0),
  active: z.boolean().default(true),
}).refine((coupon) => coupon.type !== "percent" || coupon.value <= 100, {
  message: "Percentage coupons cannot exceed 100%",
  path: ["value"],
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await connectDB();
    const body = createSchema.parse(await req.json());
    const coupon = await Coupon.create({
      ...body,
      code: body.code.toUpperCase(),
    });
    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}

/** Validate a coupon for checkout (public) */
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { code, subtotal } = await req.json();
    const coupon = await Coupon.findOne({
      code: String(code || "").toUpperCase(),
      active: true,
    });
    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon" }, { status: 404 });
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: "Coupon expired" }, { status: 400 });
    }
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Coupon fully used" }, { status: 400 });
    }
    if (subtotal < coupon.minOrder) {
      return NextResponse.json(
        { error: `Minimum order PKR ${coupon.minOrder}` },
        { status: 400 }
      );
    }
    const discount =
      coupon.type === "percent"
        ? Math.min(Math.round((subtotal * coupon.value) / 100), subtotal)
        : Math.min(coupon.value, subtotal);
    return NextResponse.json({
      code: coupon.code,
      discount,
      type: coupon.type,
      value: coupon.value,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}
