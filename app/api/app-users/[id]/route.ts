import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const userId = normalizeText(id);

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          message: "사용자 ID가 필요합니다.",
        },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const myId = normalizeText(url.searchParams.get("myId"));
    const baseUrl = process.env.APP_BACKEND_URL;

    if (!baseUrl) {
      return NextResponse.json(
        {
          ok: false,
          message: "APP_BACKEND_URL 환경변수가 설정되지 않았습니다.",
        },
        { status: 500 }
      );
    }

    const query = myId ? `?myId=${encodeURIComponent(myId)}` : "";

    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/users/${encodeURIComponent(
        userId
      )}${query}`,
      {
        headers: {
          "ngrok-skip-browser-warning": "69420",
        },
        cache: "no-store",
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          message:
            result?.message ||
            result?.error ||
            "앱 사용자 프로필을 불러오지 못했습니다.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ok: true,
      user: result,
    });
  } catch (error) {
    console.error("App user profile API error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "사용자 프로필 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}