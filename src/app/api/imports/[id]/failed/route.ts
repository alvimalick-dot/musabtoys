import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportJob } from "@/models/ImportJob";
import { getAdminSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const job = await ImportJob.findById(resolvedParams.id).lean();
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const failed = (job.rows || []).filter((r: Record<string, unknown>) => (r.status as unknown) === "error");
  if (!failed.length) return NextResponse.json({ message: "No failed rows" });

  const header = Object.keys((failed[0].data as Record<string, unknown>) || {}).join(",");
  const lines = failed.map((r: Record<string, unknown>) => {
    const d = (r.data as Record<string, unknown>) || {};
    return Object.values(d)
      .map((v: unknown) => {
        if (v == null) return "";
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
      })
      .join(",");
  });

  const csv = [header, ...lines].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="import-${resolvedParams.id}-failed.csv"`,
    },
  });
}
