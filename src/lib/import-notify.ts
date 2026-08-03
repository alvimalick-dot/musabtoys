type ImportJobSummary = {
  _id?: string;
  status?: string;
  totalRows?: number;
  processedRows?: number;
  [key: string]: unknown;
};

export async function notifyImportWebhook(job: ImportJobSummary) {
  const url = process.env.IMPORT_JOB_WEBHOOK_URL;
  if (!url) return;
  try {
    // Use global fetch in modern Node runtimes
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - global fetch in Node may be available at runtime
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: job._id, status: job.status, totalRows: job.totalRows, processedRows: job.processedRows }),
    });
  } catch (err) {
    console.warn("Import webhook failed:", err);
  }
}
