"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Home, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const TOKEN_KEY = "insai_auth_token";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshMe } = useAuth();
  const [message, setMessage] = useState("로그인 정보를 저장하는 중입니다.");

  useEffect(() => {
    async function completeLogin() {
      const token = searchParams.get("token");
      const next = searchParams.get("next") || "/mypage";

      if (!token) {
        setMessage("로그인 토큰이 없습니다. 다시 로그인해주세요.");
        setTimeout(() => router.replace("/login?error=no_token"), 700);
        return;
      }

      localStorage.setItem(TOKEN_KEY, token);

      try {
        await refreshMe();
      } catch (error) {
        console.error("Refresh me after Google login failed:", error);
      }

      setMessage("로그인 완료! 이동 중입니다.");
      router.replace(next);
    }

    completeLogin();
  }, [router, searchParams, refreshMe]);

  return <AuthCallbackView message={message} />;
}

function AuthCallbackView({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen flex-col bg-[#F8FBFF] text-slate-900">
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/insai-logo.png" alt="insai" width={40} height={40} />
            <span className="text-3xl font-extrabold">insai</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold shadow-sm"
          >
            <Home className="h-4 w-4" />
            홈으로
          </Link>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md rounded-[36px] bg-white p-10 text-center shadow-2xl shadow-sky-100">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-violet-100">
            <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
          </div>

          <h1 className="mt-7 text-3xl font-black">Google 로그인 처리 중</h1>
          <p className="mt-4 leading-7 text-slate-500">{message}</p>
        </div>
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<AuthCallbackView message="로그인 정보를 확인하는 중입니다." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
