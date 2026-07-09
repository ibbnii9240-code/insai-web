import { NextResponse } from "next/server";

const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID as string;

const APPLE_REDIRECT_URI =
  process.env.APPLE_REDIRECT_URI ??
  "http://localhost:3000/api/auth/apple/callback";

if (!APPLE_CLIENT_ID) {
  throw new Error("APPLE_CLIENT_ID is not defined in .env.local");
}

export async function GET() {
  const params = new URLSearchParams({
    client_id: APPLE_CLIENT_ID,
    redirect_uri: APPLE_REDIRECT_URI,
    response_type: "code",
    response_mode: "form_post",
    scope: "name email",
  });

  return NextResponse.redirect(
    `https://appleid.apple.com/auth/authorize?${params.toString()}`
  );
}
