import { Router } from "express";
import { createOrderHandler } from "../contollers/order.controller"

const router = Router();

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new sales order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Order created successfully
 */
router.post("/", createOrderHandler);

export default router;