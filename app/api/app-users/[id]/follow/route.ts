import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const targetUserId = normalizeText(id);
    const body = (await request.json()) as {
      myId?: string;
    };
    const myId = normalizeText(body.myId);

    if (!targetUserId || !myId) {
      return NextResponse.json(
        {
          ok: false,
          message: "내 사용자 ID와 상대방 ID가 필요합니다.",
        },
        { status: 400 }
      );
    }

    if (targetUserId === myId) {
      return NextResponse.json(
        {
          ok: false,
          message: "자기 자신은 팔로우할 수 없습니다.",
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
        targetUserId
      )}/follow`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
        body: JSON.stringify({
          myId,
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
            result?.message ||
            result?.error ||
            "팔로우 처리에 실패했습니다.",
        },
        { status: response.status }
      );
    }

    let isFollowing = result?.isFollowing;

    if (typeof isFollowing !== "boolean") {
      isFollowing =
        result?.following ??
        result?.followed ??
        result?.success ??
        false;
    }

    return NextResponse.json({
      ok: true,
      isFollowing: Boolean(isFollowing),
      followerCount:
        typeof result?.followerCount === "number"
          ? result.followerCount
          : undefined,
      data: result,
    });
  } catch (error) {
    console.error("App follow API error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "팔로우 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}