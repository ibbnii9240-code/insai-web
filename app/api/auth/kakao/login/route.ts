import { NextResponse } from "next/server";

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID as string;

const KAKAO_REDIRECT_URI =
  process.env.KAKAO_REDIRECT_URI ??
  "http://localhost:3000/api/auth/kakao/callback";

if (!KAKAO_CLIENT_ID) {
  throw new Error("KAKAO_CLIENT_ID is not defined in .env.local");
}

export async function GET() {
  const params = new URLSearchParams({
    client_id: KAKAO_CLIENT_ID,
    redirect_uri: KAKAO_REDIRECT_URI,
    response_type: "code",
  });

  return NextResponse.redirect(
    `https://kauth.kakao.com/oauth/authorize?${params.toString()}`
  );
}
