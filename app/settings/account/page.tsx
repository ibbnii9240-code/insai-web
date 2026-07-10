"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Home,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const TOKEN_KEY = "insai_auth_token";

function providerLabel(provider?: string) {
  if (provider === "google") return "Google";
  if (provider === "kakao") return "Kakao";
  if (provider === "apple") return "Apple";
  return provider || "Social";
}

function statusLabel(status?: string) {
  if (status === "active") return "정상";
  if (status === "suspended") return "정지";
  if (status === "deleted") return "탈퇴";
  return status || "정상";
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });
}

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const safeUser = user as any;
  const appUserId = safeUser?.appUserId || safeUser?.appId || "";
  const webUserId = safeUser?.id || "";
  const email = safeUser?.email || "";

  const [deleteReason, setDeleteReason] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmitDeleteRequest = useMemo(() => {
    return deleteReason.trim().length >= 2 && deleteConfirmText.trim() === "탈퇴 요청";
  }, [deleteReason, deleteConfirmText]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }

    if (!isLoading && user && !user.isProfileCompleted) {
      router.push("/onboarding");
    }
  }, [isLoading, user, router]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  async function handleDeleteRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !canSubmitDeleteRequest) {
      return;
    }

    const token =
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

    try {
      setIsSubmitting(true);
      setSubmitMessage("");
      setErrorMessage("");

      const message = [
        "[탈퇴 요청]",
        "",
        `닉네임: ${safeUser.nickname || safeUser.name || "insai 유저"}`,
        `이메일: ${email || "이메일 없음"}`,
        `Web User ID: ${webUserId || "-"}`,
        `App User ID: ${appUserId || "-"}`,
        "",
        "탈퇴 사유:",
        deleteReason.trim(),
        "",
        "요청 내용:",
        "insai 계정 탈퇴 및 관련 개인정보 삭제를 요청합니다.",
      ].join("\n");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name: safeUser.nickname || safeUser.name || "insai 유저",
          email,
          category: "탈퇴 요청",
          message,
          userId: appUserId,
          appUserId,
          webUserId,
          source: "web",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "탈퇴 요청 접수에 실패했습니다.");
      }

      setSubmitMessage(
        "탈퇴 요청이 접수되었습니다. 운영팀 확인 후 처리 결과를 내 문의내역과 이메일로 안내해드릴게요."
      );
      setDeleteReason("");
      setDeleteConfirmText("");
    } catch (error) {
      console.error("Delete request error:", error);
      setErrorMessage("탈퇴 요청 접수 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FBFF]">
        <p className="font-black text-slate-500">불러오는 중...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6 md:py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/insai-logo.png" alt="insai" width={40} height={40} />
            <span className="text-2xl font-extrabold md:text-3xl">insai</span>
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/mypage"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-sm transition hover:bg-slate-50 md:px-5"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">마이페이지</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-sm transition hover:bg-slate-50 md:px-5"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">홈으로</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-6 md:py-14">
        <div className="rounded-[32px] bg-white p-6 shadow-2xl shadow-sky-100 md:rounded-[36px] md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 to-violet-100 md:h-24 md:w-24">
                {safeUser.avatar ? (
                  <Image
                    src={safeUser.avatar}
                    alt="profile"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-10 w-10 text-violet-500" />
                )}
              </div>

              <div className="min-w-0">
                <p className="font-black text-sky-500">Account Settings</p>
                <h1 className="mt-2 text-3xl font-black md:text-5xl">
                  계정 설정
                </h1>
                <p className="mt-3 break-all text-slate-500">
                  계정 정보, 로그인 상태, 탈퇴 요청을 관리할 수 있습니다.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-4 font-black text-white shadow-lg shadow-rose-100 transition hover:bg-rose-600"
            >
              <LogOut className="h-5 w-5" />
              로그아웃
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8 lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
                <KeyRound className="h-6 w-6 text-sky-500" />
              </div>
              <div>
                <p className="font-black text-sky-500">Login Info</p>
                <h2 className="text-2xl font-black">로그인 정보</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-400">로그인 방식</p>
                <p className="mt-2 font-bold">{providerLabel(safeUser.provider)}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-400">이메일</p>
                <p className="mt-2 break-all font-bold">
                  {email || "이메일 정보 없음"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-400">Web User ID</p>
                <p className="mt-2 break-all font-bold">{webUserId}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-400">App User ID</p>
                <p className="mt-2 break-all font-bold">
                  {appUserId || "앱 계정 연결 정보 없음"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-400">계정 상태</p>
                <p className="mt-2 font-bold">{statusLabel(safeUser.status)}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-400">최근 로그인</p>
                <p className="mt-2 font-bold">
                  {formatDate(safeUser.lastLoginAt)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-violet-100 md:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
              <ShieldCheck className="h-7 w-7 text-emerald-500" />
            </div>

            <p className="mt-5 font-black text-emerald-500">Security</p>
            <h2 className="mt-2 text-2xl font-black">보안 상태</h2>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <p className="font-bold text-emerald-700">
                  소셜 로그인으로 보호됨
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-sky-50 p-4">
                <CheckCircle2 className="h-5 w-5 text-sky-500" />
                <p className="font-bold text-sky-700">
                  앱 계정 연결 {appUserId ? "완료" : "확인 필요"}
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-violet-50 p-4">
                <Mail className="h-5 w-5 text-violet-500" />
                <p className="font-bold text-violet-700">
                  문의 답변 이메일 수신 가능
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[32px] border border-rose-100 bg-white p-6 shadow-xl shadow-rose-50 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
                <Trash2 className="h-7 w-7 text-rose-500" />
              </div>
              <p className="mt-5 font-black text-rose-500">Delete Account</p>
              <h2 className="mt-2 text-3xl font-black">탈퇴 요청</h2>
              <p className="mt-3 max-w-3xl leading-8 text-slate-600">
                탈퇴 요청을 접수하면 운영팀이 계정과 관련 데이터를 확인한 뒤
                처리합니다. 처리 결과는 내 문의내역과 이메일로 안내됩니다.
              </p>
            </div>

            <Link
              href="/my-inquiries"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-black text-white shadow-lg shadow-slate-100"
            >
              <Mail className="h-5 w-5" />
              내 문의내역
            </Link>
          </div>

          <div className="mt-6 rounded-2xl bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-amber-500" />
              <p className="leading-7 text-amber-800">
                탈퇴가 처리되면 프로필, 문의 내역, 앱 이용 기록 등 계정과
                연결된 데이터가 삭제되거나 복구 불가능하게 처리될 수 있습니다.
              </p>
            </div>
          </div>

          <form onSubmit={handleDeleteRequest} className="mt-6 space-y-4">
            <div>
              <label className="font-black text-slate-700">탈퇴 사유</label>
              <textarea
                value={deleteReason}
                onChange={(event) => setDeleteReason(event.target.value)}
                placeholder="탈퇴 사유를 간단히 입력해주세요."
                className="mt-3 min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold outline-none transition focus:border-rose-300 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-black text-slate-700">
                확인 문구 입력
              </label>
              <input
                value={deleteConfirmText}
                onChange={(event) => setDeleteConfirmText(event.target.value)}
                placeholder="탈퇴 요청"
                className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold outline-none transition focus:border-rose-300 focus:bg-white"
              />
              <p className="mt-2 text-sm font-bold text-slate-400">
                정확히 <span className="text-rose-500">탈퇴 요청</span> 이라고
                입력해야 접수할 수 있습니다.
              </p>
            </div>

            {submitMessage && (
              <div className="rounded-2xl bg-emerald-50 p-5 font-bold text-emerald-700">
                {submitMessage}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-2xl bg-rose-50 p-5 font-bold text-rose-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmitDeleteRequest || isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-6 py-4 font-black text-white shadow-lg shadow-rose-100 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
              탈퇴 요청 접수
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}