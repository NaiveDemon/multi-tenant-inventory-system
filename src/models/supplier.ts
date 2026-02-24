import { Schema, model } from "mongoose";

const supplierSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  name: String,
  email: String,
  phone: String
}, { timestamps: true });

export const Supplier = model("Supplier", supplierSchema);