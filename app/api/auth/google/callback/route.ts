import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { signAuthToken } from "@/lib/jwt";
import { syncAppUserFromWebSocialLogin } from "@/lib/appBackendAuth";
import User from "@/models/User";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;

const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ??
  "http://localhost:3000/api/auth/google/callback";

if (!GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not defined in .env.local");
}

if (!GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_SECRET is not defined in .env.local");
}

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
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

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("Google token error:", tokenData);

      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("google_token_failed")}`
      );
    }

    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const googleUser = (await userInfoResponse.json()) as GoogleUserInfo;

    if (!userInfoResponse.ok || !googleUser.sub) {
      console.error("Google userinfo error:", googleUser);

      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent("google_user_failed")}`
      );
    }

    const appUser = await syncAppUserFromWebSocialLogin({
      provider: "google",
      providerId: googleUser.sub,
      email: googleUser.email || "",
      name: googleUser.name || "",
      avatar: googleUser.picture || "",
    });

    await connectDB();

    let user = await User.findOne({
      provider: "google",
      providerId: googleUser.sub,
    });

    const isNewUser = !user;
    const appCompleted = Boolean(appUser.onboardingCompleted);

    if (!user) {
      user = await User.create({
        provider: "google",
        providerId: googleUser.sub,
        appUserId: appUser.id,
        appOnboardingCompleted: appCompleted,
        email: googleUser.email || appUser.email || "",
        emailVerified: Boolean(googleUser.email_verified),
        name: googleUser.name || appUser.name || "",
        avatar: googleUser.picture || appUser.avatar || "",
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
      user.email = googleUser.email || appUser.email || user.email;
      user.emailVerified = Boolean(
        googleUser.email_verified || user.emailVerified
      );
      user.name = googleUser.name || appUser.name || user.name;
      user.avatar = googleUser.picture || appUser.avatar || user.avatar;
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
    console.error("Google callback error:", error);

    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent("google_callback_failed")}`
    );
  }
}
