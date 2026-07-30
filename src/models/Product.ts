import { Schema, models, model } from "mongoose";
import type { ProductSpec, StockStatus } from "@/types";

export interface IProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  brand: string;
  ageGroup: string;
  stock: number;
  stockStatus: StockStatus;
  images: string[];
  specs: ProductSpec;
  featured: boolean;
  newArrival: boolean;
  sku: string;
  searchText: string;
  createdAt?: Date;
  updatedAt?: Date;
}

function deriveStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out_of_stock";
  if (stock <= 5) return "low_stock";
  return "in_stock";
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    category: { type: String, required: true, index: true },
    brand: { type: String, default: "Generic", index: true },
    ageGroup: { type: String, default: "All Ages", index: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    stockStatus: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock"],
      default: "out_of_stock",
      index: true,
    },
    images: { type: [String], default: [] },
    specs: { type: Schema.Types.Mixed, default: {} },
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false, index: true },
    sku: { type: String, index: true },
    searchText: { type: String, default: "" },
  },
  { timestamps: true }
);

ProductSchema.index({
  name: "text",
  description: "text",
  brand: "text",
  category: "text",
  searchText: "text",
});

ProductSchema.pre("validate", function () {
  this.stockStatus = deriveStockStatus(this.stock);
  this.searchText = [this.name, this.brand, this.category, this.ageGroup, this.sku]
    .filter(Boolean)
    .join(" ");
});

export const Product =
  models.Product || model<IProduct>("Product", ProductSchema);
