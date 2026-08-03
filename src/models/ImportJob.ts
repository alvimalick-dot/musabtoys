import { Schema, models, model } from "mongoose";

export interface IImportJob {
  filePath: string;
  status: "pending" | "processing" | "failed" | "done";
  totalRows: number;
  processed: number;
  errors: { row: number; message: string }[];
}

const ImportJobSchema = new Schema<IImportJob>(
  {
    filePath: { type: String, required: true },
    status: { type: String, default: "pending" },
    totalRows: { type: Number, default: 0 },
    processed: { type: Number, default: 0 },
    errors: { type: [{ row: Number, message: String }], default: [] },
  },
  { timestamps: true }
);

export const ImportJob = models.ImportJob || model<IImportJob>("ImportJob", ImportJobSchema);
import { Schema, models, model } from "mongoose";

export type ImportRowStatus = "pending" | "processing" | "success" | "error";
export type ImportJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface ImportRow {
  row: number;
  sku: string;
  name: string;
  status: ImportRowStatus;
  error?: string;
  /** Full mapped row data (price, category, images, specs, …) for batch processing. */
  data?: Record<string, unknown>;
}

export interface IImportJob {
  filename: string;
  status: ImportJobStatus;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  imagesSynced: number;
  /**
   * Resume point — the index of the next batch to process. Each batch of
   * `batchSize` rows is processed in a single API invocation; the client
   * polls `POST /api/imports/[id]/process` to advance this pointer.
   */
  nextBatchIndex: number;
  batchSize: number;
  rows: ImportRow[];
  summary?: Record<string, unknown>;
  error?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ImportRowSchema = new Schema<ImportRow>(
  {
    row: { type: Number, required: true },
    sku: { type: String, default: "" },
    name: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "processing", "success", "error"],
      default: "pending",
    },
    error: { type: String, default: "" },
    data: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const ImportJobSchema = new Schema<IImportJob>(
  {
    filename: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    totalRows: { type: Number, default: 0 },
    processedRows: { type: Number, default: 0 },
    successRows: { type: Number, default: 0 },
    errorRows: { type: Number, default: 0 },
    imagesSynced: { type: Number, default: 0 },
    nextBatchIndex: { type: Number, default: 0 },
    batchSize: { type: Number, default: 20 },
    rows: { type: [ImportRowSchema], default: [] },
    summary: { type: Schema.Types.Mixed, default: {} },
    error: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ImportJob =
  models.ImportJob || model<IImportJob>("ImportJob", ImportJobSchema);

