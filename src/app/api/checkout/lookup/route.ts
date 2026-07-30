import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { Order } from "@/models/Order";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { phoneKey } from "@/lib/customer-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  phone: z.string().min(10),
});

/**
 * Guest checkout helper: if phone matches a known customer (or past order),
 * return name/address for autofill. Never requires login.
 */
export async function POST(req: NextRequest) {
  const limited = rateLimit(`lookup:${clientIp(req)}`, 30, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = schema.parse(await req.json());
    const key = phoneKey(body.phone);
    await connectDB();

    const customer = await Customer.findOne({ phoneKey: key }).lean();
    if (customer) {
      const def =
        customer.addresses.find((a) => a.isDefault) || customer.addresses[0];
      return NextResponse.json({
        found: true,
        source: "account",
        profile: {
          name: customer.name,
          email: customer.email || "",
          address: def?.address || "",
          city: def?.city || "Karachi",
          area: def?.area || "",
        },
      });
    }

    // Fallback: last guest order with this phone
    const order = await Order.findOne({
      "customer.phone": { $regex: key + "$" },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (order) {
      return NextResponse.json({
        found: true,
        source: "past_order",
        profile: {
          name: order.customer.name,
          email: order.customer.email || "",
          address: order.customer.address,
          city: order.customer.city,
          area: order.customer.area || "",
        },
      });
    }

    return NextResponse.json({ found: false });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Lookup failed" },
      { status: 400 }
    );
  }
}
