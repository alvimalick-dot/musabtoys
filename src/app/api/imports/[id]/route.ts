import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportJob } from "@/models/ImportJob";
import { processImportBatch } from "@/lib/import-processing";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const job = await ImportJob.findById(params.id).lean();
  if (!job) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(job);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  // Trigger processing of a single batch. Idempotent; caller can loop until done.
  await connectDB();
  const job = await ImportJob.findById(params.id);
  if (!job) return new NextResponse("Not found", { status: 404 });
  try {
    const done = await processImportBatch(params.id, 20);
    return NextResponse.json({ done });
  } catch (err) {
    console.error(err);
    job.status = "failed";
    job.errors.push({ row: -1, message: (err as Error).message });
    await job.save();
    return new NextResponse((err as Error).message, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportJob } from "@/models/ImportJob";
import { getAdminSession } from "@/lib/auth";
import { processBatch } from "@/lib/import-processing";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** GET /api/imports/[id] — return job status + progress */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const job = await ImportJob.findById(id)
      .select("filename status totalRows processedRows successRows errorRows imagesSynced nextBatchIndex batchSize summary error createdAt")
      .lean();

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    return NextResponse.json({ job });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed" },
      { status: 500 }
    );
  }
}

/** POST /api/imports/[id] — process the next batch and advance the cursor */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await connectDB();
    const job = await ImportJob.findById(id);
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    if (job.status === "completed" || job.status === "failed") {
      return NextResponse.json({ done: true, job });
    }

    const { processed, imagesSynced } = await processBatch(job, job.nextBatchIndex);

    job.processedRows += processed;
    job.imagesSynced += imagesSynced;
    job.nextBatchIndex += processed;

    // Count successes/errors from the updated rows
    job.successRows = job.rows.filter((r: { status: string }) => r.status === "success").length;
    job.errorRows   = job.rows.filter((r: { status: string }) => r.status === "error").length;

    const done = job.nextBatchIndex >= job.totalRows;
    job.status = done ? "completed" : "processing";

    await job.save();

    return NextResponse.json({
      done,
      processedRows: job.processedRows,
      totalRows: job.totalRows,
      successRows: job.successRows,
      errorRows: job.errorRows,
      imagesSynced: job.imagesSynced,
      nextBatchIndex: job.nextBatchIndex,
      status: job.status,
    });
  } catch (error) {
    console.error("POST /api/imports/[id]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Batch processing failed" },
      { status: 500 }
    );
  }
}
