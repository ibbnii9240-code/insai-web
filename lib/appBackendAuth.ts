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

  if (!response.ok || !data?.success || !data?.user?.id) {
    console.error("App backend web social login failed:", data);
    throw new Error(data?.message || "앱 백엔드 유저 연동 실패");
  }

  return data.user as AppBackendUser;
}
