// insai-web/lib/appBackendAuth.ts
export type WebSocialProvider = "google" | "kakao" | "apple";

export type AppBackendWebSocialLoginInput = {
  provider: WebSocialProvider;
  providerId: string;
  email?: string;
  name?: string;
  avatar?: string;
};

export type AppBackendUser = {
  id: string;
  username: string;
  name?: string | null;
  avatar?: string | null;
  email?: string | null;
  onboardingCompleted: boolean;
  country?: string | null;
  countryCode?: string | null;
  language?: string | null;
};

function normalizeText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeBoolean(value: unknown) {
  return value === true || value === "true";
}

function normalizeAppUser(data: any): AppBackendUser {
  const user = data?.user || {};
  const rawUser = data?.rawUser || {};

  const id =
    normalizeText(data?.appUserId) ||
    normalizeText(user?.id) ||
    normalizeText(user?._id) ||
    normalizeText(user?.appUserId) ||
    normalizeText(rawUser?.id) ||
    normalizeText(rawUser?._id);

  const username =
    normalizeText(user?.username) ||
    normalizeText(user?.nickname) ||
    normalizeText(user?.name) ||
    normalizeText(rawUser?.username) ||
    normalizeText(rawUser?.nickname) ||
    "insai_user";

  const onboardingCompleted =
    normalizeBoolean(data?.onboardingCompleted) ||
    normalizeBoolean(user?.onboardingCompleted) ||
    normalizeBoolean(user?.isProfileCompleted) ||
    normalizeBoolean(rawUser?.onboardingCompleted) ||
    normalizeBoolean(rawUser?.isProfileCompleted);

  return {
    id,
    username,
    name:
      normalizeText(user?.name) ||
      normalizeText(user?.nickname) ||
      normalizeText(rawUser?.name) ||
      normalizeText(rawUser?.nickname) ||
      "",
    avatar:
      normalizeText(user?.avatar) ||
      normalizeText(user?.profileImage) ||
      normalizeText(user?.image) ||
      normalizeText(rawUser?.avatar) ||
      "",
    email:
      normalizeText(user?.email) ||
      normalizeText(data?.email) ||
      normalizeText(rawUser?.email) ||
      "",
    onboardingCompleted,
    country:
      normalizeText(user?.country) ||
      normalizeText(rawUser?.country) ||
      "",
    countryCode:
      normalizeText(user?.countryCode) ||
      normalizeText(rawUser?.countryCode) ||
      "",
    language:
      normalizeText(user?.language) ||
      normalizeText(rawUser?.language) ||
      "ko",
  };
}

export async function syncAppUserFromWebSocialLogin(
  input: AppBackendWebSocialLoginInput
) {
  const baseUrl = process.env.APP_BACKEND_URL;
  const secret = process.env.WEB_AUTH_SECRET || "";

  if (!baseUrl) {
    throw new Error("APP_BACKEND_URL is not defined");
  }

  const response = await fetch(
    `${baseUrl.replace(/\/$/, "")}/auth/web-social-login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "x-web-auth-secret": secret } : {}),
      },
      body: JSON.stringify(input),
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    console.error("App backend web social login failed:", data);
    throw new Error(data?.message || "앱 백엔드 유저 연동 실패");
  }

  const appUser = normalizeAppUser(data);

  if (!appUser.id) {
    console.error("App backend web social login missing app user id:", data);
    throw new Error("앱 백엔드 유저 ID를 찾지 못했습니다.");
  }

  return appUser;
}