import Image from "next/image";
import Link from "next/link";
import {
  HelpCircle,
  User,
  ShieldCheck,
  Ban,
  MessageCircle,
  Bug,
  Mail,
  ChevronRight,
  Home,
} from "lucide-react";

export default function SupportPage() {
  const faqs = [
    {
      icon: User,
      title: "계정 관련",
      desc: "로그인, 프로필, 닉네임, 계정 정보 변경에 대한 도움말입니다.",
    },
    {
      icon: ShieldCheck,
      title: "신고 기능",
      desc: "부적절한 게시물, 프로필, 채팅 메시지를 신고할 수 있습니다.",
    },
    {
      icon: Ban,
      title: "차단 기능",
      desc: "차단한 사용자는 게시물, 검색, 추천, 채팅에서 보이지 않습니다.",
    },
    {
      icon: MessageCircle,
      title: "채팅 및 DM",
      desc: "친구와 실시간으로 소통하고 커뮤니티 관계를 이어갈 수 있습니다.",
    },
    {
      icon: Bug,
      title: "앱 오류",
      desc: "앱 이용 중 발생한 오류나 버그를 문의하기 페이지에서 알려주세요.",
    },
    {
      icon: HelpCircle,
      title: "커뮤니티 이용",
      desc: "게시물, 댓글, 바이브, 글로벌 친구 기능에 대한 안내입니다.",
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
            <Link href="/safety" className="hover:text-violet-500">
              안전센터
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
        <p className="font-black text-sky-500">Support Center</p>

        <h1 className="mt-4 text-4xl font-black md:text-6xl">
          insai 고객센터
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          계정, 신고, 차단, 커뮤니티 이용, 앱 오류 등 insai 이용 중 궁금한
          내용을 확인하세요.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/contact"
            className="rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-violet-200 transition hover:scale-105"
          >
            문의하기
          </Link>

          <Link
            href="/safety"
            className="rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            안전센터 보기
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-6xl gap-6 px-6 md:grid-cols-2 lg:grid-cols-3">
        {faqs.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-3xl border border-white bg-white p-8 shadow-lg shadow-sky-100"
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

      <section className="mx-auto mt-20 max-w-5xl px-6 pb-24">
        <div className="rounded-[36px] bg-white p-10 shadow-xl shadow-sky-100 md:p-14">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="font-black text-violet-500">Need more help?</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">
                원하는 답변을 찾지 못했나요?
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                서비스 제휴, 버그 신고, 계정 문의, 안전 관련 문의는 문의하기
                페이지에서 남겨주세요.
              </p>
            </div>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-7 py-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:scale-105"
            >
              <Mail className="h-5 w-5" />
              문의하기
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}