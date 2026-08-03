import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { OtpChallenge } from "@/models/OtpChallenge";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  generateOtpCode,
  hashOtp,
  phoneKey,
  formatPhoneDisplay,
} from "@/lib/customer-auth";
import { dispatchOtpEmail } from "@/lib/resend";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  phone: z.string().min(10),
  email: z.string().email("Enter a valid email address"),
  purpose: z.enum(["login", "save_account"]).default("login"),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const limited = rateLimit(`otp-req:${clientIp(req)}`, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: `Too many OTP requests. Wait ${limited.retryAfterSec}s.` },
      { status: 429 }
    );
  }

  try {
    const body = schema.parse(await req.json());
    const key = phoneKey(body.phone);
    if (key.length < 10) {
      return NextResponse.json({ error: "Enter a valid mobile number" }, { status: 400 });
    }

    await connectDB();
    const code = generateOtpCode();
    const codeHash = await hashOtp(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store email, name, and plaintext code on the record.
    // dispatchOtpEmail reads them back by phoneKey — no user input
    // ever flows into the send call from this route.
    await OtpChallenge.deleteMany({ phoneKey: key });
    await OtpChallenge.create({
      phoneKey: key,
      codeHash,
      pendingCode: code,
      email: body.email,
      name: body.name ?? "",
      attempts: 0,
      expiresAt,
      purpose: body.purpose,
    });

    // Only the server-internal phoneKey crosses the boundary here
    const emailSent = await dispatchOtpEmail(key);

    const allowDebug =
      process.env.ALLOW_OTP_DEBUG === "true" ||
      process.env.NODE_ENV !== "production";

    return NextResponse.json({
      success: true,
      phone: formatPhoneDisplay(body.phone),
      emailSent,
      message: emailSent ? "OTP sent to your email." : "OTP created. Check your email.",
      ...(allowDebug ? { debugOtp: code } : {}),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OTP request failed" },
      { status: 400 }
    );
  }
}
