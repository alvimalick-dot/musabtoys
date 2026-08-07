import { NextRequest, NextResponse } from "next/server";
import {
  createAdminToken,
  setAdminCookie,
  clearAdminCookie,
  validateAdminCredentials,
  getAdminSession,
} from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validators";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, email: session.email });
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    const limited = await rateLimit(`admin-login:${ip}`, 5, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Try again in ${limited.retryAfterSec} seconds.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }

    const body = adminLoginSchema.parse(await req.json());
    const ok = await validateAdminCredentials(body.email, body.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createAdminToken(body.email);
    await setAdminCookie(token);

    return NextResponse.json({ success: true, email: body.email });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Login failed" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  await clearAdminCookie();
  return NextResponse.json({ success: true });
}
