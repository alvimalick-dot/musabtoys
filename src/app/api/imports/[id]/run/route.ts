import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportJob } from "@/models/ImportJob";
import { getAdminSession } from "@/lib/auth";
import { processBatch } from "@/lib/import-processing";
import { notifyImportWebhook } from "@/lib/import-notify";

export const dynamic = "force-dynamic";
// Vercel Hobby allows a maximum of 300 seconds per serverless function.
export const maxDuration = 300;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const job = await ImportJob.findById(resolvedParams.id);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // Process batches until done or failed. This is a best-effort long-running endpoint.
    while (job.nextBatchIndex < job.totalRows && job.status !== "failed") {
      const { processed, imagesSynced } = await processBatch(job, job.nextBatchIndex);

      job.processedRows += processed;
      job.imagesSynced += imagesSynced;
      job.nextBatchIndex += processed;

      job.successRows = job.rows.filter((r: Record<string, unknown>) => (r.status as unknown) === "success").length;
      job.errorRows = job.rows.filter((r: Record<string, unknown>) => (r.status as unknown) === "error").length;

      if (job.nextBatchIndex >= job.totalRows) {
        job.status = "completed";
      } else {
        job.status = "processing";
      }

      await job.save();

      // brief pause to yield CPU and avoid tight loop
      await sleep(100);
    }

    // Notify webhook if configured
    await notifyImportWebhook(job);

    return NextResponse.json({
      done: job.nextBatchIndex >= job.totalRows,
      processedRows: job.processedRows,
      totalRows: job.totalRows,
      successRows: job.successRows,
      errorRows: job.errorRows,
      imagesSynced: job.imagesSynced,
      nextBatchIndex: job.nextBatchIndex,
      status: job.status,
    });
  } catch (err) {
    console.error("POST /api/imports/[id]/run", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Run failed" }, { status: 500 });
  }
}
