import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const trackSchema = z.object({
  orderNumber: z.string().min(5),
  phone: z.string().min(10),
});

function normalizePhone(p: string) {
  return p.replace(/\D/g, "").slice(-10);
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(`track:${clientIp(req)}`, 20, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many tracking attempts. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = trackSchema.parse(await req.json());
    await connectDB();

    const order = await Order.findOne({
      orderNumber: body.orderNumber.trim().toUpperCase(),
    }).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (normalizePhone(order.customer.phone) !== normalizePhone(body.phone)) {
      return NextResponse.json(
        { error: "Phone number does not match this order" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        total: order.total,
        shipping: order.shipping,
        items: order.items.map((i: { name: string; quantity: number; price: number }) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        customer: {
          name: order.customer.name,
          city: order.customer.city,
        },
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Tracking failed" },
      { status: 400 }
    );
  }
}
