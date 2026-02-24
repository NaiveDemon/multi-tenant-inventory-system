import { Router } from "express";
import { Tenant } from "../models/Tenant";

const router = Router();

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