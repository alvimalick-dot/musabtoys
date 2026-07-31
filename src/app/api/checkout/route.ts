import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { Order } from "@/models/Order";
import { checkoutSchema } from "@/lib/validators";
import { calcShipping } from "@/lib/commerce";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function generateOrderNumber() {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KTS-${stamp}-${rand}`;
}

export async function POST(req: NextRequest) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();
    const body = checkoutSchema.parse(await req.json());

    if (
      body.paymentMethod !== "cod" &&
      process.env.ENABLE_ONLINE_PAYMENTS !== "true"
    ) {
      throw new Error(
        "Online payment is not available yet. Please choose Cash on Delivery."
      );
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

    const shipping = calcShipping(subtotal);
    const discount = Math.min(body.discount || 0, subtotal);
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
          couponCode: body.couponCode,
          discount,
        },
      ],
      { session }
    );

    if (body.couponCode && discount > 0) {
      const { Coupon } = await import("@/models/Coupon");
      await Coupon.updateOne(
        { code: body.couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } },
        { session }
      );
    }

    await session.commitTransaction();

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
    await session.abortTransaction();
    console.error("POST /api/checkout", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Checkout failed" },
      { status: 400 }
    );
  } finally {
    session.endSession();
  }
}
