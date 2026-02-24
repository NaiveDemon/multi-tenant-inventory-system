import { Router } from "express";
import { createOrderHandler } from "../contollers/order.controller"

const router = Router();

router.post("/", createOrderHandler);

export default router;