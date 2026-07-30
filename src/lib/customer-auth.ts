import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const CUSTOMER_COOKIE = "kts_customer_token";
const isProd = process.env.NODE_ENV === "production";

/** Normalize PK phones to last 10 digits for matching */
export function phoneKey(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
}

export function formatPhoneDisplay(phone: string) {
  const key = phoneKey(phone);
  if (key.length === 10) return `0${key}`;
  return phone;
}

function getCustomerSecret() {
  const secret =
    process.env.CUSTOMER_JWT_SECRET || process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("Missing CUSTOMER_JWT_SECRET or ADMIN_JWT_SECRET");
  return new TextEncoder().encode(secret + ":customer");
}

export async function createCustomerToken(payload: {
  customerId: string;
  phoneKey: string;
}) {
  return new SignJWT({ ...payload, role: "customer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getCustomerSecret());
}

export async function verifyCustomerToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getCustomerSecret());
    return payload as {
      customerId: string;
      phoneKey: string;
      role: string;
    };
  } catch {
    return null;
  }
}

export async function setCustomerCookie(token: string) {
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearCustomerCookie() {
  const jar = await cookies();
  jar.delete(CUSTOMER_COOKIE);
}

export async function getCustomerSession() {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}

export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function hashOtp(code: string) {
  return bcrypt.hash(code, 8);
}

export async function compareOtp(code: string, hash: string) {
  return bcrypt.compare(code, hash);
}
