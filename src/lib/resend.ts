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
export async function dispatchOtpEmail(email: string, code?: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    // Dynamic import avoids circular deps and keeps DB logic server-only
    const { OtpChallenge } = await import("@/models/OtpChallenge");
    const record = await OtpChallenge.findOne({ email }).sort({ createdAt: -1 }).lean();
    if (!record?.email) return false;

    const greeting = record.name ? `Hi ${record.name}` : "Hi";
    const action = record.purpose === "save_account" ? "save your account" : "log in";

    // Require code to be passed in; do not rely on stored plaintext codes
    if (!code) return false;
    const codeToSend = code;

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || "Karachi Toy Shop <onboarding@resend.dev>",
      to: [record.email],
      subject: `${codeToSend} is your Karachi Toy Shop code`,
      text: `${greeting},\n\nYour one-time code to ${action} is: ${codeToSend}\n\nExpires in 1 minute.\n\n— Karachi Toy Shop`,
    });

    // Do not store or clear plaintext codes here; we only keep code hashes

    return error === null;
  } catch {
    return false;
  }
}
