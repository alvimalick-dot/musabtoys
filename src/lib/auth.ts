import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";

const COOKIE_NAME = "kts_admin_token";
const isProd = process.env.NODE_ENV === "production";

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) throw new Error("Missing ADMIN_JWT_SECRET");
  if (
    isProd &&
    (secret.includes("change-this") || secret.length < 24)
  ) {
    throw new Error(
      "ADMIN_JWT_SECRET is too weak for production. Use a long random string."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createAdminToken(email: string) {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as { email: string; role: string };
  } catch {
    return null;
  }
}

export async function setAdminCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getAdminSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function validateAdminCredentials(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment variables."
    );
  }

  if (
    isProd &&
    (adminEmail === "admin@karachitoys.pk" ||
      adminPassword.toLowerCase().includes("change"))
  ) {
    throw new Error(
      "Default admin credentials detected. Update ADMIN_EMAIL and ADMIN_PASSWORD before deploying."
    );
  }

  // Pad both sides to equal length before timing-safe compare
  const encEmail = Buffer.from(email.padEnd(256));
  const encAdminEmail = Buffer.from(adminEmail.padEnd(256));
  const emailMatch = timingSafeEqual(encEmail, encAdminEmail) && email.length === adminEmail.length;
  if (!emailMatch) return false;

  // Production: bcrypt hash required ($2a$ / $2b$ / $2y$)
  if (adminPassword.startsWith("$2")) {
    return bcrypt.compare(password, adminPassword);
  }

  if (isProd) {
    throw new Error(
      "ADMIN_PASSWORD must be a bcrypt hash in production. Generate with: npx bcryptjs-cli hash your-password"
    );
  }

  // Dev only: timing-safe plaintext comparison (pad to equal length)
  const encPw = Buffer.from(password.padEnd(256));
  const encAdminPw = Buffer.from(adminPassword.padEnd(256));
  return timingSafeEqual(encPw, encAdminPw) && password.length === adminPassword.length;
}
