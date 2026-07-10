import { NextResponse } from "next/server";

export async function GET() {
  const kakaoClientId = process.env.KAKAO_CLIENT_ID;
  const kakaoRedirectUri = process.env.KAKAO_REDIRECT_URI;

  if (!kakaoClientId) {
    return NextResponse.json(
      {
        ok: false,
        message: "KAKAO_CLIENT_ID 환경변수가 설정되지 않았습니다.",
      },
      { status: 500 }
    );
  }

  if (!kakaoRedirectUri) {
    return NextResponse.json(
      {
        ok: false,
        message: "KAKAO_REDIRECT_URI 환경변수가 설정되지 않았습니다.",
      },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: kakaoClientId,
    redirect_uri: kakaoRedirectUri,
    response_type: "code",
  });

  return NextResponse.redirect(
    `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
  );
}