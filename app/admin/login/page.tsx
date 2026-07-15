"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import {
  ArrowRight,
  Lock,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setMessage("");

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setMessage(
          result.message || "관리자 로그인에 실패했습니다."
        );
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setMessage("관리자 로그인 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FBFF] px-5 py-10">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-100px] top-20 h-[300px] w-[300px] rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute bottom-20 right-[-100px] h-[350px] w-[350px] rounded-full bg-violet-200/40 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[36px] bg-white p-7 shadow-2xl shadow-sky-100 sm:p-10">
          <div className="flex flex-col items-center">
            <Image
              src="/insai-logo.png"
              alt="insai logo"
              width={70}
              height={70}
              className="rounded-2xl"
              priority
            />
            <h1 className="mt-5 text-4xl font-black">
              Admin Login
            </h1>
            <p className="mt-3 text-center leading-7 text-slate-500">
              환경변수 초기 계정 또는 오너가 생성한 직원 계정으로 로그인하세요.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                관리자 아이디
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 focus-within:border-violet-400">
                <UserRound className="h-5 w-5 text-slate-400" />
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  type="text"
                  autoComplete="username"
                  placeholder="관리자 아이디 또는 이메일"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                비밀번호
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4 focus-within:border-violet-400">
                <Lock className="h-5 w-5 text-slate-400" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            {message && (
              <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 py-4 font-bold text-white shadow-lg shadow-violet-200 disabled:opacity-60"
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-violet-500" />
              <span className="font-black text-slate-800">보안 안내</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              새 직원 비밀번호는 암호화되어 저장되며, 일반 웹 유저 계정과 분리됩니다.
            </p>
          </div>

          <Link
            href="/"
            className="mt-6 block text-center text-sm font-bold text-violet-500"
          >
            ← 홈페이지로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
