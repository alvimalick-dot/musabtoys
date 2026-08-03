import { Schema, models, model } from "mongoose";

export interface IAddress {
  label?: string;
  address: string;
  city: string;
  area?: string;
  isDefault?: boolean;
}

export interface ICustomer {
  phone: string;
  phoneKey?: string;
  name: string;
  email: string;
  addresses: IAddress[];
  verifiedAt?: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, default: "Home" },
    address: { type: String, required: true },
    city: { type: String, required: true },
    area: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    phone: { type: String },
    phoneKey: { type: String, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    addresses: { type: [AddressSchema], default: [] },
    verifiedAt: Date,
  },
  { timestamps: true }
);

export const Customer =
  models.Customer || model<ICustomer>("Customer", CustomerSchema);
