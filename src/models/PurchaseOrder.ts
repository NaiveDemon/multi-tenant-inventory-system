import { Schema, model, Types } from "mongoose";

export interface IPOItem {
  variantId: Types.ObjectId;
  orderedQty: number;
  receivedQty: number;
  price: number;
}

export interface IPurchaseOrder {
  tenantId: Types.ObjectId;
  supplierId?: Types.ObjectId;
  items: IPOItem[];
  status: POStatus;
}

export enum POStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  CONFIRMED = "CONFIRMED",
  RECEIVED = "RECEIVED"
}

const purchaseOrderSchema = new Schema<IPurchaseOrder>({
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },
  supplierId: { type: Schema.Types.ObjectId, ref: "Supplier" },

  items: [{
    variantId: { type: Schema.Types.ObjectId, ref: "Variant" },
    orderedQty: Number,
    receivedQty: { type: Number, default: 0 },
    price: Number
  }],

  status: { type: String, enum: Object.values(POStatus), default: POStatus.DRAFT }
}, { timestamps: true });

purchaseOrderSchema.index({ tenantId: 1, status: 1 });
purchaseOrderSchema.index({ tenantId: 1, createdAt: -1 });

export const PurchaseOrder = model<IPurchaseOrder>("PurchaseOrder", purchaseOrderSchema);