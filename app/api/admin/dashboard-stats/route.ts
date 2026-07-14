import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl = process.env.APP_BACKEND_URL;
    const secret = process.env.WEB_AUTH_SECRET || "";

    if (!baseUrl) {
      return NextResponse.json(
        {
          ok: false,
          message: "APP_BACKEND_URL 환경변수가 설정되지 않았습니다.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/admin/dashboard-stats`,
      {
        headers: {
          ...(secret
            ? {
                "x-web-auth-secret": secret,
              }
            : {}),
          "ngrok-skip-browser-warning": "69420",
        },
        cache: "no-store",
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success === false) {
      return NextResponse.json(
        {
          ok: false,
          message:
            result?.message ||
            result?.error ||
            "앱 운영 통계를 불러오지 못했습니다.",
        },
        { status: response.status || 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      generatedAt: result.generatedAt,
      stats: result.stats,
      recentUsers: result.recentUsers || [],
    });
  } catch (error) {
    console.error("Admin dashboard API error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "관리자 통계 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}