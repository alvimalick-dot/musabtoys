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
  email: z.string().email("Enter a valid email address").transform((value) => value.trim().toLowerCase()),
  purpose: z.enum(["login", "save_account"]).default("login"),
  name: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const ipLimited = rateLimit(`otp-req:ip:${clientIp(req)}`, 5, 15 * 60 * 1000);
    const emailLimited = rateLimit(`otp-req:email:${body.email}`, 5, 15 * 60 * 1000);
    if (!ipLimited.ok || !emailLimited.ok) {
      const retryAfterSec = Math.max(ipLimited.retryAfterSec, emailLimited.retryAfterSec);
      return NextResponse.json(
        { error: `Too many OTP requests. Wait ${retryAfterSec}s.` },
        { status: 429 }
      );
    }
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

    // Replace the previous challenge atomically. Only the bcrypt hash is stored.
    await OtpChallenge.findOneAndUpdate(
      { email: body.email },
      {
        $set: {
          phoneKey: phoneKey(body.phone),
          codeHash,
          name: body.name ?? "",
          attempts: 0,
          expiresAt,
          purpose: body.purpose,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send OTP email — use email as primary identifier
    const emailSent = await dispatchOtpEmail(body.email, code, {
      name: body.name,
      purpose: body.purpose,
    });

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
