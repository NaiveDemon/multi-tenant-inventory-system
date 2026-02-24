import { Variant } from "../models/Variant";
import { Order } from "../models/Order";
import { StockMovement, MovementType } from "../models/StockMovement";

export const createOrder = async (
  tenantId: string,
  items: { variantId: string; quantity: number; price: number }[]
) => {
  let totalAmount = 0;

  for (const item of items) {
    const updated = await Variant.updateOne(
      {
        _id: item.variantId,
        tenantId,
        stock: { $gte: item.quantity },
      },
      {
        $inc: { stock: -item.quantity },
      }
    );

    if (updated.modifiedCount === 0) {
      throw new Error("Insufficient stock");
    }

    totalAmount += item.quantity * item.price;

    await StockMovement.create({
      tenantId,
      variantId: item.variantId,
      type: MovementType.SALE,
      quantity: item.quantity,
    });
  }

  const order = await Order.create({
    tenantId,
    items,
    totalAmount,
    status: "CONFIRMED",
  });

  return order;
};