/**
 * Resend transport — uses the official SDK (no raw fetch, no SSRF surface).
 */
import { Resend } from "resend";
import type { ReactElement } from "react";

export interface ResendPayload {
  from: string;
  to: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  text: string;
  react?: ReactElement;
}

export async function resendSend(payload: ResendPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: payload.from,
      to: payload.to,
      ...(payload.bcc ? { bcc: payload.bcc } : {}),
      ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
      subject: payload.subject,
      text: payload.text,
      ...(payload.react ? { react: payload.react } : {}),
    });
    return error === null;
  } catch {
    return false;
  }
}

/**
 * Reads the stored email address from the OTP record by phoneKey,
 * then sends the OTP email — the route never passes user input here.
 */
export async function dispatchOtpEmail(phoneKey: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    // Dynamic import avoids circular deps and keeps DB logic server-only
    const { OtpChallenge } = await import("@/models/OtpChallenge");
    const record = await OtpChallenge.findOne({ phoneKey }).sort({ createdAt: -1 }).lean();
    if (!record?.email || !record?.pendingCode) return false;

    const greeting = record.name ? `Hi ${record.name}` : "Hi";
    const action = record.purpose === "save_account" ? "save your account" : "log in";

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || "Karachi Toy Shop <onboarding@resend.dev>",
      to: [record.email],
      subject: `${record.pendingCode} is your Karachi Toy Shop code`,
      text: `${greeting},\n\nYour one-time code to ${action} is: ${record.pendingCode}\n\nExpires in 10 minutes.\n\n— Karachi Toy Shop`,
    });
    return error === null;
  } catch {
    return false;
  }
}
