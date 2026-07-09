"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Home, Sparkles } from "lucide-react";
import { getStoredAuthToken, useAuth } from "@/contexts/AuthContext";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading, refreshMe } = useAuth();

  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [country, setCountry] = useState("KR");
  const [language, setLanguage] = useState("ko");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToMarketing, setAgreedToMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }

    if (user?.isProfileCompleted) {
      router.push("/mypage");
    }
  }, [isLoading, user, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getStoredAuthToken();

    if (!token) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/auth/onboarding", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nickname,
          birthDate,
          gender,
          country,
          language,
          agreedToTerms,
          agreedToPrivacy,
          agreedToMarketing,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        alert(result.message || "온보딩 저장에 실패했습니다.");
        return;
      }

      await refreshMe();
      router.push("/mypage");
    } catch (error) {
      alert("온보딩 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

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

      <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16">
        <div className="text-center">
          <p className="font-black text-violet-500">Profile Setup</p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            insai 시작하기
          </h1>
          <p className="mt-5 max-w-2xl leading-8 text-slate-600">
            처음 로그인한 계정입니다. 앱과 웹에서 함께 사용할 기본 프로필을
            설정해주세요.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-12 w-full rounded-[36px] bg-white p-8 shadow-2xl shadow-sky-100 md:p-10"
        >
          <div className="grid gap-6">
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="닉네임"
              required
              className="rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-violet-400"
            />

            <input
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              type="date"
              className="rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-violet-400"
            />

            <select
              value={gender}
              onChange={(event) =>
                setGender(event.target.value as "male" | "female" | "other" | "")
              }
              className="rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-violet-400"
            >
              <option value="">성별 선택</option>
              <option value="female">여성</option>
              <option value="male">남성</option>
              <option value="other">기타</option>
            </select>

            <select
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-violet-400"
            >
              <option value="KR">대한민국</option>
              <option value="JP">일본</option>
              <option value="US">미국</option>
              <option value="CN">중국</option>
              <option value="VN">베트남</option>
              <option value="FR">프랑스</option>
            </select>

            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-violet-400"
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>

            <div className="rounded-3xl bg-slate-50 p-5">
              <label className="flex items-center gap-3 font-bold">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(event) => setAgreedToTerms(event.target.checked)}
                />
                이용약관 동의 필수
              </label>

              <label className="mt-4 flex items-center gap-3 font-bold">
                <input
                  type="checkbox"
                  checked={agreedToPrivacy}
                  onChange={(event) => setAgreedToPrivacy(event.target.checked)}
                />
                개인정보 처리방침 동의 필수
              </label>

              <label className="mt-4 flex items-center gap-3 font-bold text-slate-500">
                <input
                  type="checkbox"
                  checked={agreedToMarketing}
                  onChange={(event) =>
                    setAgreedToMarketing(event.target.checked)
                  }
                />
                마케팅 알림 동의 선택
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-8 py-4 font-black text-white shadow-lg shadow-violet-200 disabled:opacity-50"
            >
              <Sparkles className="h-5 w-5" />
              {isSubmitting ? "저장 중..." : "프로필 설정 완료"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
