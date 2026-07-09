import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { signAuthToken } from "@/lib/jwt";
import { syncAppUserFromWebSocialLogin } from "@/lib/appBackendAuth";
import User from "@/models/User";

const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID as string;
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET ?? "";

const KAKAO_REDIRECT_URI =
  process.env.KAKAO_REDIRECT_URI ??
  "http://localhost:3000/api/auth/kakao/callback";

if (!KAKAO_CLIENT_ID) {
  throw new Error("KAKAO_CLIENT_ID is not defined in .env.local");
}

type KakaoTokenResponse = {
  token_type?: string;
  access_token?: string;
  id_token?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

type KakaoUserInfo = {
  id: number;
  connected_at?: string;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    profile_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
      is_default_image?: boolean;
    };
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    email?: string;
    name_needs_agreement?: boolean;
    name?: string;
  };
};

function getBaseUrl(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(request: Request) {
  const baseUrl = getBaseUrl(request);

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("no_code")}`
      );
    }

    const tokenParams: Record<string, string> = {
      grant_type: "authorization_code",
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
      code,
    };

    if (KAKAO_CLIENT_SECRET) {
      tokenParams.client_secret = KAKAO_CLIENT_SECRET;
    }

    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams(tokenParams),
    });

    const tokenData = (await tokenResponse.json()) as KakaoTokenResponse;

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Kakao token error:", tokenData);

      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("kakao_token_failed")}`
      );
    }

    const userInfoResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    const kakaoUser = (await userInfoResponse.json()) as KakaoUserInfo;

    if (!userInfoResponse.ok || !kakaoUser.id) {
      console.error("Kakao userinfo error:", kakaoUser);

      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("kakao_user_failed")}`
      );
    }

    const kakaoAccount = kakaoUser.kakao_account;
    const kakaoProfile = kakaoAccount?.profile;
    const properties = kakaoUser.properties;

    const providerId = String(kakaoUser.id);
    const email = kakaoAccount?.email || "";
    const emailVerified = Boolean(kakaoAccount?.is_email_verified);
    const name =
      kakaoProfile?.nickname ||
      properties?.nickname ||
      kakaoAccount?.name ||
      "";
    const avatar =
      kakaoProfile?.profile_image_url ||
      properties?.profile_image ||
      kakaoProfile?.thumbnail_image_url ||
      properties?.thumbnail_image ||
      "";

    const appUser = await syncAppUserFromWebSocialLogin({
      provider: "kakao",
      providerId,
      email,
      name,
      avatar,
    });

    await connectDB();

    let user = await User.findOne({
      provider: "kakao",
      providerId,
    });

    const isNewUser = !user;
    const appCompleted = Boolean(appUser.onboardingCompleted);

    if (!user) {
      user = await User.create({
        provider: "kakao",
        providerId,
        appUserId: appUser.id,
        appOnboardingCompleted: appCompleted,
        email: email || appUser.email || "",
        emailVerified,
        name: name || appUser.name || "",
        avatar: avatar || appUser.avatar || "",
        nickname: appUser.username || "",
        role: "user",
        status: "active",
        isProfileCompleted: appCompleted,
        agreedToTerms: appCompleted,
        agreedToPrivacy: appCompleted,
        agreedToMarketing: false,
        country: appUser.countryCode || appUser.country || "",
        language: appUser.language || "ko",
        lastLoginAt: new Date(),
      });
    } else {
      user.appUserId = appUser.id;
      user.appOnboardingCompleted = appCompleted;
      user.email = email || appUser.email || user.email;
      user.emailVerified = Boolean(emailVerified || user.emailVerified);
      user.name = name || appUser.name || user.name;
      user.avatar = avatar || appUser.avatar || user.avatar;
      user.nickname = user.nickname || appUser.username || "";
      user.country = user.country || appUser.countryCode || appUser.country || "";
      user.language = user.language || appUser.language || "ko";
      user.isProfileCompleted = Boolean(user.isProfileCompleted || appCompleted);
      user.agreedToTerms = Boolean(user.agreedToTerms || appCompleted);
      user.agreedToPrivacy = Boolean(user.agreedToPrivacy || appCompleted);
      user.lastLoginAt = new Date();

      await user.save();
    }

    if (user.status === "suspended") {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("suspended")}`
      );
    }

    if (user.status === "deleted") {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("deleted")}`
      );
    }

    const token = signAuthToken({
      userId: String(user._id),
      role: user.role,
      provider: user.provider,
      email: user.email,
    });

    const redirectPath = user.isProfileCompleted ? "/mypage" : "/onboarding";

    const redirectUrl = new URL(`${baseUrl}/auth/callback`);
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set("next", redirectPath);
    redirectUrl.searchParams.set("new", isNewUser ? "1" : "0");

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Kakao callback error:", error);

    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent("kakao_callback_failed")}`
    );
  }
}
