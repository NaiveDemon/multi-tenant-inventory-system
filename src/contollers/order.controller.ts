import { Request, Response } from "express";
import { createOrder } from "../services/order.service";

export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const { tenantId, items } = req.body;

    if (!tenantId || !items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const order = await createOrder(tenantId, items);

    return res.status(201).json(order);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};