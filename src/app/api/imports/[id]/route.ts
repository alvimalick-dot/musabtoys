import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportJob } from "@/models/ImportJob";
import { getAdminSession } from "@/lib/auth";
import { processBatch } from "@/lib/import-processing";
import { isValidObjectId, safeErrorMessage } from "@/lib/security";

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
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    await connectDB();
    const job = await ImportJob.findById(id)
      .select("filename status totalRows processedRows successRows errorRows imagesSynced nextBatchIndex batchSize summary error createdAt")
      .lean();

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    return NextResponse.json({ job });
  } catch (error) {
    return NextResponse.json(
      { error: safeErrorMessage(error, "Failed to fetch job") },
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
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
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
      { error: safeErrorMessage(error, "Batch processing failed") },
      { status: 500 }
    );
  }
}
