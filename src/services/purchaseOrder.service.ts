import { POStatus, PurchaseOrder } from "../models/PurchaseOrder";
import { Variant } from "../models/Variant";
import { StockMovement, MovementType } from "../models/StockMovement";

export const receivePurchaseOrder = async (
  tenantId: string,
  poId: string,
  receivedItems: { variantId: string; quantity: number }[]
) => {
  const po = await PurchaseOrder.findOne({ _id: poId, tenantId });

  if (!po) throw new Error("Purchase order not found");

  for (const item of receivedItems) {
   const poItem = po.items.find(
  (i: any) => i.variantId.toString() === item.variantId
);

if (!poItem) {
  throw new Error("Invalid variant in PO");
}

const orderedQty = poItem.orderedQty ?? 0;
const receivedQty = poItem.receivedQty ?? 0;

if (receivedQty + item.quantity > orderedQty) {
  throw new Error("Receiving more than ordered");
}

poItem.receivedQty = receivedQty + item.quantity;
    await Variant.updateOne(
      { _id: item.variantId, tenantId },
      { $inc: { stock: item.quantity } }
    );

    await StockMovement.create({
      tenantId,
      variantId: item.variantId,
      type: MovementType.PURCHASE,
      quantity: item.quantity,
    });
  }

  const fullyReceived = po.items.every(
    (i: any) => i.receivedQty === i.orderedQty
  );

  if (fullyReceived) {
    po.status = POStatus.RECEIVED;
  }

  await po.save();

  return po;
};