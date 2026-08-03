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
    // Require email for login so accounts remain email-primary
    if (body.purpose === "login" && !body.email) {
      return NextResponse.json({ error: "Email is required for login" }, { status: 400 });
    }
    const code = generateOtpCode();
    const codeHash = await hashOtp(code);
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

    // Store email, name and hashed code on the record. Do NOT store plaintext codes.
    await OtpChallenge.deleteMany({ email: body.email });
    await OtpChallenge.create({
      email: body.email,
      phoneKey: body.phone ? phoneKey(body.phone) : undefined,
      codeHash,
      name: body.name ?? "",
      attempts: 0,
      expiresAt,
      purpose: body.purpose,
    });

    // Send OTP email — use email as primary identifier
    const emailSent = await dispatchOtpEmail(body.email, code);

    return NextResponse.json({
      success: true,
      phone: formatPhoneDisplay(body.phone),
      emailSent,
      message: emailSent ? "OTP sent to your email." : "OTP created. Check your email.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OTP request failed" },
      { status: 400 }
    );
  }
}
