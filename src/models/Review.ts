import { Schema, models, model } from "mongoose";

export interface IReview {
  productId: Schema.Types.ObjectId;
  productSlug: string;
  authorName: string;
  rating: number;
  comment: string;
  approved: boolean;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    productSlug: { type: String, required: true, index: true },
    authorName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Review = models.Review || model<IReview>("Review", ReviewSchema);
