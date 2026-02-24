import { Schema, model } from "mongoose";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  PARTIAL = "PARTIAL"
}

const orderSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, required: true, index: true },

    items: [
      {
        variantId: {
          type: Schema.Types.ObjectId,
          ref: "Variant",
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],

    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
  },
  { timestamps: true }
);

orderSchema.index({ tenantId: 1, createdAt: -1 });

export const Order = model("Order", orderSchema);