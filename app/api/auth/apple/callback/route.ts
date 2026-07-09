import crypto from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { signAuthToken } from "@/lib/jwt";
import { syncAppUserFromWebSocialLogin } from "@/lib/appBackendAuth";
import User from "@/models/User";

const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID as string;
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID as string;
const APPLE_KEY_ID = process.env.APPLE_KEY_ID as string;
const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY as string;

const APPLE_REDIRECT_URI =
  process.env.APPLE_REDIRECT_URI ??
  "https://insai-web-ii3h.vercel.app/api/auth/apple/callback";

if (!APPLE_CLIENT_ID) {
  throw new Error("APPLE_CLIENT_ID is not defined in environment variables");
}

if (!APPLE_TEAM_ID) {
  throw new Error("APPLE_TEAM_ID is not defined in environment variables");
}

if (!APPLE_KEY_ID) {
  throw new Error("APPLE_KEY_ID is not defined in environment variables");
}

if (!APPLE_PRIVATE_KEY) {
  throw new Error("APPLE_PRIVATE_KEY is not defined in environment variables");
}

type AppleTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
};

type AppleIdTokenPayload = {
  iss?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  is_private_email?: string | boolean;
};

type ApplePostedUser = {
  name?: {
    firstName?: string;
    lastName?: string;
  };
  email?: string;
};

function getBaseUrl(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function redirectTo(url: string | URL) {
  return NextResponse.redirect(url, 303);
}

function base64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function restorePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n");
}

function readDerLength(buffer: Buffer, offset: number) {
  let length = buffer[offset];
  offset += 1;

  if (length < 0x80) {
    return { length, offset };
  }

  const bytes = length & 0x7f;
  length = 0;

  for (let i = 0; i < bytes; i += 1) {
    length = (length << 8) | buffer[offset + i];
  }

  return { length, offset: offset + bytes };
}

function derToJose(signature: Buffer) {
  let offset = 0;

  if (signature[offset] !== 0x30) {
    throw new Error("Invalid ECDSA signature format");
  }

  offset += 1;
  const sequence = readDerLength(signature, offset);
  offset = sequence.offset;

  if (signature[offset] !== 0x02) {
    throw new Error("Invalid ECDSA signature format");
  }

  offset += 1;
  const rLength = readDerLength(signature, offset);
  offset = rLength.offset;
  let r = signature.slice(offset, offset + rLength.length);
  offset += rLength.length;

  if (signature[offset] !== 0x02) {
    throw new Error("Invalid ECDSA signature format");
  }

  offset += 1;
  const sLength = readDerLength(signature, offset);
  offset = sLength.offset;
  let s = signature.slice(offset, offset + sLength.length);

  if (r.length > 32) r = r.slice(r.length - 32);
  if (s.length > 32) s = s.slice(s.length - 32);

  if (r.length < 32) {
    r = Buffer.concat([Buffer.alloc(32 - r.length), r]);
  }

  if (s.length < 32) {
    s = Buffer.concat([Buffer.alloc(32 - s.length), s]);
  }

  return Buffer.concat([r, s]);
}

function createAppleClientSecret() {
  const now = Math.floor(Date.now() / 1000);

  const header = {
    alg: "ES256",
    kid: APPLE_KEY_ID,
  };

  const payload = {
    iss: APPLE_TEAM_ID,
    iat: now,
    exp: now + 60 * 60 * 24 * 180,
    aud: "https://appleid.apple.com",
    sub: APPLE_CLIENT_ID,
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const privateKey = crypto.createPrivateKey({
    key: restorePrivateKey(APPLE_PRIVATE_KEY),
    format: "pem",
  });

  const derSignature = crypto.sign("sha256", Buffer.from(signingInput), {
    key: privateKey,
    dsaEncoding: "der",
  });

  const joseSignature = derToJose(derSignature);

  return `${signingInput}.${base64Url(joseSignature)}`;
}

function decodeJwtPayload<T>(jwt: string): T {
  const payload = jwt.split(".")[1];

  if (!payload) {
    throw new Error("Invalid JWT payload");
  }

  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );

  return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as T;
}

function getAppleDisplayName(userParam: string | null) {
  if (!userParam) return "";

  try {
    const appleUser = JSON.parse(userParam) as ApplePostedUser;
    const firstName = appleUser.name?.firstName ?? "";
    const lastName = appleUser.name?.lastName ?? "";

    return `${lastName}${firstName}`.trim() || `${firstName} ${lastName}`.trim();
  } catch {
    return "";
  }
}

async function handleAppleCallback(request: Request, params: URLSearchParams) {
  const baseUrl = getBaseUrl(request);

  try {
    const code = params.get("code");
    const error = params.get("error");
    const userParam = params.get("user");

    if (error) {
      return redirectTo(
        `${baseUrl}/login?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return redirectTo(
        `${baseUrl}/login?error=${encodeURIComponent("no_code")}`
      );
    }

    const clientSecret = createAppleClientSecret();

    const tokenResponse = await fetch("https://appleid.apple.com/auth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: APPLE_CLIENT_ID,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: APPLE_REDIRECT_URI,
      }),
    });

    const tokenData = (await tokenResponse.json()) as AppleTokenResponse;

    if (!tokenResponse.ok || !tokenData.id_token) {
      console.error("Apple token error:", tokenData);

      return redirectTo(
        `${baseUrl}/login?error=${encodeURIComponent("apple_token_failed")}`
      );
    }

    const applePayload = decodeJwtPayload<AppleIdTokenPayload>(
      tokenData.id_token
    );

    if (!applePayload.sub) {
      console.error("Apple id token missing sub:", applePayload);

      return redirectTo(
        `${baseUrl}/login?error=${encodeURIComponent("apple_user_failed")}`
      );
    }

    const email = applePayload.email || "";
    const emailVerified =
      applePayload.email_verified === true ||
      applePayload.email_verified === "true";
    const name = getAppleDisplayName(userParam);

    const appUser = await syncAppUserFromWebSocialLogin({
      provider: "apple",
      providerId: applePayload.sub,
      email,
      name,
      avatar: "",
    });

    await connectDB();

    let user = await User.findOne({
      provider: "apple",
      providerId: applePayload.sub,
    });

    const isNewUser = !user;
    const appCompleted = Boolean(appUser.onboardingCompleted);

    if (!user) {
      user = await User.create({
        provider: "apple",
        providerId: applePayload.sub,
        appUserId: appUser.id,
        appOnboardingCompleted: appCompleted,
        email: email || appUser.email || "",
        emailVerified,
        name: name || appUser.name || "",
        avatar: appUser.avatar || "",
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
      user.avatar = appUser.avatar || user.avatar;
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
      return redirectTo(
        `${baseUrl}/login?error=${encodeURIComponent("suspended")}`
      );
    }

    if (user.status === "deleted") {
      return redirectTo(
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

    return redirectTo(redirectUrl);
  } catch (error) {
    console.error("Apple callback error:", error);

    return redirectTo(
      `${baseUrl}/login?error=${encodeURIComponent("apple_callback_failed")}`
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return handleAppleCallback(request, url.searchParams);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const params = new URLSearchParams();

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      params.set(key, value);
    }
  }

  return handleAppleCallback(request, params);
}
