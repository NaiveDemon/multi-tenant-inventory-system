import { Schema, model } from "mongoose";

const tenantSchema = new Schema({
  name: { type: String, required: true },
}, { timestamps: true });

export const Tenant = model("Tenant", tenantSchema);