import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthUserFromRequest } from "@/lib/jwt";
import User from "@/models/User";

type LanguageCode =
  | "ko"
  | "en"
  | "ja"
  | "zh"
  | "vi"
  | "fr"
  | "de"
  | "es"
  | "ru"
  | "ar";

type UpdateLanguageBody = {
  appUserId?: string;
  language?: LanguageCode;
};

const SUPPORTED_LANGUAGES = [
  "ko",
  "en",
  "ja",
  "zh",
  "vi",
  "fr",
  "de",
  "es",
  "ru",
  "ar",
];

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(request: Request) {
  try {
    await connectDB();

    const authUser = getAuthUserFromRequest(request);

    if (!authUser?.userId) {
      return NextResponse.json(
        { ok: false, message: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as UpdateLanguageBody;
    const language = normalizeText(body.language).toLowerCase();
    const requestedAppUserId = normalizeText(body.appUserId);

    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return NextResponse.json(
        { ok: false, message: "지원하지 않는 언어입니다." },
        { status: 400 }
      );
    }

    const webUser = await User.findById(authUser.userId);

    if (!webUser) {
      return NextResponse.json(
        { ok: false, message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const appUserId =
      normalizeText((webUser as any).appUserId) || requestedAppUserId;

    if (!appUserId) {
      return NextResponse.json(
        { ok: false, message: "연결된 앱 계정이 없습니다." },
        { status: 400 }
      );
    }

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

    const appResponse = await fetch(
      `${baseUrl.replace(/\/$/, "")}/users/${encodeURIComponent(
        appUserId
      )}/language`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(secret ? { "x-web-auth-secret": secret } : {}),
        },
        body: JSON.stringify({ language }),
        cache: "no-store",
      }
    );

    const appResult = await appResponse.json().catch(() => null);

    if (!appResponse.ok || appResult?.success === false) {
      return NextResponse.json(
        {
          ok: false,
          message:
            appResult?.message ||
            appResult?.error ||
            "앱 계정 언어 저장에 실패했습니다.",
        },
        { status: appResponse.status || 502 }
      );
    }

    webUser.language = language;
    await webUser.save();

    return NextResponse.json({
      ok: true,
      message: "언어 설정이 저장되었습니다.",
      language,
      appUserId,
      appUser: appResult?.user || null,
    });
  } catch (error) {
    console.error("Language settings update error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "언어 설정 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}