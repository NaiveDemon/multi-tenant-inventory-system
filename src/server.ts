import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import orderRoutes from "./routes/order.routes";
import tenantRoutes from "./routes/tenant.routes";
import variantRoutes from "./routes/variant.routes";
import purchaseOrderRoutes from "./routes/purchaseOrder.routes";
import dashboardRoutes from "./routes/dashboard.routes";

dotenv.config();

const app = express();

app.use(express.json());
app.use("/api/orders", orderRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/dashboard", dashboardRoutes);

connectDB();

app.get("/", (req, res) => {
  res.send("Inventory API Running");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});