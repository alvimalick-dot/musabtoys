import { Schema, models, model } from "mongoose";

export interface IStockAlert {
  productId: Schema.Types.ObjectId;
  productSlug: string;
  phone: string;
  email?: string;
  notified: boolean;
}

const StockAlertSchema = new Schema<IStockAlert>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    productSlug: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

StockAlertSchema.index({ productId: 1, phone: 1 }, { unique: true });

export const StockAlert =
  models.StockAlert || model<IStockAlert>("StockAlert", StockAlertSchema);
