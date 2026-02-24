import { Router } from "express";
import { Variant } from "../models/Variant";

const router = Router();

/**
 * @swagger
 * /api/variants:
 *   post:
 *     summary: Create a product variant (SKU)
 *     tags: [Variants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tenantId:
 *                 type: string
 *               productId:
 *                 type: string
 *               sku:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: number
 *               reorderLevel:
 *                 type: number
 *     responses:
 *       201:
 *         description: Variant created successfully
 */
router.post("/", async (req, res) => {
  try {
    const variant = await Variant.create(req.body);
    res.status(201).json(variant);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;