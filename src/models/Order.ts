import mongoose, { Schema, models, model } from "mongoose";
import type { OrderStatus, PaymentMethod } from "@/types";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface IOrder {
  orderNumber: string;
  items: IOrderItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    area?: string;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed";
  status: OrderStatus;
  subtotal: number;
  shipping: number;
  total: number;
  notes?: string;
  invoiceUrl?: string;
  couponCode?: string;
  discount?: number;
  courierName?: string;
  trackingNumber?: string;
  feedbackRequested?: boolean;
  confirmationEmailSent?: boolean;
  shippedEmailSent?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    slug: String,
    price: Number,
    quantity: Number,
    image: String,
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      area: String,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "jazzcash", "payfast"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    notes: String,
    invoiceUrl: String,
    couponCode: String,
    discount: { type: Number, default: 0 },
    courierName: String,
    trackingNumber: String,
feedbackRequested: { type: Boolean, default: false },
  confirmationEmailSent: { type: Boolean, default: false },
  shippedEmailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Account history is authorised by the customer's verified email.
OrderSchema.index({ "customer.email": 1, createdAt: -1 });

export const Order = models.Order || model<IOrder>("Order", OrderSchema);
