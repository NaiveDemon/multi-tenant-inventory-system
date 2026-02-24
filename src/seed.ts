import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { Tenant } from "./models/Tenant";
import { Variant } from "./models/Variant";
import dotenv from "dotenv";
dotenv.config();

const seed = async () => {
  await connectDB();

  await mongoose.connection.dropDatabase();

  const tenant1 = await Tenant.create({ name: "Tenant A" });
  const tenant2 = await Tenant.create({ name: "Tenant B" });

  await Variant.create([
    {
      tenantId: tenant1._id,
      productId: new mongoose.Types.ObjectId(),
      sku: "A-TSHIRT-M-RED",
      attributes: { size: "M", color: "Red" },
      price: 100,
      stock: 10,
      reorderLevel: 3,
    },
    {
      tenantId: tenant2._id,
      productId: new mongoose.Types.ObjectId(),
      sku: "B-TSHIRT-L-BLUE",
      attributes: { size: "L", color: "Blue" },
      price: 120,
      stock: 5,
      reorderLevel: 2,
    },
  ]);

  console.log("Seed completed");
  process.exit(0);
};

seed();