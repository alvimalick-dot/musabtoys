import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order, IOrderItem } from "@/models/Order";
import { Customer } from "@/models/Customer";
import { buildOrderConfirmation, sendEmail } from "@/lib/notify";
import { getAdminSession } from "@/lib/auth";
import { getCustomerSession } from "@/lib/customer-auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { safeErrorMessage } from "@/lib/security";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderNumber: z.string().min(5),
});

export async function POST(req: NextRequest) {
  try {
    const limited = await rateLimit(`notify-order:${clientIp(req)}`, 20, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Try later." },
        { status: 429 }
      );
    }

    const body = schema.parse(await req.json());
    const orderNumber = body.orderNumber.toUpperCase();

    await connectDB();
    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization ------------------------------------------------
    // This endpoint returns PII (name, phone, address, email) and can trigger
    // emails. Only an admin, or the customer whose verified email matches the
    // order, may call it. Anything else is rejected -- never rely on the
    // obscurity of the order number.
    const adminSession = await getAdminSession();
    if (!adminSession) {
      const customerSession = await getCustomerSession();
      let customerEmail = "";
      if (customerSession?.customerId) {
        const customer = await Customer.findById(customerSession.customerId)
          .select("email")
          .lean();
        customerEmail = customer?.email?.trim().toLowerCase() || "";
      }
      const orderEmail = order.customer.email?.trim().toLowerCase() || "";
      if (!customerSession || customerEmail !== orderEmail) {
        // Return a generic 404 without leaking whether the order exists.
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
    }

    // Skip if email already sent
    if (order.confirmationEmailSent) {
      // The success page still needs the WhatsApp confirmation link even
      // though it must not send a duplicate email.
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
      return NextResponse.json({
        whatsappUrl: confirmation.whatsappUrl,
        trackUrl: confirmation.trackUrl,
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
      { error: safeErrorMessage(error, "Failed") },
      { status: 400 }
    );
  }
}
