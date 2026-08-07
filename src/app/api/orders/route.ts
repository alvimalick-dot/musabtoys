import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { getAdminSession } from "@/lib/auth";
import { orderStatusSchema } from "@/lib/validators";
import { sendFeedbackEmail, buildShippedEmail, sendEmail } from "@/lib/notify";
import { safeErrorMessage } from "@/lib/security";

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

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .select("+feedbackRequested")
      .lean();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorMessage(error, "Failed to fetch orders") },
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

    // When the order is marked shipped OR courier/tracking details are first
    // entered, send a one-time "shipped" email to the customer (guarded by
    // shippedEmailSent so admins can edit tracking without spamming).
    let shippedEmailSent = false;
    const becameShipped =
      parsed.status === "shipped" ||
      (parsed.trackingNumber !== undefined && parsed.trackingNumber.trim().length > 0) ||
      (parsed.courierName !== undefined && parsed.courierName.trim().length > 0);
    if (becameShipped && order.customer.email && !order.shippedEmailSent) {
      try {
        const { emailSubject, emailText, emailReact } = buildShippedEmail({
          orderNumber: order.orderNumber,
          customerName: order.customer.name,
          courierName: order.courierName,
          trackingNumber: order.trackingNumber,
        });
        shippedEmailSent = await sendEmail({
          to: order.customer.email,
          subject: emailSubject,
          text: emailText,
          react: emailReact,
        });
        order.shippedEmailSent = shippedEmailSent;
        await order.save();
      } catch (err) {
        console.error("Shipped email failed for", order.orderNumber, err);
        shippedEmailSent = false;
      }
    }

    // When an order transitions to "delivered" for the first time,
    // send a one-time feedback-request email to the customer.
    let feedbackSent = false;
    if (
      parsed.status === "delivered" &&
      !order.feedbackRequested &&
      order.customer.email
    ) {
      order.feedbackRequested = true;
      order.status = "delivered";
      await order.save();

      feedbackSent = await sendFeedbackEmail({
        email: order.customer.email,
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        items: order.items.map((i: { name: string; slug?: string }) => ({
          name: i.name,
          slug: i.slug,
        })),
      });
    }

return NextResponse.json({ order, feedbackSent });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorMessage(error, "Failed to update order") },
      { status: 400 }
    );
  }
}
