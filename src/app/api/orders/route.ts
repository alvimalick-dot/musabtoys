import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getAdminSession } from "@/lib/auth";
import { orderStatusSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const status = req.nextUrl.searchParams.get("status");
    const query = status ? { status } : {};

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { orderId, ...rest } = body;
    const parsed = orderStatusSchema.parse(rest);

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (parsed.status) update.status = parsed.status;
    if (parsed.courierName !== undefined) {
      update.courierName = parsed.courierName.trim();
    }
    if (parsed.trackingNumber !== undefined) {
      update.trackingNumber = parsed.trackingNumber.trim();
    }

    if (!Object.keys(update).length) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(orderId, update, { new: true });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update order" },
      { status: 400 }
    );
  }
}
