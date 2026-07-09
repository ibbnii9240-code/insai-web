"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Home,
  Inbox,
  Mail,
  MessageSquareReply,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const TOKEN_KEY = "insai_auth_token";

type InquiryStatus = "대기" | "확인중" | "완료";

type InquiryItem = {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  status: InquiryStatus;
  adminReply?: string;
  repliedAt?: string;
  emailSentAt?: string;
  createdAt: string;
  updatedAt?: string;
};

function getStatusStyle(status: InquiryStatus) {
  if (status === "완료") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (status === "확인중") {
    return "bg-sky-50 text-sky-600";
  }

  return "bg-amber-50 text-amber-600";
}

function getStatusIcon(status: InquiryStatus) {
  if (status === "완료") {
    return CheckCircle2;
  }

  if (status === "확인중") {
    return Clock;
  }

  return Inbox;
}

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });
}

export default function MyInquiriesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchInquiries() {
    if (!user?.email) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

    try {
      setIsFetching(true);
      setErrorMessage("");

      const response = await fetch("/api/contact", {
        cache: "no-store",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "문의내역을 불러오지 못했습니다.");
      }

      const currentEmail = user.email.toLowerCase();

      const filtered = (result.contacts || []).filter(
        (item: InquiryItem) => item.email?.toLowerCase() === currentEmail
      );

      setInquiries(filtered);
    } catch (error) {
      console.error("My inquiries fetch error:", error);
      setErrorMessage("문의내역을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }

    if (!isLoading && user && !user.isProfileCompleted) {
      router.push("/onboarding");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user?.email) {
      fetchInquiries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const counts = useMemo(() => {
    return {
      total: inquiries.length,
      waiting: inquiries.filter((item) => item.status === "대기").length,
      checking: inquiries.filter((item) => item.status === "확인중").length,
      done: inquiries.filter((item) => item.status === "완료").length,
    };
  }, [inquiries]);

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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/insai-logo.png" alt="insai" width={40} height={40} />
            <span className="text-3xl font-extrabold">insai</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/mypage"
              className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold shadow-sm md:inline-flex"
            >
              <UserRound className="h-4 w-4" />
              마이페이지
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold shadow-sm"
            >
              <Home className="h-4 w-4" />
              홈으로
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-[36px] bg-white p-8 shadow-2xl shadow-sky-100 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-violet-500">My Inquiries</p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">
                내 문의내역
              </h1>
              <p className="mt-5 max-w-2xl leading-8 text-slate-600">
                {user.nickname || user.name || "insai 유저"}님이 남긴 문의와
                관리자 답변을 확인할 수 있습니다.
              </p>
              <p className="mt-2 text-sm font-bold text-slate-400">
                조회 이메일: {user.email}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchInquiries}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-6 py-4 font-black text-white shadow-lg shadow-violet-200 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`}
              />
              새로고침
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "전체", value: counts.total, color: "text-slate-700" },
            { label: "대기", value: counts.waiting, color: "text-amber-600" },
            { label: "확인중", value: counts.checking, color: "text-sky-600" },
            { label: "완료", value: counts.done, color: "text-emerald-600" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl bg-white p-6 shadow-lg shadow-sky-100"
            >
              <p className="text-sm font-black text-slate-400">{item.label}</p>
              <p className={`mt-2 text-3xl font-black ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {errorMessage && (
          <div className="mt-8 rounded-3xl bg-rose-50 p-5 font-bold text-rose-600">
            {errorMessage}
          </div>
        )}

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-xl shadow-violet-100 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black text-sky-500">Inquiry List</p>
              <h2 className="mt-2 text-3xl font-black">문의 목록</h2>
            </div>
            <Mail className="h-8 w-8 text-violet-400" />
          </div>

          <div className="mt-8 max-h-[760px] space-y-5 overflow-y-auto pr-2">
            {!isFetching && inquiries.length === 0 && (
              <div className="rounded-3xl bg-slate-50 p-10 text-center">
                <Inbox className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-5 text-2xl font-black">
                  아직 문의내역이 없습니다.
                </h3>
                <p className="mt-3 text-slate-500">
                  문의하기 페이지에서 로그인한 계정 이메일로 문의를 남기면
                  이곳에서 확인할 수 있어요.
                </p>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-6 py-3 font-black text-white shadow-lg shadow-violet-200"
                >
                  문의하러 가기
                </Link>
              </div>
            )}

            {inquiries.map((item) => {
              const StatusIcon = getStatusIcon(item.status);

              return (
                <article
                  key={item.id}
                  className="rounded-3xl bg-slate-50 p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-black">{item.category}</h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${getStatusStyle(
                            item.status
                          )}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          {item.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-400">
                        접수일: {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-white p-5">
                    <p className="text-sm font-black text-slate-400">
                      문의 내용
                    </p>
                    <p className="mt-3 whitespace-pre-line leading-8 text-slate-700">
                      {item.message}
                    </p>
                  </div>

                  {item.adminReply ? (
                    <div className="mt-4 rounded-2xl bg-emerald-50 p-5">
                      <div className="flex items-center gap-2">
                        <MessageSquareReply className="h-5 w-5 text-emerald-500" />
                        <p className="font-black text-emerald-700">
                          관리자 답변
                        </p>
                      </div>

                      <p className="mt-3 whitespace-pre-line leading-8 text-emerald-900">
                        {item.adminReply}
                      </p>

                      {item.repliedAt && (
                        <p className="mt-3 text-xs font-bold text-emerald-500">
                          답변일: {formatDate(item.repliedAt)}
                        </p>
                      )}

                      {item.emailSentAt && (
                        <p className="mt-1 text-xs font-bold text-emerald-500">
                          이메일 발송일: {formatDate(item.emailSentAt)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-amber-50 p-5">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500" />
                        <p className="font-black text-amber-700">
                          아직 답변 대기 중입니다.
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-amber-700">
                        운영팀이 확인 후 답변하면 이곳과 이메일로 확인할 수
                        있습니다.
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
