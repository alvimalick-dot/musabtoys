import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Order, IOrderItem } from "@/models/Order";
import { checkoutSchema } from "@/lib/validators";
import { calcShipping } from "@/lib/commerce";
import { buildOrderConfirmation, sendEmail } from "@/lib/notify";
import { Coupon } from "@/models/Coupon";
import { isValidObjectId, safeErrorMessage } from "@/lib/security";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KTS-${stamp}-${rand}`;
}

export async function POST(req: NextRequest) {
  let session: mongoose.ClientSession | null = null;

  try {
    // Rate-limit checkout by IP BEFORE touching the DB / stock / email.
    // This is the money-touching route: an unthrottled script could exhaust
    // stock on popular items or spam the Resend quota. Uses Upstash Redis
    // when configured (distributed across serverless instances); falls back
    // to in-memory for local dev.
    const limited = await rateLimit(
      `checkout:ip:${clientIp(req)}`,
      10,
      15 * 60 * 1000
    );
    if (!limited.ok) {
      return NextResponse.json(
        {
          error: `Too many checkout attempts. Please try again in ${limited.retryAfterSec}s.`,
        },
        { status: 429 }
      );
    }

    await connectDB();
    session = await mongoose.startSession();
    session.startTransaction();

    const body = checkoutSchema.parse(await req.json());

    if (
      body.paymentMethod !== "cod" &&
      process.env.ENABLE_ONLINE_PAYMENTS !== "true"
    ) {
      throw new Error(
        "Online payment is not available yet. Please choose Cash on Delivery."
      );
    }

    // Strict ObjectId validation before any Mongo query. Rejects injected
    // operator objects / malformed ids in the items array.
    for (const item of body.items) {
      if (!isValidObjectId(item.productId)) {
        throw new Error("One or more items reference an invalid product");
      }
    }

    const productIds = body.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(
      session
    );
    const map = new Map(products.map((p) => [String(p._id), p]));

    const orderItems = [];
    let subtotal = 0;

    for (const item of body.items) {
      const product = map.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      // Atomic stock decrement with overselling guard
      const updated = await Product.findOneAndUpdate(
        { _id: product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true, session }
      );

      if (!updated) {
        const fresh = await Product.findById(product._id).session(session);
        throw new Error(
          `"${product.name}" has only ${fresh?.stock ?? 0} left in stock`
        );
      }

      // findOneAndUpdate bypasses the Product model's validation hook, which
      // derives stockStatus. Save the updated document in this transaction so
      // shop filters and product-page availability text stay correct.
      await updated.save({ session });

      orderItems.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0],
      });

      subtotal += product.price * item.quantity;
    }

    // Discounts are calculated on the server. A browser may be modified, so
    // never use a discount amount submitted by the client.
    let discount = 0;
    let couponCode: string | undefined;
    if (body.couponCode?.trim()) {
      const code = body.couponCode.trim().toUpperCase();
      const now = new Date();
      const coupon = await Coupon.findOne({
        code,
        active: true,
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gte: now } },
        ],
      }).session(session);

      if (!coupon) throw new Error("Invalid or expired coupon");
      if (subtotal < coupon.minOrder) {
        throw new Error(`Minimum order PKR ${coupon.minOrder} for this coupon`);
      }

      // Reserve a redemption atomically so a limited coupon cannot be used
      // twice by simultaneous checkouts.
      const reserved = await Coupon.findOneAndUpdate(
        {
          _id: coupon._id,
          active: true,
          $or: [
            { maxUses: 0 },
            { $expr: { $lt: ["$usedCount", "$maxUses"] } },
          ],
        },
        { $inc: { usedCount: 1 } },
        { new: true, session }
      );
      if (!reserved) throw new Error("Coupon fully used");

      discount =
        coupon.type === "percent"
          ? Math.min(Math.round((subtotal * coupon.value) / 100), subtotal)
          : Math.min(coupon.value, subtotal);
      couponCode = coupon.code;
    }
    const shipping = calcShipping(subtotal, discount > 0);
    const total = Math.max(0, subtotal - discount) + shipping;

    const paymentStatus = "pending";

    const [order] = await Order.create(
      [
        {
          orderNumber: generateOrderNumber(),
          items: orderItems,
          customer: body.customer,
          paymentMethod: body.paymentMethod,
          paymentStatus,
          status: "pending",
          subtotal,
          shipping,
          total,
          notes: body.notes,
          couponCode,
          discount,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // ── Email confirmation (non-blocking, best-effort) ────────────────
    // The order is already placed & committed. If the email fails we still
    // return success so the customer isn't blocked — we confirm orders by
    // phone call anyway.
    let emailSent = false;
    if (body.customer.email) {
      try {
        const { emailSubject, emailText, emailReact } = buildOrderConfirmation({
          orderNumber: order.orderNumber,
          total: order.total,
          subtotal: order.subtotal,
          shipping: order.shipping,
          discount: order.discount || 0,
          paymentMethod: order.paymentMethod,
          customerName: order.customer.name,
          customerPhone: order.customer.phone,
          customerEmail: order.customer.email,
          customerAddress: order.customer.address,
          customerCity: order.customer.city,
          customerArea: order.customer.area,
          items: order.items.map((i: IOrderItem) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
          })),
        });

        emailSent = await sendEmail({
          to: order.customer.email,
          subject: emailSubject,
          text: emailText,
          react: emailReact,
        });

        // Record the send result so admin can see who didn't get an email.
        await Order.updateOne(
          { _id: order._id },
          { $set: { confirmationEmailSent: emailSent } }
        );
      } catch (emailError) {
        console.error("Confirmation email failed for", order.orderNumber, emailError);
        emailSent = false;
      }
    }

    // Payment gateway handoff stubs — wire credentials when ready
    let paymentRedirect: string | null = null;
    if (body.paymentMethod === "jazzcash") {
      paymentRedirect = `/checkout/payment?gateway=jazzcash&order=${order.orderNumber}`;
    } else if (body.paymentMethod === "payfast") {
      paymentRedirect = `/checkout/payment?gateway=payfast&order=${order.orderNumber}`;
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
      },
      paymentRedirect,
      message:
        body.paymentMethod === "cod"
          ? "Order placed. Pay cash on delivery."
          : "Order created. Complete payment to confirm.",
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error("POST /api/checkout", error);
    return NextResponse.json(
      { error: safeErrorMessage(error, "Checkout failed") },
      { status: 400 }
    );
  } finally {
    if (session) {
      session.endSession();
    }
  }
}
