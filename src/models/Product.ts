import { Schema, model } from "mongoose";

const productSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  name: { type: String, required: true },
  category: String,
  description: String
}, { timestamps: true });

export const Product = model("Product", productSchema);