import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportJob } from "@/models/ImportJob";
import { getAdminSession } from "@/lib/auth";
import { notifyImportWebhook } from "@/lib/import-notify";
import { isValidObjectId } from "@/lib/security";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  await connectDB();
  const job = await ImportJob.findById(id);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  // Reset error rows to pending and resume
  let reset = 0;
  for (const row of job.rows) {
    if (row.status === "error") {
      row.status = "pending";
      row.error = undefined;
      reset++;
    }
  }
  if (reset > 0) {
    job.status = "processing";
    await job.save();
    // best-effort notify
    await notifyImportWebhook(job);
    return NextResponse.json({ success: true, reset });
  }
  return NextResponse.json({ success: true, reset: 0 });
}
