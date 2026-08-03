import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { timingSafeEqual, createHash } from "crypto";

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

  // In production we require a bcrypt-hashed ADMIN_PASSWORD (starts with $2a/$2b/$2y).
  // Avoid scanning for literal substrings (e.g. "change") to prevent false positives
  // from static analysis tools — rely on explicit hash requirement below.

  // Compare email using fixed-length SHA-256 digests and timingSafeEqual to avoid
  // length-based timing differences. Also ensure original lengths match.
  const encEmail = createHash("sha256").update(email).digest();
  const encAdminEmail = createHash("sha256").update(adminEmail).digest();
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

  // Dev only: compare SHA-256 digests with timingSafeEqual to avoid length-based
  // timing leaks while still allowing a plaintext ADMIN_PASSWORD during development.
  const encPw = createHash("sha256").update(password).digest();
  const encAdminPw = createHash("sha256").update(adminPassword).digest();
  return timingSafeEqual(encPw, encAdminPw) && password.length === adminPassword.length;
}
