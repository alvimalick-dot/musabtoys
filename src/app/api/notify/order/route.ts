import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order, IOrderItem } from "@/models/Order";
import { buildOrderConfirmation, sendEmail } from "@/lib/notify";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderNumber: z.string().min(5),
});

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

    // Skip if email already sent
    if (order.confirmationEmailSent) {
      return NextResponse.json({
        whatsappUrl: "",
        trackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/track?order=${order.orderNumber}`,
        emailSent: false,
        message: "Email already sent for this order",
      });
    }

    const confirmation = buildOrderConfirmation({
      orderNumber: order.orderNumber,
      total: order.total,
      subtotal: order.subtotal,
      shipping: order.shipping || 0,
      discount: order.discount,
      customerName: order.customer.name,
      customerPhone: order.customer.phone,
      customerEmail: order.customer.email,
      customerAddress: order.customer.address,
      customerCity: order.customer.city,
      items: (order.items as IOrderItem[]).map((item: IOrderItem) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
    });

    let emailSent = false;
    if (order.customer.email) {
      emailSent = await sendEmail({
        to: order.customer.email,
        subject: confirmation.emailSubject,
        text: confirmation.emailText,
        react: confirmation.emailReact,
      });
      // Mark email as sent
      if (emailSent) {
        await Order.updateOne(
          { _id: order._id },
          { confirmationEmailSent: true }
        );
      }
    }

    return NextResponse.json({
      whatsappUrl: confirmation.whatsappUrl,
      trackUrl: confirmation.trackUrl,
      emailSent,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 400 }
    );
  }
}
