import { Schema, models, model } from "mongoose";

export interface IOtpChallenge {
  phoneKey: string;
  codeHash: string;
  pendingCode: string;
  email: string;
  name?: string;
  attempts: number;
  expiresAt: Date;
  purpose: "login" | "save_account";
}

const OtpSchema = new Schema<IOtpChallenge>(
  {
    phoneKey: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    pendingCode: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: true },
    purpose: {
      type: String,
      enum: ["login", "save_account"],
      default: "login",
    },
  },
  { timestamps: true }
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpChallenge =
  models.OtpChallenge || model<IOtpChallenge>("OtpChallenge", OtpSchema);
