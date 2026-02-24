import { Router } from "express";
import { Variant } from "../models/Variant";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const variant = await Variant.create(req.body);
    res.status(201).json(variant);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;