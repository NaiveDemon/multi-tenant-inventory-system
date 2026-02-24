import { Schema, model } from "mongoose";

const variantSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },

  sku: { type: String, required: true },
  attributes: {
    size: String,
    color: String
  },

  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  reorderLevel: { type: Number, default: 5 }
}, { timestamps: true });

variantSchema.index({ tenantId: 1 });
variantSchema.index({ tenantId: 1, stock: 1 });
variantSchema.index({ tenantId: 1, productId: 1 });


export const Variant = model("Variant", variantSchema);