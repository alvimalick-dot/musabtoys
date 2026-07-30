import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  const hasUri = Boolean(process.env.MONGODB_URI);
  const session = await getAdminSession();

  try {
    await connectDB();
    return NextResponse.json({
      ok: true,
      database: "connected",
      hasUri,
      adminLoggedIn: Boolean(session),
      ms: Date.now() - started,
      uriHost: process.env.MONGODB_URI?.replace(/:[^:@]+@/, ":****@").slice(0, 120),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "failed",
        hasUri,
        adminLoggedIn: Boolean(session),
        ms: Date.now() - started,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
