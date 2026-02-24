import { Router } from "express";
import { PurchaseOrder } from "../models/PurchaseOrder";
import { receivePurchaseOrder } from "../services/purchaseOrder.service";

const router = Router();

/**
 * @swagger
 * /api/purchase-orders/{id}/receive:
 *   post:
 *     summary: Receive items for a purchase order (supports partial delivery)
 *     tags: [Purchase Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenantId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variantId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       200:
 *         description: Purchase order updated
 *       400:
 *         description: Invalid request
 */
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

/**
 * @swagger
 * /api/purchase-orders:
 *   post:
 *     summary: Create a purchase order
 *     tags: [Purchase Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenantId:
 *                 type: string
 *               supplierId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     variantId:
 *                       type: string
 *                     orderedQty:
 *                       type: number
 *                     price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Purchase order created
 */
router.post("/", async (req, res) => {
  try {
    const po = await PurchaseOrder.create(req.body);
    res.status(201).json(po);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;