import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { buildOrderConfirmation } from "@/lib/notify";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderNumber: z.string().min(5),
});

/**
 * Returns WhatsApp / track confirmation links for an order.
 * Optional Resend email when RESEND_API_KEY is set.
 */
export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    await connectDB();
    const order = await Order.findOne({
      orderNumber: body.orderNumber.toUpperCase(),
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const confirmation = buildOrderConfirmation({
      orderNumber: order.orderNumber,
      total: order.total,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      customerEmail: order.customer.email,
    });

    let emailSent = false;
    if (process.env.RESEND_API_KEY && order.customer.email) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from:
              process.env.RESEND_FROM ||
              "Karachi Toy Shop <onboarding@resend.dev>",
            to: [order.customer.email],
            subject: confirmation.emailSubject,
            text: confirmation.emailPreview,
          }),
        });
        emailSent = res.ok;
      } catch {
        emailSent = false;
      }
    }

    return NextResponse.json({
      ...confirmation,
      emailSent,
      // Never echo full address/phone back to arbitrary callers —
      // only confirmation channels keyed by order number.
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}
