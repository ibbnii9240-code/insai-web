import { NextResponse } from "next/server";

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const appUserId = normalizeText(url.searchParams.get("appUserId"));

    if (!appUserId) {
      return NextResponse.json(
        {
          ok: false,
          message: "App User ID가 필요합니다.",
        },
        { status: 400 }
      );
    }

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

    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/users/${encodeURIComponent(
        appUserId
      )}/mutual-followers`,
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
            "앱 친구 목록을 불러오지 못했습니다.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ok: true,
      friends: Array.isArray(result) ? result : [],
    });
  } catch (error) {
    console.error("Friends API error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "친구 목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
