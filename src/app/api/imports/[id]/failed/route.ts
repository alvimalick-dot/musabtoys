import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportJob } from "@/models/ImportJob";
import { getAdminSession } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const job = await ImportJob.findById(params.id).lean();
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const failed = (job.rows || []).filter((r: any) => r.status === "error");
  if (!failed.length) return NextResponse.json({ message: "No failed rows" });

  const header = Object.keys(failed[0].data || {}).join(",");
  const lines = failed.map((r: any) => {
    const d = r.data || {};
    return Object.values(d)
      .map((v: any) => {
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
      "Content-Disposition": `attachment; filename="import-${params.id}-failed.csv"`,
    },
  });
}
