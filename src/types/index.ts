export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type PaymentMethod = "cod" | "jazzcash" | "payfast";

export interface ProductSpec {
  dimensions?: string;
  battery?: string;
  pieceCount?: number;
  material?: string;
  weight?: string;
  [key: string]: string | number | undefined;
}

export interface ProductDTO {
  _id: string;
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
  featured?: boolean;
  sku?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export interface CheckoutPayload {
  items: { productId: string; quantity: number }[];
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    area?: string;
  };
  paymentMethod: PaymentMethod;
  notes?: string;
}
