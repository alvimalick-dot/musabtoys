import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getCustomerSession, phoneKey } from "@/lib/customer-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  phone: z.string().min(10),
});

/**
 * Autofill saved details only for the customer currently signed in. Looking
 * up an arbitrary phone number would expose private addresses and email.
 */
export async function POST(req: NextRequest) {
  const limited = await rateLimit(`lookup:${clientIp(req)}`, 30, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = schema.parse(await req.json());
    const key = phoneKey(body.phone);
    const session = await getCustomerSession();
    if (!session || session.phoneKey !== key) {
      return NextResponse.json({ found: false });
    }
    await connectDB();

    const customer = await Customer.findById(session.customerId).lean();
    if (customer) {
      const def =
        customer.addresses.find((a: { isDefault?: boolean }) => a.isDefault) ||
        customer.addresses[0];
      return NextResponse.json({
        found: true,
        source: "account",
        profile: {
          name: customer.name,
          email: customer.email || "",
          address: def?.address || "",
          city: def?.city || "Multan",
          area: def?.area || "",
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
