import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

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

  if (pathname.startsWith("/admin")) {
    // Allow the page shell; protect via redirect only when cookie missing
    // so login form still works. Authenticated APIs stay server-gated.
    const isApi = pathname.startsWith("/api/");
    if (isApi) return NextResponse.next();

    // Always allow /admin (login UI). Sensitive actions are API-protected.
    // Soft hint header for debugging only.
    const authed = await hasAdminSession(req);
    const res = NextResponse.next();
    res.headers.set("x-admin-session", authed ? "1" : "0");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
