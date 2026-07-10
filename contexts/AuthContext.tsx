"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type InsaiUser = {
  id: string;
  provider: "google" | "kakao" | "apple";
  providerId: string;
  email?: string;
  emailVerified?: boolean;
  nickname?: string;
  name?: string;
  avatar?: string;
  birthDate?: string | null;
  gender?: "male" | "female" | "other" | "";
  country?: string;
  language?: string;
  role: "user" | "staff" | "owner";
  status: "active" | "suspended" | "deleted";
  isProfileCompleted: boolean;
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  agreedToMarketing: boolean;

  // 앱 DB 연결 정보
  appUserId?: string;
  appOnboardingCompleted?: boolean;

  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type SocialLoginPayload = {
  provider: "google" | "kakao" | "apple";
  providerId: string;
  email?: string;
  name?: string;
  avatar?: string;
  emailVerified?: boolean;
};

type AuthContextValue = {
  user: InsaiUser | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  loginWithSocial: (payload: SocialLoginPayload) => Promise<{
    ok: boolean;
    needsOnboarding?: boolean;
    message?: string;
  }>;
  refreshMe: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "insai_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<InsaiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveToken = useCallback((nextToken: string) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    const currentToken = localStorage.getItem(TOKEN_KEY);

    if (!currentToken) {
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/me", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        logout();
        return;
      }

      setToken(currentToken);
      setUser(result.user);
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const loginWithSocial = useCallback(
    async (payload: SocialLoginPayload) => {
      try {
        setIsLoading(true);

        const response = await fetch("/api/auth/social", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
          return {
            ok: false,
            message: result.message || "로그인에 실패했습니다.",
          };
        }

        saveToken(result.token);
        setUser(result.user);

        return {
          ok: true,
          needsOnboarding: result.needsOnboarding,
        };
      } catch (error) {
        return {
          ok: false,
          message: "로그인 처리 중 오류가 발생했습니다.",
        };
      } finally {
        setIsLoading(false);
      }
    },
    [saveToken]
  );

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isLoggedIn: Boolean(user && token),
      loginWithSocial,
      refreshMe,
      logout,
    }),
    [user, token, isLoading, loginWithSocial, refreshMe, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

export function getStoredAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}