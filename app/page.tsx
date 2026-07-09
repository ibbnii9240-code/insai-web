"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe2,
  MessageCircle,
  Users,
  Heart,
  ShieldCheck,
  Sparkles,
  Headphones,
  Mail,
  LockKeyhole,
  LogIn,
  UserRound,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading, logout } = useAuth();

  const features = [
    {
      icon: Globe2,
      title: "글로벌 커뮤니티",
      desc: "전 세계 사람들과 자유롭게 소통",
      color: "text-sky-500",
    },
    {
      icon: MessageCircle,
      title: "실시간 채팅",
      desc: "친구, 관심사, DM으로 자연스럽게 연결",
      color: "text-violet-500",
    },
    {
      icon: Users,
      title: "글로벌 친구",
      desc: "비슷한 취향과 가치관을 가진 사람 찾기",
      color: "text-blue-500",
    },
    {
      icon: Heart,
      title: "소개팅 (선택)",
      desc: "원한다면 새로운 인연도 만들 수 있어요",
      color: "text-pink-500",
    },
  ];

  const supportCards = [
    {
      icon: Headphones,
      title: "고객센터",
      desc: "자주 묻는 질문과 이용 가이드를 확인하세요.",
      href: "/support",
      color: "text-sky-500",
    },
    {
      icon: Mail,
      title: "문의하기",
      desc: "서비스 제휴, 버그 신고, 계정 문의를 남겨주세요.",
      href: "/contact",
      color: "text-violet-500",
    },
    {
      icon: LockKeyhole,
      title: "관리자 페이지",
      desc: "사용자 관리와 신고 처리를 위한 운영 페이지입니다.",
      href: "/admin",
      color: "text-blue-500",
    },
  ];

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F8FBFF] text-slate-900">
      <header className="fixed left-0 right-0 top-0 z-[100] border-b border-slate-100 bg-white/90 backdrop-blur-xl shadow-sm shadow-slate-100/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/insai-logo.png"
              alt="insai logo"
              width={42}
              height={42}
              className="rounded-xl"
              priority
            />
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              insai
            </span>
          </Link>

          <nav className="hidden items-center gap-9 text-sm font-semibold text-slate-600 md:flex">
            <Link href="/" className="hover:text-violet-500">
              홈
            </Link>
            <Link href="/#community" className="hover:text-violet-500">
              커뮤니티
            </Link>
            <Link href="/#dating" className="hover:text-violet-500">
              소개팅
            </Link>
            <Link href="/safety" className="hover:text-violet-500">
              안전센터
            </Link>
            <Link href="/support" className="hover:text-violet-500">
              고객센터
            </Link>
            <Link href="/contact" className="hover:text-violet-500">
              문의하기
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {!isLoading && !isLoggedIn && (
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 md:inline-flex"
              >
                <LogIn className="h-4 w-4" />
                로그인
              </Link>
            )}

            {!isLoading && isLoggedIn && user && (
              <div className="group relative hidden md:block">
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-100 to-violet-100">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt="profile"
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-4 w-4 text-violet-500" />
                    )}
                  </div>
                  <span className="max-w-[110px] truncate">
                    {user.nickname || user.name || "내 계정"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                <div className="invisible absolute right-0 top-[52px] w-52 translate-y-2 rounded-3xl border border-slate-100 bg-white p-3 opacity-0 shadow-2xl shadow-slate-200 transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <Link
                    href="/mypage"
                    className="block rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    마이페이지
                  </Link>

                  {(user.role === "owner" || user.role === "staff") && (
                    <Link
                      href="/admin"
                      className="block rounded-2xl px-4 py-3 text-sm font-bold text-violet-600 hover:bg-violet-50"
                    >
                      관리자 페이지
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-bold text-rose-500 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </button>
                </div>
              </div>
            )}

            <button className="rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:scale-105">
              앱 다운로드
            </button>
          </div>
        </div>
      </header>

      <div className="h-[88px]" />

      <section
        id="home"
        className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-24"
      >
        <div className="absolute right-[-140px] top-10 h-[460px] w-[460px] rounded-full bg-violet-200/40 blur-3xl" />
        <div className="absolute bottom-10 left-[-120px] h-[360px] w-[360px] rounded-full bg-sky-200/50 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-8 inline-flex rounded-full bg-sky-100 px-5 py-2 text-sm font-bold text-sky-600">
            글로벌 커뮤니티 플랫폼
          </div>

          <h1 className="text-5xl font-black leading-tight tracking-tight md:text-7xl">
            당신의 바이브가
            <br />
            <span className="bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              세상과 연결되는 곳
            </span>
          </h1>

          <p className="mt-8 max-w-xl text-lg font-medium leading-9 text-slate-600 md:text-xl">
            insai는 전 세계 사람들과 소통하고, 관심사와 가치관을 공유하며,
            자연스럽게 관계를 만들어가는 글로벌 커뮤니티입니다.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href={isLoggedIn ? "/mypage" : "/login"}
              className="rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-violet-200 transition hover:scale-105"
            >
              {isLoggedIn ? "마이페이지" : "지금 시작하기"}
            </Link>
            <button className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
              앱 다운로드
            </button>
          </div>

          <div className="mt-12 grid max-w-xl grid-cols-2 gap-4 md:grid-cols-4">
            {features.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white bg-white/80 p-5 shadow-lg shadow-sky-100"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
                    <Icon
                      className={`h-6 w-6 ${item.color}`}
                      strokeWidth={2.4}
                    />
                  </div>
                  <h3 className="mt-4 text-sm font-black text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex justify-center lg:justify-end">
          <div className="absolute top-10 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-sky-200 via-blue-100 to-violet-200 blur-2xl" />

          <div className="relative rotate-[1deg] rounded-[54px] border-[10px] border-slate-950 bg-white p-3 shadow-2xl">
            <div className="relative h-[760px] w-[390px] overflow-hidden rounded-[38px] bg-white">
              <Image
                src="/community-screen.jpeg"
                alt="insai community screen"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section id="community" className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-[36px] bg-white p-10 shadow-xl shadow-sky-100 md:p-16">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="font-black text-violet-500">Community First</p>
              <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
                소개팅보다 먼저,
                <br />
                소통으로 시작되는 관계
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                insai의 중심은 커뮤니티입니다. 사람들은 게시물, 댓글, 채팅,
                취향과 바이브를 통해 자연스럽게 서로를 알아갑니다.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                "게시물과 댓글로 일상 공유",
                "친구와 실시간 DM 소통",
                "관심사 기반 글로벌 친구 찾기",
                "소개팅은 원할 때만 선택",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-5 font-bold"
                >
                  <Sparkles className="h-5 w-5 text-violet-500" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="dating" className="mx-auto max-w-7xl px-6 py-24">
        <div className="rounded-[36px] bg-gradient-to-br from-sky-50 to-violet-50 p-10 shadow-xl shadow-violet-100 md:p-16">
          <div className="text-center">
            <p className="font-black text-violet-500">Optional Dating</p>
            <h2 className="mt-4 text-4xl font-black md:text-5xl">
              관계는 커뮤니티에서 시작하고,
              <br />
              소개팅은 원할 때만 선택하세요
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              insai는 소개팅 중심 앱이 아니라 글로벌 커뮤니티를 기반으로 한
              관계 형성 플랫폼입니다.
            </p>
          </div>
        </div>
      </section>

      <section id="safety-preview" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <p className="font-black text-sky-500">Safety Center</p>
          <h2 className="mt-4 text-4xl font-black md:text-5xl">
            안전하고 신뢰할 수 있는 insai
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            신고, 차단, 차단 목록 관리, 24시간 검토 정책으로 모두가 안심하고
            소통할 수 있는 커뮤니티를 만들어갑니다.
          </p>

          <Link
            href="/safety"
            className="mt-8 inline-flex rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-7 py-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:scale-105"
          >
            안전센터 보기
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {["신고 기능", "차단 기능", "24시간 검토"].map((title) => (
            <div
              key={title}
              className="rounded-3xl bg-white p-8 shadow-lg shadow-violet-100"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
                <ShieldCheck className="h-7 w-7 text-violet-500" />
              </div>
              <h3 className="text-xl font-black">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">
                부적절한 콘텐츠와 사용자를 신고하고 차단할 수 있습니다.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="support" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {supportCards.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-3xl border border-slate-100 bg-white p-8 shadow-lg shadow-sky-100 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
                  <Icon className={`h-7 w-7 ${item.color}`} />
                </div>
                <h3 className="mt-5 text-2xl font-black">{item.title}</h3>
                <p className="mt-4 leading-7 text-slate-600">{item.desc}</p>
                <span className="mt-6 inline-block font-black text-violet-500">
                  바로가기 →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/insai-logo.png"
                alt="insai logo"
                width={34}
                height={34}
              />
              <span className="text-2xl font-black">insai</span>
            </Link>
            <p className="mt-3 text-sm text-slate-400">
              Connect your vibe, inspire the world.
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm font-semibold text-slate-500">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/child-safety">Child Safety</Link>
            <Link href="/account-deletion">Account Deletion</Link>
            <Link href="/support">Support</Link>
            <Link href="/admin">Admin Login</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
