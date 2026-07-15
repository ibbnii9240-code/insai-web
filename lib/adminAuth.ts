import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import AdminUser, {
  type AdminPermission,
  type AdminRole,
} from "@/models/AdminUser";

const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24;

export type CurrentAdmin = {
  id: string;
  username: string;
  name: string;
  role: AdminRole;
  source: "env" | "database";
  permissions: AdminPermission[];
};

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function defaultPermissions(role: AdminRole): AdminPermission[] {
  if (role === "owner") {
    return [
      "dashboard",
      "reports",
      "contacts",
      "users",
      "subscriptions",
      "revenue",
      "staff",
      "operationLogs",
    ];
  }

  return ["dashboard", "reports", "contacts", "users"];
}

export async function authenticateAdmin(
  usernameInput: string,
  passwordInput: string,
  requestIp = ""
): Promise<CurrentAdmin | null> {
  const username = normalize(usernameInput).toLowerCase();
  const password = normalize(passwordInput);

  if (!username || !password) return null;

  const ownerUsername = normalize(
    process.env.OWNER_USERNAME || process.env.OWNER_EMAIL
  ).toLowerCase();
  const ownerPassword = normalize(process.env.OWNER_PASSWORD);

  if (
    ownerUsername &&
    ownerPassword &&
    username === ownerUsername &&
    password === ownerPassword
  ) {
    return {
      id: "env-owner",
      username: ownerUsername,
      name: "Owner",
      role: "owner",
      source: "env",
      permissions: defaultPermissions("owner"),
    };
  }

  const staffUsername = normalize(
    process.env.STAFF_USERNAME || process.env.STAFF_EMAIL
  ).toLowerCase();
  const staffPassword = normalize(process.env.STAFF_PASSWORD);

  if (
    staffUsername &&
    staffPassword &&
    username === staffUsername &&
    password === staffPassword
  ) {
    return {
      id: "env-staff",
      username: staffUsername,
      name: "Staff",
      role: "staff",
      source: "env",
      permissions: defaultPermissions("staff"),
    };
  }

  await connectDB();

  const admin = await AdminUser.findOne({ username })
    .select("+passwordHash")
    .lean();

  if (!admin || admin.status !== "active") return null;

  const passwordMatches = await bcrypt.compare(
    password,
    admin.passwordHash
  );

  if (!passwordMatches) return null;

  await AdminUser.updateOne(
    { _id: admin._id },
    {
      $set: {
        lastLoginAt: new Date(),
        lastLoginIp: requestIp,
      },
    }
  );

  return {
    id: String(admin._id),
    username: admin.username,
    name: admin.name,
    role: admin.role,
    source: "database",
    permissions:
      Array.isArray(admin.permissions) && admin.permissions.length > 0
        ? admin.permissions
        : defaultPermissions(admin.role),
  };
}

export async function setAdminSession(admin: CurrentAdmin) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  const common = {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  };

  cookieStore.set("insai_admin_auth", "true", common);
  cookieStore.set("insai_admin_role", admin.role, common);
  cookieStore.set("insai_admin_id", admin.id, common);
  cookieStore.set(
    "insai_admin_name",
    encodeURIComponent(admin.name),
    common
  );
  cookieStore.set(
    "insai_admin_permissions",
    encodeURIComponent(JSON.stringify(admin.permissions)),
    common
  );
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete("insai_admin_auth");
  cookieStore.delete("insai_admin_role");
  cookieStore.delete("insai_admin_id");
  cookieStore.delete("insai_admin_name");
  cookieStore.delete("insai_admin_permissions");
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const cookieStore = await cookies();

  if (cookieStore.get("insai_admin_auth")?.value !== "true") {
    return null;
  }

  const role =
    cookieStore.get("insai_admin_role")?.value === "owner"
      ? "owner"
      : "staff";

  const id = cookieStore.get("insai_admin_id")?.value || "";
  const encodedName =
    cookieStore.get("insai_admin_name")?.value || "";

  let name = role === "owner" ? "Owner" : "Staff";
  let permissions = defaultPermissions(role);

  try {
    if (encodedName) name = decodeURIComponent(encodedName);
  } catch {}

  try {
    const encodedPermissions =
      cookieStore.get("insai_admin_permissions")?.value || "";
    if (encodedPermissions) {
      const parsed = JSON.parse(
        decodeURIComponent(encodedPermissions)
      );
      if (Array.isArray(parsed)) permissions = parsed;
    }
  } catch {}

  return {
    id,
    username: "",
    name,
    role,
    source: id.startsWith("env-") ? "env" : "database",
    permissions,
  };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}

export async function requireOwner() {
  const admin = await requireAdmin();
  if (admin.role !== "owner") throw new Error("FORBIDDEN");
  return admin;
}
