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

export default function MyPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

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

  const menuItems = [
    {
      icon: UserRound,
      title: "프로필 수정",
      desc: "닉네임, 사진, 기본정보 관리",
      href: "/mypage",
      color: "text-sky-500",
    },
    {
      icon: Mail,
      title: "내 문의내역",
      desc: "문의 상태와 관리자 답변 확인",
      href: "/my-inquiries",
      color: "text-violet-500",
    },
    {
      icon: ShieldAlert,
      title: "내 신고내역",
      desc: "신고 내역과 처리 결과 확인",
      href: "/my-reports",
      color: "text-rose-500",
    },
    {
      icon: CreditCard,
      title: "구독 관리",
      desc: "Bronze, Silver, Gold 플랜 관리",
      href: "/subscription",
      color: "text-emerald-500",
    },
    {
      icon: Users,
      title: "친구 목록",
      desc: "친구와 팔로우 관계 관리",
      href: "/friends",
      color: "text-blue-500",
    },
    {
      icon: Heart,
      title: "좋아요 / 매칭",
      desc: "좋아요와 매칭 내역 확인",
      href: "/likes",
      color: "text-pink-500",
    },
    {
      icon: Globe2,
      title: "언어 설정",
      desc: "국가와 언어 환경 설정",
      href: "/settings/language",
      color: "text-cyan-500",
    },
    {
      icon: Bell,
      title: "알림 설정",
      desc: "문의, 신고, 채팅 알림 관리",
      href: "/settings/notifications",
      color: "text-amber-500",
    },
    {
      icon: Settings,
      title: "계정 설정",
      desc: "계정 보안과 탈퇴 관리",
      href: "/settings/account",
      color: "text-slate-500",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/insai-logo.png" alt="insai" width={40} height={40} />
            <span className="text-3xl font-extrabold">insai</span>
          </Link>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-600"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold shadow-sm transition hover:bg-slate-50"
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
            <div className="flex items-center gap-5">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 to-violet-100">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt="profile"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-10 w-10 text-violet-500" />
                )}
              </div>

              <div>
                <p className="font-black text-sky-500">My Page</p>
                <h1 className="mt-2 text-4xl font-black">
                  {user.nickname || user.name || "insai 유저"}
                </h1>
                <p className="mt-2 text-slate-500">{user.email}</p>
              </div>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-5 py-3 font-black text-emerald-600">
              {user.provider.toUpperCase()} 로그인
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-3xl bg-white p-7 shadow-lg shadow-sky-100 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
                  <Icon className={`h-7 w-7 ${item.color}`} />
                </div>

                <h2 className="mt-5 text-2xl font-black">{item.title}</h2>
                <p className="mt-3 leading-7 text-slate-500">{item.desc}</p>

                <span className="mt-5 inline-block font-black text-violet-500">
                  바로가기 →
                </span>
              </Link>
            );
          })}
        </div>

        <section className="mt-8 rounded-[32px] bg-white p-8 shadow-xl shadow-violet-100">
          <p className="font-black text-violet-500">Account Info</p>
          <h2 className="mt-2 text-3xl font-black">계정 정보</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-400">User ID</p>
              <p className="mt-2 break-all font-bold">{user.id}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-400">Role</p>
              <p className="mt-2 font-bold">{user.role}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-400">Status</p>
              <p className="mt-2 font-bold">{user.status}</p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-400">Profile</p>
              <p className="mt-2 font-bold">
                {user.isProfileCompleted ? "완료" : "미완료"}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] bg-gradient-to-br from-sky-50 to-violet-50 p-8 shadow-xl shadow-sky-100">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-sky-500">Quick Support</p>
              <h2 className="mt-2 text-3xl font-black">고객지원 바로가기</h2>
              <p className="mt-3 leading-8 text-slate-600">
                문의를 새로 남기거나, 기존 답변을 확인할 수 있습니다.
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
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
