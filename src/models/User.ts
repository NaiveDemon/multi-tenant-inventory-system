import { Schema, model } from "mongoose";

export enum Role {
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  STAFF = "STAFF"
}

const userSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: Object.values(Role), required: true }
}, { timestamps: true });

export const User = model("User", userSchema);