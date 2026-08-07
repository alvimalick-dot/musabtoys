import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { OtpChallenge } from "@/models/OtpChallenge";
import { Order } from "@/models/Order";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  compareOtp,
  createCustomerToken,
  phoneKey,
  setCustomerCookie,
  formatPhoneDisplay,
} from "@/lib/customer-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6),
  name: z.string().min(2).optional(),
  email: z.string().email().transform((value) => value.trim().toLowerCase()),
  address: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  purpose: z.enum(["login", "save_account"]).default("login"),
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(`otp-verify:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  try {
    const body = schema.parse(await req.json());
    const key = body.phone ? phoneKey(body.phone) : undefined;
    await connectDB();

    const challenge = await OtpChallenge.findOne({ email: body.email });
    if (!challenge || challenge.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP expired. Request a new one." }, { status: 400 });
    }
    if (challenge.attempts >= 5) {
      return NextResponse.json({ error: "Too many wrong codes" }, { status: 429 });
    }

    const ok = await compareOtp(body.code, challenge.codeHash);
    if (!ok) {
      challenge.attempts += 1;
      await challenge.save();
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }

    await OtpChallenge.deleteOne({ _id: challenge._id });

    let customer = await Customer.findOne({ email: body.email });
    if (!customer) {
      // Create account — optionally seed from checkout details
      const latestOrder = await Order.findOne({
        "customer.phone": { $regex: key + "$" },
      }).sort({ createdAt: -1 });

      const name =
        body.name ||
        latestOrder?.customer.name ||
        "Customer";
      const email = body.email || latestOrder?.customer.email;
      const addresses = [];
      if (body.address && body.city) {
        addresses.push({
          label: "Home",
          address: body.address,
          city: body.city,
          area: body.area,
          isDefault: true,
        });
      } else if (latestOrder) {
        addresses.push({
          label: "Home",
          address: latestOrder.customer.address,
          city: latestOrder.customer.city,
          area: latestOrder.customer.area,
          isDefault: true,
        });
      }

      customer = await Customer.create({
        phone: body.phone ? formatPhoneDisplay(body.phone) : undefined,
        phoneKey: key,
        name,
        email,
        addresses,
        verifiedAt: new Date(),
      });
    } else {
      customer.verifiedAt = new Date();
      if (body.name) customer.name = body.name;
      // Do not overwrite customer's email on login; email is primary key
      if (body.address && body.city) {
        const exists = customer.addresses.some(
          (a: { address: string; city: string }) =>
            a.address === body.address && a.city === body.city
        );
        if (!exists) {
          customer.addresses.forEach((a: { isDefault?: boolean }) => {
            a.isDefault = false;
          });
          customer.addresses.push({
            label: "Home",
            address: body.address,
            city: body.city,
            area: body.area,
            isDefault: true,
          });
        }
      }
      await customer.save();
    }

    const token = await createCustomerToken({
      customerId: String(customer._id),
      // A caller-supplied phone number must not authorise order-history access.
      phoneKey: customer.phoneKey || "",
    });
    await setCustomerCookie(token);

    return NextResponse.json({
      success: true,
      customer: {
        id: customer._id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        addresses: customer.addresses,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verify failed" },
      { status: 400 }
    );
  }
}
