#!/usr/bin/env node
/*
  Lightweight import worker.
  Run this on a server or a background process manager (pm2, systemd):
  MONGODB_URI and NODE_ENV must be set.
  Usage: node scripts/import-worker.js
*/

import { connectDB } from "../src/lib/mongodb";
import { ImportJob } from "../src/models/ImportJob";
import { processBatch } from "../src/lib/import-processing";
import { notifyImportWebhook } from "../src/lib/import-notify";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log("Import worker starting...");
  await connectDB();
  while (true) {
    try {
      // Find a job that's processing or pending with remaining rows
      const job = await ImportJob.findOne({
        status: { $in: ["processing", "pending"] },
        $expr: { $lt: ["$nextBatchIndex", "$totalRows"] },
      }).exec();
      if (!job) {
        await sleep(3000);
        continue;
      }

      if (job.status === "pending") job.status = "processing";

      // Process batches until this job finishes or yields
      const { processed, imagesSynced } = await processBatch(job, job.nextBatchIndex);
      job.processedRows += processed;
      job.imagesSynced += imagesSynced;
      job.nextBatchIndex += processed;
      job.successRows = job.rows.filter((r) => r.status === "success").length;
      job.errorRows = job.rows.filter((r) => r.status === "error").length;
      if (job.nextBatchIndex >= job.totalRows) job.status = "completed";
      await job.save();
      // Notify webhook if configured
      try {
        await notifyImportWebhook(job.toObject());
      } catch (err) {
        console.warn("notify failed", err);
      }
    } catch (err) {
      console.error("Worker error:", err);
      await sleep(2000);
    }
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
