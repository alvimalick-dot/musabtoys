import { Schema, models, model } from "mongoose";

export type ImportRowStatus = "pending" | "processing" | "success" | "error";
export type ImportJobStatus = "pending" | "processing" | "completed" | "failed";

export interface ImportRow {
  row: number;
  sku: string;
  name: string;
  status: ImportRowStatus;
  error?: string;
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
  nextBatchIndex: number;
  batchSize: number;
  rows: ImportRow[];
  summary?: Record<string, unknown>;
  error?: string;
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

export const ImportJob = models.ImportJob || model<IImportJob>("ImportJob", ImportJobSchema);

