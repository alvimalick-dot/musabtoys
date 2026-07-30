import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ ok: true, database: "private" }, { status: 200 });
  }

  const started = Date.now();
  try {
    await connectDB();
    return NextResponse.json({
      ok: true,
      database: "connected",
      adminLoggedIn: true,
      ms: Date.now() - started,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        database: "failed",
        adminLoggedIn: true,
        ms: Date.now() - started,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
