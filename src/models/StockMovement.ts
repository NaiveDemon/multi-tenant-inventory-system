import { Schema, model } from "mongoose";

export enum MovementType {
  SALE = "SALE",
  PURCHASE = "PURCHASE",
  RETURN = "RETURN",
  ADJUSTMENT = "ADJUSTMENT"
}

const stockMovementSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  variantId: { type: Schema.Types.ObjectId, ref: "Variant", required: true },

  type: { type: String, enum: Object.values(MovementType), required: true },
  quantity: Number,
  referenceId: Schema.Types.ObjectId
}, { timestamps: true });

stockMovementSchema.index({ tenantId: 1, type: 1, createdAt: -1 });
stockMovementSchema.index({ tenantId: 1, createdAt: -1 });
stockMovementSchema.index({ tenantId: 1, variantId: 1 });

export const StockMovement = model("StockMovement", stockMovementSchema);