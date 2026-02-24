import { Router } from "express";
import { Tenant } from "../models/Tenant";

const router = Router();

/**
 * @swagger
 * /api/tenants:
 *   post:
 *     summary: Create a new tenant
 *     tags: [Tenants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tenant A
 *     responses:
 *       201:
 *         description: Tenant created successfully
 */
router.post("/", async (req, res) => {
  try {
    const tenant = await Tenant.create({
      name: req.body.name,
    });

    res.status(201).json(tenant);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;