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

    const base = baseUrl.replace(/\/$/, "");

    const [likesResponse, chatsResponse] = await Promise.all([
      fetch(
        `${base}/dating/likes-tab?userId=${encodeURIComponent(appUserId)}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
          cache: "no-store",
        }
      ),
      fetch(
        `${base}/dating-chat-list?userId=${encodeURIComponent(appUserId)}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
          cache: "no-store",
        }
      ),
    ]);

    const likesResult = await likesResponse.json().catch(() => null);
    const chatsResult = await chatsResponse.json().catch(() => null);

    if (!likesResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          message:
            likesResult?.error ||
            likesResult?.message ||
            "좋아요 목록을 불러오지 못했습니다.",
        },
        { status: likesResponse.status }
      );
    }

    if (!chatsResponse.ok) {
      return NextResponse.json(
        {
          ok: false,
          message:
            chatsResult?.error ||
            chatsResult?.message ||
            "매칭 목록을 불러오지 못했습니다.",
        },
        { status: chatsResponse.status }
      );
    }

    const newMatches = Array.isArray(chatsResult?.newMatches)
      ? chatsResult.newMatches.map((item: any) => ({
          ...item,
          isNew: true,
        }))
      : [];

    const chatRooms = Array.isArray(chatsResult?.chatRooms)
      ? chatsResult.chatRooms.map((item: any) => ({
          ...item,
          isNew: false,
        }))
      : [];

    return NextResponse.json({
      ok: true,
      receivedLikes: Array.isArray(likesResult?.receivedLikes)
        ? likesResult.receivedLikes
        : [],
      topUsers: Array.isArray(likesResult?.topUsers)
        ? likesResult.topUsers
        : [],
      matches: [...newMatches, ...chatRooms],
    });
  } catch (error) {
    console.error("Likes API error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "좋아요/매칭 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}