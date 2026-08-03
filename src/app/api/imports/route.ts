import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ImportJob } from "@/models/ImportJob";
import { getAdminSession } from "@/lib/auth";
import { parseExcel, serializeMappedRow, DEFAULT_BATCH_SIZE } from "@/lib/import-processing";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/imports
 * Create a resumable import job from an Excel file. Returns the job id immediately.
 * The client then polls POST /api/imports/[id]/process to advance through batches.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Excel file is required" }, { status: 400 });
    }
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      return NextResponse.json(
        { error: "Only .xlsx, .xls, or .csv files are allowed" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { mapped, sheetName, warnings, detected } = parseExcel(buffer);

    if (!mapped.length) {
      return NextResponse.json({ error: "Excel sheet is empty" }, { status: 400 });
    }

    // Build import rows (store serialized data for later batch processing)
    const rows = mapped
      .map((m, i) => {
        const data = serializeMappedRow(m);
        if (!data) return null;
        const rowNum = i + 2;
        return {
          row: rowNum,
          sku: data.sku ? String(data.sku) : "",
          name: data.name ? String(data.name) : "",
          status: "pending" as const,
          data,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    if (!rows.length) {
      return NextResponse.json(
        { error: "No valid rows (missing name/price). Check headers." },
        { status: 400 }
      );
    }

    const job = await ImportJob.create({
      filename: file.name,
      status: "processing",
      totalRows: rows.length,
      processedRows: 0,
      successRows: 0,
      errorRows: 0,
      imagesSynced: 0,
      nextBatchIndex: 0,
      batchSize: DEFAULT_BATCH_SIZE,
      rows,
      summary: { sheetName, warnings, detected },
    });

    return NextResponse.json(
      {
        success: true,
        jobId: (job as unknown as { _id: string })._id,
        totalRows: rows.length,
        batchSize: DEFAULT_BATCH_SIZE,
        message: `Created import job for ${rows.length} rows.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/imports", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create import job" },
      { status: 500 }
    );
  }
}

/** GET /api/imports — list recent import jobs (admin). */
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    const jobs = await ImportJob.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select("filename status totalRows processedRows successRows errorRows imagesSynced createdAt")
      .lean();
    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
