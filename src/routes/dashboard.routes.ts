import { Router } from "express";
import { Variant } from "../models/Variant";
import { PurchaseOrder } from "../models/PurchaseOrder";
import { StockMovement } from "../models/StockMovement";

const router = Router();

router.get("/:tenantId/stock-graph", async (req, res) => {
  try {
    const { tenantId } = req.params;

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const graph = await StockMovement.aggregate([
      {
        $match: {
          tenantId,
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            type: "$type",
          },
          total: { $sum: "$quantity" },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    res.json(graph);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/:tenantId/top-sellers", async (req, res) => {
  try {
    const { tenantId } = req.params;

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const top = await StockMovement.aggregate([
      {
        $match: {
          tenantId,
          type: "SALE",
          createdAt: { $gte: last30Days },
        },
      },
      {
        $group: {
          _id: "$variantId",
          totalSold: { $sum: "$quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    res.json(top);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/:tenantId/inventory-value", async (req, res) => {
  try {
    const { tenantId } = req.params;

    const variants = await Variant.find({ tenantId });

    const totalValue = variants.reduce(
      (sum, v) => sum + v.stock * v.price,
      0
    );

    res.json({ totalValue });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/:tenantId/low-stock", async (req, res) => {
  try {
    const { tenantId } = req.params;

    const variants = await Variant.find({ tenantId });

    const pendingPOs = await PurchaseOrder.find({
      tenantId,
      status: { $ne: "RECEIVED" },
    });

    const incomingMap: Record<string, number> = {};

    for (const po of pendingPOs) {
      for (const item of po.items) {
        const remaining =
          (item.orderedQty ?? 0) - (item.receivedQty ?? 0);

        const key = item.variantId.toString();

        incomingMap[key] = (incomingMap[key] ?? 0) + remaining;
      }
    }

    const lowStock = variants.filter((variant) => {
      const incoming = incomingMap[variant._id.toString()] ?? 0;
      const effectiveStock = variant.stock + incoming;
      return effectiveStock <= variant.reorderLevel;
    });

    res.json(lowStock);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;