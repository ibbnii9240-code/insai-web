import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Ban,
  Flag,
  Eye,
  Clock,
  Lock,
  Home,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

export default function SafetyPage() {
  const safetyItems = [
    {
      icon: Flag,
      title: "신고 기능",
      desc: "부적절한 게시물, 프로필, 댓글, 채팅 메시지를 신고할 수 있습니다.",
    },
    {
      icon: Ban,
      title: "차단 기능",
      desc: "차단한 사용자는 게시물, 검색, 추천, 프로필, 채팅에서 보이지 않습니다.",
    },
    {
      icon: Eye,
      title: "콘텐츠 검토",
      desc: "신고된 콘텐츠는 안전한 커뮤니티 운영을 위해 검토됩니다.",
    },
    {
      icon: Clock,
      title: "24시간 검토 정책",
      desc: "신고된 항목은 최대한 빠르게 확인하고 필요한 조치를 진행합니다.",
    },
    {
      icon: Lock,
      title: "개인정보 보호",
      desc: "사용자의 개인정보와 커뮤니케이션 안전을 중요하게 보호합니다.",
    },
    {
      icon: MessageCircle,
      title: "안전한 소통",
      desc: "커뮤니티, DM, 소개팅 기능 모두에서 신고와 차단을 지원합니다.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/insai-logo.png"
              alt="insai logo"
              width={40}
              height={40}
              className="rounded-xl"
              priority
            />
            <span className="text-3xl font-extrabold tracking-tight text-slate-900">
              insai
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <Link href="/" className="hover:text-violet-500">
              홈
            </Link>
            <Link href="/#community" className="hover:text-violet-500">
              커뮤니티
            </Link>
            <Link href="/support" className="hover:text-violet-500">
              고객센터
            </Link>
            <Link href="/contact" className="hover:text-violet-500">
              문의하기
            </Link>
          </nav>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Home className="h-4 w-4" />
            홈으로
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-24 text-center">
        <p className="font-black text-sky-500">Safety Center</p>

        <h1 className="mt-4 text-4xl font-black md:text-6xl">
          안전하고 신뢰할 수 있는 insai
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          insai는 신고, 차단, 차단 목록 관리, 콘텐츠 검토를 통해 모두가
          안심하고 소통할 수 있는 글로벌 커뮤니티를 만들어갑니다.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-violet-200 transition hover:scale-105"
          >
            안전 문의하기
          </Link>

          <Link
            href="/support"
            className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            고객센터 보기
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-6xl gap-6 px-6 md:grid-cols-2 lg:grid-cols-3">
        {safetyItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-3xl border border-white bg-white p-8 shadow-lg shadow-violet-100"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
                <Icon className="h-7 w-7 text-violet-500" />
              </div>

              <h2 className="mt-6 text-2xl font-black">{item.title}</h2>

              <p className="mt-4 leading-7 text-slate-600">{item.desc}</p>
            </div>
          );
        })}
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="rounded-[36px] bg-white p-10 shadow-xl shadow-sky-100 md:p-14">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p className="font-black text-violet-500">Report & Block</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                신고와 차단은 모든 주요 기능에서 사용할 수 있습니다
              </h2>
            </div>

            <div className="space-y-4">
              {[
                "커뮤니티 게시물 신고",
                "프로필 신고 및 차단",
                "채팅 메시지 신고",
                "소개팅 추천 사용자 차단",
                "차단한 사용자 목록 확인 및 해제",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-2xl bg-slate-50 p-5 font-bold"
                >
                  <ShieldCheck className="h-5 w-5 text-violet-500" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-5xl px-6 pb-24">
        <div className="rounded-[36px] bg-gradient-to-br from-sky-50 to-violet-50 p-10 shadow-xl shadow-violet-100 md:p-14">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="font-black text-sky-500">Need safety support?</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                안전 관련 문제가 있나요?
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                부적절한 사용자, 게시물, 채팅, 계정 문제는 문의하기 페이지에서
                남겨주세요.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-7 py-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:scale-105"
            >
              문의하기
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}