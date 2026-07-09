"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Apple,
  Globe,
  Home,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

function getErrorMessage(error: string | null) {
  if (!error) return "";

  if (error === "suspended") {
    return "정지된 계정입니다. 고객센터로 문의해주세요.";
  }

  if (error === "deleted") {
    return "탈퇴 처리된 계정입니다.";
  }

  if (error === "google_token_failed") {
    return "Google 인증 토큰을 가져오지 못했습니다.";
  }

  if (error === "google_user_failed") {
    return "Google 사용자 정보를 가져오지 못했습니다.";
  }

  if (error === "google_callback_failed") {
    return "Google 로그인 처리 중 오류가 발생했습니다.";
  }

  return "로그인 처리 중 오류가 발생했습니다.";
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorMessage = getErrorMessage(searchParams.get("error"));

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
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

      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="font-black text-sky-500">Welcome to insai</p>
          <h1 className="mt-5 text-5xl font-black leading-tight md:text-7xl">
            하나의 계정으로
            <br />
            앱과 웹을 함께.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            Google, Kakao, Apple 계정으로 로그인하고 insai 앱과 홈페이지에서
            같은 프로필, 문의내역, 신고내역, 구독 정보를 사용할 수 있습니다.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "안전한 로그인",
                desc: "비밀번호 없이 소셜 계정 기반",
              },
              {
                icon: MessageCircle,
                title: "문의내역 연동",
                desc: "답변과 상태를 한 곳에서 확인",
              },
              {
                icon: Apple,
                title: "앱/웹 통합",
                desc: "insai 앱과 같은 계정 사용",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl bg-white p-6 shadow-lg shadow-sky-100"
                >
                  <Icon className="h-7 w-7 text-violet-500" />
                  <h3 className="mt-4 font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[36px] bg-white p-8 shadow-2xl shadow-sky-100 md:p-10">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-100 to-violet-100">
              <Image src="/insai-logo.png" alt="insai" width={52} height={52} />
            </div>

            <h2 className="mt-6 text-3xl font-black">로그인</h2>
            <p className="mt-3 leading-7 text-slate-500">
              닉네임/비밀번호 회원가입 없이 소셜 계정으로 시작하세요.
            </p>
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-2xl bg-rose-50 px-5 py-4 text-sm font-bold text-rose-600">
              {errorMessage}
            </div>
          )}

          <div className="mt-8 grid gap-4">
            <Link
              href="/api/auth/google/login"
              className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black shadow-sm transition hover:bg-slate-50"
            >
              <Globe className="h-5 w-5" />
              Google로 계속하기
            </Link>

            <button
              type="button"
              onClick={() => alert("Kakao 로그인은 다음 단계에서 연결할 예정입니다.")}
              className="flex items-center justify-center gap-3 rounded-2xl bg-[#FEE500] px-6 py-4 font-black text-[#191919] shadow-sm transition hover:brightness-95"
            >
              <MessageCircle className="h-5 w-5" />
              Kakao로 계속하기
            </button>

            <button
              type="button"
              onClick={() => alert("Apple 로그인은 다음 단계에서 연결할 예정입니다.")}
              className="flex items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 font-black text-white shadow-sm transition hover:bg-slate-800"
            >
              <Apple className="h-5 w-5" />
              Apple로 계속하기
            </button>
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-slate-400">
            Google 로그인은 실제 OAuth로 연결되어 있습니다. Kakao와 Apple은
            다음 단계에서 연결합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
