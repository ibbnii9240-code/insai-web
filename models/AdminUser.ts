import mongoose, { Schema, models, model } from "mongoose";

export type AdminRole = "owner" | "staff";
export type AdminStatus = "active" | "suspended";

export type AdminPermission =
  | "dashboard"
  | "reports"
  | "contacts"
  | "users"
  | "subscriptions"
  | "revenue"
  | "staff"
  | "operationLogs";

export type AdminUserDocument = {
  _id: mongoose.Types.ObjectId;
  username: string;
  passwordHash: string;
  name: string;
  role: AdminRole;
  status: AdminStatus;
  department?: string;
  permissions: AdminPermission[];
  lastLoginAt?: Date | null;
  lastLoginIp?: string;
  passwordChangedAt?: Date | null;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
};

const AdminUserSchema = new Schema<AdminUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 40,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    role: {
      type: String,
      enum: ["owner", "staff"],
      default: "staff",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      index: true,
    },
    department: {
      type: String,
      trim: true,
      default: "",
      maxlength: 80,
    },
    permissions: {
      type: [String],
      enum: [
        "dashboard",
        "reports",
        "contacts",
        "users",
        "subscriptions",
        "revenue",
        "staff",
        "operationLogs",
      ],
      default: ["dashboard", "reports", "contacts", "users"],
    },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, trim: true, default: "" },
    passwordChangedAt: { type: Date, default: null },
    createdBy: { type: String, trim: true, default: "env-owner" },
  },
  { timestamps: true }
);

AdminUserSchema.index({ role: 1, status: 1 });
AdminUserSchema.index({ createdAt: -1 });

const AdminUser =
  models.AdminUser ||
  model<AdminUserDocument>("AdminUser", AdminUserSchema);

export default AdminUser;
