import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireOwner } from "@/lib/adminAuth";
import AdminUser, {
  type AdminPermission,
} from "@/models/AdminUser";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const owner = await requireOwner();
    await connectDB();

    const { id } = await context.params;
    const body = await request.json();

    const admin = await AdminUser.findById(id).select("+passwordHash");

    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "직원 계정을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (owner.id === String(admin._id)) {
      return NextResponse.json(
        {
          ok: false,
          message: "현재 로그인한 오너 계정은 직접 수정할 수 없습니다.",
        },
        { status: 400 }
      );
    }

    if (typeof body?.name === "string") {
      const name = normalize(body.name);

      if (name.length < 2) {
        return NextResponse.json(
          { ok: false, message: "이름은 2글자 이상 입력해주세요." },
          { status: 400 }
        );
      }

      admin.name = name;
    }

    if (typeof body?.department === "string") {
      admin.department = normalize(body.department);
    }

    if (body?.role === "owner" || body?.role === "staff") {
      admin.role = body.role;
    }

    if (body?.status === "active" || body?.status === "suspended") {
      admin.status = body.status;
    }

    if (Array.isArray(body?.permissions)) {
      admin.permissions = body.permissions.filter((item: unknown) =>
        allowedPermissions.includes(item as AdminPermission)
      );
    }

    if (typeof body?.password === "string" && body.password.trim()) {
      const password = body.password.trim();

      if (password.length < 8) {
        return NextResponse.json(
          {
            ok: false,
            message: "새 비밀번호는 8글자 이상 입력해주세요.",
          },
          { status: 400 }
        );
      }

      admin.passwordHash = await bcrypt.hash(password, 12);
      admin.passwordChangedAt = new Date();
    }

    await admin.save();

    return NextResponse.json({
      ok: true,
      message: "직원 계정이 수정되었습니다.",
      staff: serializeAdmin(admin),
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
        { ok: false, message: "오너만 수정할 수 있습니다." },
        { status: 403 }
      );
    }

    console.error("Admin staff PATCH error:", error);

    return NextResponse.json(
      { ok: false, message: "직원 계정 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const owner = await requireOwner();
    await connectDB();

    const { id } = await context.params;
    const admin = await AdminUser.findById(id);

    if (!admin) {
      return NextResponse.json(
        { ok: false, message: "직원 계정을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (owner.id === String(admin._id)) {
      return NextResponse.json(
        {
          ok: false,
          message: "현재 로그인한 오너 계정은 삭제할 수 없습니다.",
        },
        { status: 400 }
      );
    }

    await admin.deleteOne();

    return NextResponse.json({
      ok: true,
      message: "직원 계정이 삭제되었습니다.",
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
        { ok: false, message: "오너만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    console.error("Admin staff DELETE error:", error);

    return NextResponse.json(
      { ok: false, message: "직원 계정 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
