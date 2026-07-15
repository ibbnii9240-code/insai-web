import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireOwner } from "@/lib/adminAuth";
import AdminUser, {
  type AdminPermission,
} from "@/models/AdminUser";

const allowedPermissions: AdminPermission[] = [
  "dashboard",
  "reports",
  "contacts",
  "users",
  "subscriptions",
  "revenue",
  "staff",
  "operationLogs",
];

function normalize(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function serializeAdmin(admin: any) {
  return {
    id: String(admin._id),
    username: admin.username,
    name: admin.name,
    role: admin.role,
    status: admin.status,
    department: admin.department || "",
    permissions: Array.isArray(admin.permissions)
      ? admin.permissions
      : [],
    lastLoginAt: admin.lastLoginAt || null,
    lastLoginIp: admin.lastLoginIp || "",
    passwordChangedAt: admin.passwordChangedAt || null,
    createdBy: admin.createdBy || "",
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
}

export async function GET() {
  try {
    await requireOwner();
    await connectDB();

    const admins = await AdminUser.find()
      .sort({ role: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      ok: true,
      staff: admins.map(serializeAdmin),
    });
  } catch (error: any) {
    const message = String(error?.message || "");

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    if (message === "FORBIDDEN") {
      return NextResponse.json(
        { ok: false, message: "오너만 접근할 수 있습니다." },
        { status: 403 }
      );
    }

    console.error("Admin staff GET error:", error);

    return NextResponse.json(
      { ok: false, message: "직원 목록을 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const owner = await requireOwner();
    await connectDB();

    const body = await request.json();

    const username = normalize(body?.username).toLowerCase();
    const password = normalize(body?.password);
    const name = normalize(body?.name);
    const department = normalize(body?.department);
    const role = body?.role === "owner" ? "owner" : "staff";

    const permissions = Array.isArray(body?.permissions)
      ? body.permissions.filter((item: unknown) =>
          allowedPermissions.includes(item as AdminPermission)
        )
      : ["dashboard", "reports", "contacts", "users"];

    if (username.length < 3) {
      return NextResponse.json(
        { ok: false, message: "아이디는 3글자 이상 입력해주세요." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, message: "비밀번호는 8글자 이상 입력해주세요." },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { ok: false, message: "이름은 2글자 이상 입력해주세요." },
        { status: 400 }
      );
    }

    const exists = await AdminUser.exists({ username });

    if (exists) {
      return NextResponse.json(
        { ok: false, message: "이미 사용 중인 관리자 아이디입니다." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await AdminUser.create({
      username,
      passwordHash,
      name,
      department,
      role,
      status: "active",
      permissions,
      createdBy: owner.id || "env-owner",
    });

    return NextResponse.json(
      {
        ok: true,
        message: "직원 계정이 생성되었습니다.",
        staff: serializeAdmin(admin),
      },
      { status: 201 }
    );
  } catch (error: any) {
    const message = String(error?.message || "");

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { ok: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    if (message === "FORBIDDEN") {
      return NextResponse.json(
        { ok: false, message: "오너만 직원 계정을 생성할 수 있습니다." },
        { status: 403 }
      );
    }

    console.error("Admin staff POST error:", error);

    return NextResponse.json(
      { ok: false, message: "직원 계정 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
