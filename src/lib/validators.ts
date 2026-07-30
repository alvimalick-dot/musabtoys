import { z } from "zod";

export const productFilterSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  ageGroup: z.string().optional(),
  stockStatus: z.enum(["in_stock", "low_stock", "out_of_stock"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(24),
  sort: z
    .enum(["newest", "price_asc", "price_desc", "name"])
    .default("newest"),
});

export const excelRowSchema = z.object({
  name: z.string().min(1),
  sku: z.union([z.string(), z.number()]).optional().transform((v) =>
    v === undefined || v === null ? "" : String(v)
  ),
  description: z.string().optional().default(""),
  price: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).optional(),
  category: z.string().optional().default("Toys"),
  brand: z.string().optional().default("Generic"),
  ageGroup: z.string().optional().default("All Ages"),
  stock: z.coerce.number().min(0).optional().default(10),
  images: z.string().optional().default(""),
  featured: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((v) => {
      if (typeof v === "boolean") return v;
      if (!v) return false;
      return ["true", "1", "yes", "y"].includes(String(v).toLowerCase());
    }),
  dimensions: z.string().optional(),
  battery: z.string().optional(),
  pieceCount: z.coerce.number().optional(),
  material: z.string().optional(),
  weight: z.string().optional(),
});

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1),
      })
    )
    .min(1),
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(5),
    city: z.string().min(2),
    area: z.string().optional(),
  }),
  paymentMethod: z.enum(["cod", "jazzcash", "payfast"]),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
  discount: z.coerce.number().min(0).optional(),
});

export const orderStatusSchema = z.object({
  status: z
    .enum([
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ])
    .optional(),
  courierName: z.string().max(80).optional(),
  trackingNumber: z.string().max(80).optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
