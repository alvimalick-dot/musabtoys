import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportJob } from "@/models/ImportJob";
import { getAdminSession } from "@/lib/auth";
import { processBatch } from "@/lib/import-processing";
import { notifyImportWebhook } from "@/lib/import-notify";

export const dynamic = "force-dynamic";
export const maxDuration = 600;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const job = await ImportJob.findById(params.id);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // Process batches until done or failed. This is a best-effort long-running endpoint.
    while (job.nextBatchIndex < job.totalRows && job.status !== "failed") {
      const { processed, imagesSynced } = await processBatch(job, job.nextBatchIndex);

      job.processedRows += processed;
      job.imagesSynced += imagesSynced;
      job.nextBatchIndex += processed;

      job.successRows = job.rows.filter((r: any) => r.status === "success").length;
      job.errorRows = job.rows.filter((r: any) => r.status === "error").length;

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
