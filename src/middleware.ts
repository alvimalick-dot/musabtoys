import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Admin-only API segments. These have NO public counterpart, so middleware
 * can safely reject unauthenticated requests before they reach a handler.
 *
 * Mutating routes under /api/products and /api/coupons keep their per-route
 * admin checks because those namespaces also expose public GET endpoints
 * (the shop catalog and coupon validation), which must stay reachable.
 */
const ADMIN_API_PREFIXES = [
  "/api/imports",
  "/api/orders",
  "/api/seed",
  "/api/upload",
  "/api/excel-upload",
  "/api/admin",
  "/api/products/clear",
  "/api/products/recategorize",
  "/api/products/sync-images",
];

async function hasAdminSession(req: NextRequest) {
  const token = req.cookies.get("kts_admin_token")?.value;
  if (!token || !process.env.ADMIN_JWT_SECRET) return false;
  try {
    await jwtVerify(
      token,
      new TextEncoder().encode(process.env.ADMIN_JWT_SECRET)
    );
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Admin API protection (defense-in-depth) ─────────────────────────
  // Reject unauthenticated or expired-token requests immediately. The route
  // handlers also re-verify the session, so this is a first line of defense.
  if (ADMIN_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    const authed = await hasAdminSession(req);
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  // ── Public API routes pass through ──────────────────────────────────
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // ── Admin page shell ─────────────────────────────────────────────────
  // /admin is the login UI and must stay reachable so the login form can
  // render. All other /admin/* pages require a session.
  if (pathname.startsWith("/admin")) {
    const authed = await hasAdminSession(req);
    if (!authed && pathname !== "/admin") {
      const url = new URL("/admin", req.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
