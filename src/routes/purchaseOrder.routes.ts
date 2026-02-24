import { Router } from "express";
import { PurchaseOrder } from "../models/PurchaseOrder";
import { receivePurchaseOrder } from "../services/purchaseOrder.service";

const router = Router();

router.post("/:id/receive", async (req, res) => {
  try {
    const { tenantId, items } = req.body;
    const po = await receivePurchaseOrder(
      tenantId,
      req.params.id,
      items
    );
    res.json(po);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const po = await PurchaseOrder.create(req.body);
    res.status(201).json(po);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;