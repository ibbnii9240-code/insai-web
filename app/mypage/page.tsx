"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Bell,
  CreditCard,
  Globe2,
  Heart,
  Home,
  LogOut,
  Mail,
  MessageCircle,
  Settings,
  ShieldAlert,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type MenuItem = {
  icon: typeof UserRound;
  title: string;
  desc: string;
  href: string;
  color: string;
  badge?: string;
  disabled?: boolean;
};

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

export default function MyPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  const safeUser = user as any;
  const appUserId = safeUser?.appUserId || safeUser?.appId || "";
  const appOnboardingCompleted = Boolean(
    safeUser?.appOnboardingCompleted ?? safeUser?.isProfileCompleted
  );

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

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FBFF]">
        <p className="font-black text-slate-500">불러오는 중...</p>
      </main>
    );
  }

  const menuItems: MenuItem[] = [
    {
      icon: Mail,
      title: "내 문의내역",
      desc: "문의 상태와 관리자 답변 확인",
      href: "/my-inquiries",
      color: "text-violet-500",
      badge: "운영",
    },
    {
      icon: MessageCircle,
      title: "새 문의 작성",
      desc: "계정, 신고, 오류, 기타 문의 접수",
      href: "/contact",
      color: "text-sky-500",
      badge: "운영",
    },
    {
      icon: Settings,
      title: "계정 설정",
      desc: "계정 정보, 보안, 탈퇴 요청 관리",
      href: "/settings/account",
      color: "text-slate-500",
      badge: "중요",
    },
    {
      icon: ShieldAlert,
      title: "내 신고내역",
      desc: "신고 내역과 처리 결과 확인",
      href: "/my-reports",
      color: "text-rose-500",
      badge: "운영",
    },
    {
      icon: CreditCard,
      title: "구독 관리",
      desc: "Bronze, Silver, Gold 플랜 관리",
      href: "/subscription",
      color: "text-emerald-500",
      badge: "준비중",
      disabled: true,
    },
    {
      icon: Users,
      title: "친구 목록",
      desc: "친구와 팔로우 관계 관리",
      href: "/friends",
      color: "text-blue-500",
      badge: "준비중",
      disabled: true,
    },
    {
      icon: Heart,
      title: "좋아요 / 매칭",
      desc: "좋아요와 매칭 내역 확인",
      href: "/likes",
      color: "text-pink-500",
      badge: "준비중",
      disabled: true,
    },
    {
      icon: Globe2,
      title: "언어 설정",
      desc: "국가와 언어 환경 설정",
      href: "/settings/language",
      color: "text-cyan-500",
      badge: "준비중",
      disabled: true,
    },
    {
      icon: Bell,
      title: "알림 설정",
      desc: "문의, 신고, 채팅 알림 관리",
      href: "/settings/notifications",
      color: "text-amber-500",
      badge: "준비중",
      disabled: true,
    },
  ];

  const profileName =
    safeUser.nickname ||
    safeUser.name ||
    safeUser.username ||
    "insai 유저";

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6 md:py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/insai-logo.png" alt="insai" width={40} height={40} />
            <span className="text-2xl font-extrabold md:text-3xl">insai</span>
          </Link>

          <div className="flex gap-2 md:gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-600 md:px-5"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>

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
                <p className="font-black text-sky-500">My Page</p>
                <h1 className="mt-2 truncate text-3xl font-black md:text-4xl">
                  {profileName}
                </h1>
                <p className="mt-2 break-all text-sm text-slate-500 md:text-base">
                  {safeUser.email || "이메일 정보 없음"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl bg-emerald-50 px-5 py-3 font-black text-emerald-600">
                {providerLabel(safeUser.provider)} 로그인
              </div>

              {appUserId ? (
                <div className="rounded-2xl bg-sky-50 px-5 py-3 font-black text-sky-600">
                  앱 계정 연결 완료
                </div>
              ) : (
                <div className="rounded-2xl bg-amber-50 px-5 py-3 font-black text-amber-600">
                  앱 계정 확인 필요
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-xl shadow-violet-100 md:p-8">
          <p className="font-black text-violet-500">Account Info</p>
          <h2 className="mt-2 text-3xl font-black">계정 정보</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-400">Web User ID</p>
              <p className="mt-2 break-all font-bold">{safeUser.id}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-400">App User ID</p>
              <p className="mt-2 break-all font-bold">
                {appUserId || "아직 연결 정보가 없습니다."}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-400">Role</p>
              <p className="mt-2 font-bold">{safeUser.role}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-400">Status</p>
              <p className="mt-2 font-bold">{statusLabel(safeUser.status)}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-400">Web Profile</p>
              <p className="mt-2 font-bold">
                {safeUser.isProfileCompleted ? "완료" : "미완료"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-400">App Profile</p>
              <p className="mt-2 font-bold">
                {appOnboardingCompleted ? "완료" : "미완료"}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const content = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
                    <Icon className={`h-7 w-7 ${item.color}`} />
                  </div>

                  {item.badge && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        item.disabled
                          ? "bg-slate-100 text-slate-400"
                          : "bg-violet-50 text-violet-500"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>

                <h2 className="mt-5 text-2xl font-black">{item.title}</h2>
                <p className="mt-3 leading-7 text-slate-500">{item.desc}</p>

                <span
                  className={`mt-5 inline-block font-black ${
                    item.disabled ? "text-slate-300" : "text-violet-500"
                  }`}
                >
                  {item.disabled ? "준비 중" : "바로가기 →"}
                </span>
              </>
            );

            if (item.disabled) {
              return (
                <div
                  key={item.title}
                  className="rounded-3xl bg-white p-7 opacity-80 shadow-lg shadow-sky-100"
                >
                  {content}
                </div>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-3xl bg-white p-7 shadow-lg shadow-sky-100 transition hover:-translate-y-1 hover:shadow-xl"
              >
                {content}
              </Link>
            );
          })}
        </div>

        <section className="mt-8 rounded-[32px] bg-gradient-to-br from-sky-50 to-violet-50 p-6 shadow-xl shadow-sky-100 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-sky-500">Quick Support</p>
              <h2 className="mt-2 text-3xl font-black">고객지원 바로가기</h2>
              <p className="mt-3 leading-8 text-slate-600">
                문의를 새로 남기거나, 기존 답변과 신고 처리 결과를 확인할 수 있습니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <MessageCircle className="h-5 w-5 text-violet-500" />
                새 문의 작성
              </Link>

              <Link
                href="/my-inquiries"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-5 py-3 font-black text-white shadow-lg shadow-violet-200"
              >
                <Mail className="h-5 w-5" />
                내 문의내역
              </Link>

              <Link
                href="/my-reports"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-400 to-violet-500 px-5 py-3 font-black text-white shadow-lg shadow-rose-100"
              >
                <ShieldAlert className="h-5 w-5" />
                내 신고내역
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}