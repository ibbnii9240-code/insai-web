import { NextResponse } from "next/server";
import {
  authenticateAdmin,
  setAdminSession,
} from "@/lib/adminAuth";

function getRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username =
      typeof body?.username === "string"
        ? body.username
        : typeof body?.email === "string"
          ? body.email
          : "";

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    const admin = await authenticateAdmin(
      username,
      password,
      getRequestIp(request)
    );

    if (!admin) {
      return NextResponse.json(
        {
          ok: false,
          message: "아이디 또는 비밀번호가 올바르지 않습니다.",
        },
        { status: 401 }
      );
    }

    await setAdminSession(admin);

    return NextResponse.json({
      ok: true,
      admin: {
        id: admin.id,
        name: admin.name,
        role: admin.role,
        source: admin.source,
        permissions: admin.permissions,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "관리자 로그인 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
