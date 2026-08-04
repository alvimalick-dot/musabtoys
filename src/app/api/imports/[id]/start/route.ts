import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportJob } from "@/models/ImportJob";
import { getAdminSession } from "@/lib/auth";
import { processBatch } from "@/lib/import-processing";
import { notifyImportWebhook } from "@/lib/import-notify";

export const dynamic = "force-dynamic";

/**
 * Start processing a job in the background (non-blocking).
 * Note: in serverless deployments this is best-effort — prefer a real worker queue.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const job = await ImportJob.findById(resolvedParams.id);
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  // Kick off background processing without awaiting — best-effort.
  (async function run() {
    try {
      while (job.nextBatchIndex < job.totalRows && job.status !== "failed") {
        const { processed, imagesSynced } = await processBatch(job, job.nextBatchIndex);
        job.processedRows += processed;
        job.imagesSynced += imagesSynced;
        job.nextBatchIndex += processed;
        job.successRows = job.rows.filter((r: Record<string, unknown>) => (r.status as unknown) === "success").length;
        job.errorRows = job.rows.filter((r: Record<string, unknown>) => (r.status as unknown) === "error").length;
        if (job.nextBatchIndex >= job.totalRows) job.status = "completed";
        else job.status = "processing";
        await job.save();
      }
      // Notify webhook when finished/updated
      await notifyImportWebhook(job);
    } catch (err) {
      console.error("Background import run failed", err);
      job.status = "failed";
      job.error = err instanceof Error ? err.message : String(err);
      await job.save();
      await notifyImportWebhook(job);
    }
  })();

  // Return immediately
  return NextResponse.json({ accepted: true });
}
