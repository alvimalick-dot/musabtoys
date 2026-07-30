import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { Order } from "@/models/Order";
import {
  clearCustomerCookie,
  getCustomerSession,
} from "@/lib/customer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  await connectDB();
  const customer = await Customer.findById(session.customerId).lean();
  if (!customer) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Link past guest orders by phone (retroactive history)
  const orders = await Order.find({
    $or: [
      { "customer.phone": { $regex: session.phoneKey + "$" } },
      { "customer.phone": customer.phone },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .select("orderNumber status total paymentMethod createdAt items.name items.quantity")
    .lean();

  return NextResponse.json({
    authenticated: true,
    customer: {
      id: customer._id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      addresses: customer.addresses,
    },
    orders: orders.map((o) => ({
      orderNumber: o.orderNumber,
      status: o.status,
      total: o.total,
      paymentMethod: o.paymentMethod,
      createdAt: o.createdAt,
      itemCount: o.items?.reduce((s, i) => s + i.quantity, 0) || 0,
    })),
  });
}

export async function DELETE() {
  await clearCustomerCookie();
  return NextResponse.json({ success: true });
}
