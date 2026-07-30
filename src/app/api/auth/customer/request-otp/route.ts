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
import { whatsappChatUrl } from "@/lib/whatsapp";
import { z } from "zod";

export const dynamic = "force-dynamic";

const schema = z.object({
  phone: z.string().min(10),
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

    await OtpChallenge.deleteMany({ phoneKey: key });
    await OtpChallenge.create({
      phoneKey: key,
      codeHash,
      attempts: 0,
      expiresAt,
      purpose: body.purpose,
    });

    const display = formatPhoneDisplay(body.phone);
    const otpMessage = `Your Karachi Toy Shop code is ${code}. Valid 10 minutes.`;

    // Prefer WhatsApp Cloud API when configured; otherwise provide wa deep-link helper + debug in non-prod
    let delivery: "whatsapp_cloud" | "whatsapp_link" | "debug" = "whatsapp_link";
    if (process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      try {
        const to = `92${key}`;
        const res = await fetch(
          `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to,
              type: "text",
              text: { body: otpMessage },
            }),
          }
        );
        if (res.ok) delivery = "whatsapp_cloud";
      } catch {
        // fall through
      }
    }

    const allowDebug =
      process.env.ALLOW_OTP_DEBUG === "true" ||
      process.env.NODE_ENV !== "production";

    return NextResponse.json({
      success: true,
      phone: display,
      delivery,
      // Customer can also open WhatsApp to the store if cloud send isn't configured
      whatsappHintUrl: whatsappChatUrl(
        `Hi, please send my login OTP to ${display}`
      ),
      message:
        delivery === "whatsapp_cloud"
          ? "OTP sent on WhatsApp"
          : "OTP created. Check WhatsApp or use the code shown in demo mode.",
      ...(allowDebug ? { debugOtp: code } : {}),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OTP request failed" },
      { status: 400 }
    );
  }
}
