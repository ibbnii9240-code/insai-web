import { NextResponse } from "next/server";

type SwipeAction = "LIKE" | "PASS" | "SUPER_LIKE";

type ActionBody = {
  appUserId?: string;
  targetId?: string;
  action?: SwipeAction;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ActionBody;

    const appUserId = normalizeText(body.appUserId);
    const targetId = normalizeText(body.targetId);
    const action = normalizeText(body.action).toUpperCase() as SwipeAction;

    if (!appUserId || !targetId) {
      return NextResponse.json(
        {
          ok: false,
          message: "내 사용자 ID와 상대방 ID가 필요합니다.",
        },
        { status: 400 }
      );
    }

    if (!["LIKE", "PASS", "SUPER_LIKE"].includes(action)) {
      return NextResponse.json(
        {
          ok: false,
          message: "올바르지 않은 좋아요 액션입니다.",
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
      `${baseUrl.replace(/\/$/, "")}/swipe`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({
          userId: appUserId,
          targetId,
          action,
        }),
        cache: "no-store",
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          message:
            result?.error ||
            result?.message ||
            "좋아요 처리에 실패했습니다.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ok: true,
      matched: Boolean(result?.matched),
      chatRoomId: result?.chatRoomId || "",
      isSuperMatch: Boolean(result?.isSuperMatch),
      data: result,
    });
  } catch (error) {
    console.error("Likes action API error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "좋아요 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}