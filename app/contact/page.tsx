"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Home,
  Mail,
  Building2,
  Bug,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertCircle,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const TOKEN_KEY = "insai_auth_token";

export default function ContactPage() {
  const { user, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    if (!isLoading && user) {
      setName(user.nickname || user.name || "");
      setEmail(user.email || "");
    }
  }, [isLoading, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token =
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

    const payload = {
      name,
      email,
      category,
      message,
    };

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Failed to submit contact form");
      }

      setMessage("");
      setCategory("");
      setSubmitStatus("success");
      setSubmitMessage(
        result.adminEmailSent
          ? "문의가 정상적으로 접수되었습니다. 관리자에게 이메일 알림도 발송되었습니다."
          : "문의가 정상적으로 접수되었습니다. 관리자 이메일 알림은 환경설정 문제로 발송되지 않았습니다."
      );
    } catch (error) {
      console.error("Contact submit error:", error);
      setSubmitStatus("error");
      setSubmitMessage("문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/insai-logo.png"
              alt="insai"
              width={40}
              height={40}
            />

            <span className="text-3xl font-extrabold">insai</span>
          </Link>

          <nav className="hidden gap-8 text-sm font-semibold text-slate-600 md:flex">
            <Link href="/">홈</Link>
            <Link href="/support">고객센터</Link>
            <Link href="/safety">안전센터</Link>
          </nav>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold shadow-sm"
          >
            <Home className="h-4 w-4" />
            홈으로
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-24 text-center">
        <p className="font-black text-sky-500">Contact Us</p>

        <h1 className="mt-4 text-4xl font-black md:text-6xl">
          insai 문의하기
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          서비스 제휴, 버그 신고, 계정 문의, 신고 및 안전 관련 문의를
          남겨주세요.
        </p>
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-6 px-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Mail, title: "일반 문의", desc: "서비스 이용 문의" },
          { icon: Bug, title: "버그 신고", desc: "오류 및 문제 제보" },
          { icon: ShieldAlert, title: "안전 문의", desc: "신고 및 차단 관련" },
          { icon: Building2, title: "제휴 문의", desc: "비즈니스 및 협업" },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-3xl bg-white p-8 shadow-lg shadow-sky-100"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
                <Icon className="h-7 w-7 text-violet-500" />
              </div>

              <h3 className="mt-6 text-xl font-black">{item.title}</h3>
              <p className="mt-3 text-slate-600">{item.desc}</p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto mt-20 max-w-4xl px-6 pb-24">
        <div className="rounded-[36px] bg-white p-10 shadow-xl shadow-sky-100 md:p-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-black">문의 양식</h2>
              {user ? (
                <p className="mt-3 text-sm font-bold text-slate-500">
                  로그인 계정 이메일로 문의가 저장됩니다.
                </p>
              ) : (
                <p className="mt-3 text-sm font-bold text-amber-600">
                  로그인하면 내 문의내역에서 문의 상태와 답변을 확인할 수 있습니다.
                </p>
              )}
            </div>

            {user && (
              <Link
                href="/my-inquiries"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-violet-200"
              >
                내 문의내역 보기
              </Link>
            )}
          </div>

          {user && (
            <div className="mt-8 flex items-center gap-3 rounded-3xl bg-slate-50 p-5">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="profile"
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-6 w-6 text-violet-500" />
                )}
              </div>

              <div>
                <p className="font-black">{user.nickname || user.name || "insai 유저"}</p>
                <p className="text-sm font-bold text-slate-500">{user.email}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 grid gap-6">
            <input
              name="name"
              type="text"
              placeholder="이름"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-violet-400"
            />

            <input
              name="email"
              type="email"
              placeholder="이메일"
              required
              value={email}
              readOnly={Boolean(user?.email)}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-violet-400 read-only:bg-slate-50 read-only:text-slate-500"
            />

            <select
              name="category"
              required
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-violet-400"
            >
              <option value="" disabled>
                문의 유형 선택
              </option>
              <option value="일반 문의">일반 문의</option>
              <option value="버그 신고">버그 신고</option>
              <option value="안전 문의">안전 문의</option>
              <option value="제휴 문의">제휴 문의</option>
            </select>

            <textarea
              name="message"
              rows={6}
              placeholder="문의 내용을 입력해주세요."
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-violet-400"
            />

            {submitStatus === "success" && (
              <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-600">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{submitMessage}</span>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-5 font-bold text-rose-600">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{submitMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-8 py-4 font-bold text-white shadow-lg shadow-violet-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-5 w-5" />
              {isSubmitting ? "전송 중..." : "문의 보내기"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
