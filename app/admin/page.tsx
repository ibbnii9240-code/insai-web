import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import Report from "@/models/Report";
import User from "@/models/User";
import AdminContactActions from "@/components/AdminContactActions";
import SafeAvatar from "@/components/SafeAvatar";
import {
  Activity,
  BadgeDollarSign,
  Ban,
  BriefcaseBusiness,
  Blocks,
  CheckCircle2,
  Clock,
  FileText,
  Flag,
  Globe2,
  Heart,
  Home,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  ReceiptText,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";

type ContactStatus = "대기" | "확인중" | "완료";

type DashboardStats = {
  users: {
    total: number;
    onboardingCompleted: number;
    onboardingRate: number;
    newToday: number;
    newThisMonth: number;
  };
  content: {
    posts: number;
    postsToday: number;
    comments: number;
    likes: number;
  };
  relationships: {
    follows: number;
    matches: number;
    blocks: number;
  };
  chats: {
    total: number;
    community: number;
    dating: number;
  };
  reports: {
    pending: number;
    reviewing: number;
    completed: number;
    rejected: number;
    unresolved: number;
  };
  subscriptions: {
    active: number;
    bronze: number;
    silver: number;
    gold: number;
    expiringSoon: number;
    canceled: number;
  };
  revenue: {
    today: number;
    thisMonth: number;
    previousMonth: number;
    growthRate: number;
    refundedThisMonth: number;
    appStoreThisMonth: number;
    playStoreThisMonth: number;
    webThisMonth: number;
  };
  countries: Array<{
    countryCode: string;
    count: number;
  }>;
};

type RecentAppUser = {
  id: string;
  username?: string | null;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  country?: string | null;
  countryCode?: string | null;
  language?: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
};

const EMPTY_STATS: DashboardStats = {
  users: {
    total: 0,
    onboardingCompleted: 0,
    onboardingRate: 0,
    newToday: 0,
    newThisMonth: 0,
  },
  content: {
    posts: 0,
    postsToday: 0,
    comments: 0,
    likes: 0,
  },
  relationships: {
    follows: 0,
    matches: 0,
    blocks: 0,
  },
  chats: {
    total: 0,
    community: 0,
    dating: 0,
  },
  reports: {
    pending: 0,
    reviewing: 0,
    completed: 0,
    rejected: 0,
    unresolved: 0,
  },
  subscriptions: {
    active: 0,
    bronze: 0,
    silver: 0,
    gold: 0,
    expiringSoon: 0,
    canceled: 0,
  },
  revenue: {
    today: 0,
    thisMonth: 0,
    previousMonth: 0,
    growthRate: 0,
    refundedThisMonth: 0,
    appStoreThisMonth: 0,
    playStoreThisMonth: 0,
    webThisMonth: 0,
  },
  countries: [],
};

async function logoutAction() {
  "use server";

  const cookieStore = await cookies();

  cookieStore.delete("insai_admin_auth");
  cookieStore.delete("insai_admin_role");

  redirect("/admin/login");
}

function normalizeStatus(status: unknown): ContactStatus {
  if (status === "대기" || status === "확인중" || status === "완료") {
    return status;
  }

  return "대기";
}

function formatKoreanDate(value?: string | Date | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function statusStyle(status: string) {
  if (
    status === "완료" ||
    status === "정상" ||
    status === "활성" ||
    status === "온보딩 완료"
  ) {
    return "bg-emerald-50 text-emerald-600";
  }

  if (status === "대기") {
    return "bg-amber-50 text-amber-600";
  }

  if (status === "정지" || status === "탈퇴") {
    return "bg-rose-50 text-rose-600";
  }

  return "bg-sky-50 text-sky-600";
}

async function getAppDashboardStats(): Promise<{
  ok: boolean;
  stats: DashboardStats;
  recentUsers: RecentAppUser[];
  generatedAt: string;
  message: string;
}> {
  const baseUrl = process.env.APP_BACKEND_URL;
  const secret = process.env.WEB_AUTH_SECRET || "";

  if (!baseUrl) {
    return {
      ok: false,
      stats: EMPTY_STATS,
      recentUsers: [] as RecentAppUser[],
      generatedAt: "",
      message: "APP_BACKEND_URL이 설정되지 않았습니다.",
    };
  }

  try {
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/admin/dashboard-stats`,
      {
        headers: {
          ...(secret
            ? {
                "x-web-auth-secret": secret,
              }
            : {}),
          "ngrok-skip-browser-warning": "69420",
        },
        cache: "no-store",
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success === false) {
      return {
        ok: false,
        stats: EMPTY_STATS,
        recentUsers: [] as RecentAppUser[],
        generatedAt: "",
        message:
          result?.message ||
          result?.error ||
          "앱 운영 통계를 불러오지 못했습니다.",
      };
    }

    return {
      ok: true,
      stats: {
        ...EMPTY_STATS,
        ...(result.stats || {}),
        users: {
          ...EMPTY_STATS.users,
          ...(result.stats?.users || {}),
        },
        content: {
          ...EMPTY_STATS.content,
          ...(result.stats?.content || {}),
        },
        relationships: {
          ...EMPTY_STATS.relationships,
          ...(result.stats?.relationships || {}),
        },
        chats: {
          ...EMPTY_STATS.chats,
          ...(result.stats?.chats || {}),
        },
        reports: {
          ...EMPTY_STATS.reports,
          ...(result.stats?.reports || {}),
        },
        subscriptions: {
          ...EMPTY_STATS.subscriptions,
          ...(result.stats?.subscriptions || {}),
        },
        revenue: {
          ...EMPTY_STATS.revenue,
          ...(result.stats?.revenue || {}),
        },
        countries: Array.isArray(result.stats?.countries)
          ? result.stats.countries
          : [],
      } as DashboardStats,
      recentUsers: Array.isArray(result.recentUsers)
        ? result.recentUsers
        : [],
      generatedAt: result.generatedAt || "",
      message: "",
    };
  } catch (error) {
    console.error("Admin dashboard backend fetch error:", error);

    return {
      ok: false,
      stats: EMPTY_STATS,
      recentUsers: [] as RecentAppUser[],
      generatedAt: "",
      message: "앱 백엔드 통계 서버에 연결하지 못했습니다.",
    };
  }
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("insai_admin_auth")?.value;
  const role = cookieStore.get("insai_admin_role")?.value;

  if (isAdmin !== "true") {
    redirect("/admin/login");
  }

  const isOwner = role === "owner";

  await connectDB();

  const [
    contacts,
    reportDocs,
    webUserDocs,
    totalWebUserCount,
    activeWebUserCount,
    suspendedWebUserCount,
    pendingReportCount,
    pendingInquiryCount,
    appDashboard,
  ] = await Promise.all([
    Contact.find().sort({ createdAt: -1 }).limit(50).lean(),
    Report.find().sort({ createdAt: -1 }).limit(5).lean(),
    User.find().sort({ createdAt: -1 }).limit(5).lean(),
    User.countDocuments(),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ status: "suspended" }),
    Report.countDocuments({
      status: { $in: ["대기", "확인중"] },
    }),
    Contact.countDocuments({
      status: { $in: ["대기", "확인중"] },
    }),
    getAppDashboardStats(),
  ]);

  const appStats = appDashboard.stats;

  const webUsers = webUserDocs.map((user: any) => ({
    id: String(user._id),
    nickname: user.nickname || user.name || "이름 없음",
    email: user.email || "이메일 없음",
    status:
      user.status === "suspended"
        ? "정지"
        : user.status === "deleted"
          ? "탈퇴"
          : "정상",
    provider: user.provider || "-",
    appUserId: user.appUserId || "",
    createdAt: formatKoreanDate(user.createdAt),
  }));

  const reports = reportDocs.map((report: any) => ({
    id: String(report._id),
    type: report.category || "신고",
    target:
      report.reportedNickname ||
      report.targetUserName ||
      report.reportedUserId ||
      "대상 없음",
    reporter:
      report.reporterName ||
      report.reporterEmail ||
      report.reporterId ||
      "신고자 없음",
    reason: report.reason || report.message || "",
    status: report.status || "대기",
    createdAt: formatKoreanDate(report.createdAt),
  }));

  const inquiries = contacts.map((contact: any) => ({
    id: String(contact._id),
    name: contact.name || "이름 없음",
    email: contact.email || "이메일 없음",
    category: contact.category || "일반 문의",
    message: contact.message || "",
    status: normalizeStatus(contact.status),
    adminReply: contact.adminReply || "",
    createdAt: formatKoreanDate(contact.createdAt),
    repliedAt: formatKoreanDate(contact.repliedAt),
  }));

  const overviewStats = [
    {
      title: "전체 앱 유저",
      value: String(appStats.users.total),
      desc: `온보딩 완료 ${appStats.users.onboardingCompleted}명`,
      icon: Users,
      color: "text-sky-500",
    },
    {
      title: "이번 달 가입",
      value: String(appStats.users.newThisMonth),
      desc: `오늘 신규 ${appStats.users.newToday}명`,
      icon: UserCheck,
      color: "text-emerald-500",
    },
    {
      title: "대기 신고",
      value: String(pendingReportCount),
      desc: "웹 관리자 검토 필요",
      icon: Flag,
      color: "text-rose-500",
    },
    {
      title: "미처리 문의",
      value: String(pendingInquiryCount),
      desc: "대기 및 확인중",
      icon: MessageSquare,
      color: "text-violet-500",
    },
  ];

  const activityStats = [
    {
      title: "전체 게시물",
      value: appStats.content.posts,
      desc: `오늘 ${appStats.content.postsToday}개 생성`,
      icon: FileText,
      color: "text-sky-500",
    },
    {
      title: "전체 좋아요",
      value: appStats.content.likes,
      desc: "게시물 누적 좋아요",
      icon: Heart,
      color: "text-pink-500",
    },
    {
      title: "전체 댓글",
      value: appStats.content.comments,
      desc: "게시물 누적 댓글",
      icon: MessageCircle,
      color: "text-violet-500",
    },
    {
      title: "팔로우 관계",
      value: appStats.relationships.follows,
      desc: "누적 팔로우 연결",
      icon: TrendingUp,
      color: "text-cyan-500",
    },
    {
      title: "소개팅 매칭",
      value: appStats.relationships.matches,
      desc: "누적 매칭 수",
      icon: Users,
      color: "text-rose-500",
    },
    {
      title: "전체 채팅방",
      value: appStats.chats.total,
      desc: `커뮤니티 ${appStats.chats.community} / 소개팅 ${appStats.chats.dating}`,
      icon: MessagesSquare,
      color: "text-blue-500",
    },
    {
      title: "차단 관계",
      value: appStats.relationships.blocks,
      desc: "누적 차단 수",
      icon: Blocks,
      color: "text-slate-500",
    },
    {
      title: "운영 미처리 신고",
      value: appStats.reports.unresolved,
      desc: `대기 ${appStats.reports.pending} / 확인중 ${appStats.reports.reviewing}`,
      icon: ShieldCheck,
      color: "text-amber-500",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-6 md:py-5">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/insai-logo.png"
              alt="insai logo"
              width={40}
              height={40}
              className="rounded-xl"
              priority
            />
            <span className="text-2xl font-extrabold tracking-tight md:text-3xl">
              insai
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <span
              className={`hidden rounded-full px-4 py-2 text-sm font-black sm:inline-flex ${
                isOwner
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-violet-50 text-violet-500"
              }`}
            >
              {isOwner ? "Owner" : "Staff"}
            </span>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-600 md:px-5"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </form>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 md:px-5"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">홈으로</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-6 md:py-12">
        <div>
          <p className="font-black text-sky-500">Admin Dashboard</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">
            insai 운영센터
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
            앱 PostgreSQL과 웹 MongoDB 데이터를 함께 불러와 실제 운영 현황을
            표시합니다. 신고와 문의 관리 기능은 기존 구조를 그대로 유지했습니다.
          </p>
        </div>

        {!appDashboard.ok && (
          <div className="mt-7 rounded-3xl bg-rose-50 p-6">
            <p className="font-black text-rose-600">
              앱 통계 연결 오류
            </p>
            <p className="mt-2 text-sm font-bold leading-6 text-rose-500">
              {appDashboard.message}
            </p>
          </div>
        )}

        <div className="mt-8 rounded-[28px] bg-white p-6 shadow-lg shadow-sky-100 md:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
              {isOwner ? (
                <UserCog className="h-7 w-7 text-emerald-500" />
              ) : (
                <LockKeyhole className="h-7 w-7 text-violet-500" />
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black">
                {isOwner ? "오너 권한" : "직원 권한"}
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                {isOwner
                  ? "오너는 앱 활동 통계, 신고, 문의, 유저 관리 영역을 모두 확인할 수 있습니다."
                  : "직원은 신고, 문의, 유저 운영 업무를 중심으로 접근합니다."}
              </p>

              {appDashboard.generatedAt && (
                <p className="mt-3 text-xs font-bold text-slate-400">
                  앱 통계 갱신: {formatKoreanDate(appDashboard.generatedAt)}
                </p>
              )}
            </div>
          </div>
        </div>


        {isOwner && (
          <section className="mt-10 rounded-[32px] bg-gradient-to-br from-emerald-50 via-white to-violet-50 p-6 shadow-xl shadow-emerald-100 md:p-8">
            <div>
              <p className="font-black text-emerald-500">Owner Management</p>
              <h2 className="mt-2 text-3xl font-black">오너 전용 관리</h2>
              <p className="mt-3 leading-7 text-slate-500">
                직원 계정, 구독 현황과 실제 결제 데이터를 각각의 전용
                페이지에서 관리합니다.
              </p>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-3">
              <Link
                href="/admin/staff"
                className="rounded-3xl bg-white p-6 shadow-lg shadow-emerald-100 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <BriefcaseBusiness className="h-8 w-8 text-emerald-500" />
                <h3 className="mt-5 text-2xl font-black">직원 관리</h3>
                <p className="mt-3 leading-7 text-slate-500">
                  Owner와 Staff 계정, 상태와 최근 로그인을 확인합니다.
                </p>
                <span className="mt-5 inline-block font-black text-emerald-600">
                  직원 관리 열기 →
                </span>
              </Link>

              <Link
                href="/admin/subscriptions"
                className="rounded-3xl bg-white p-6 shadow-lg shadow-violet-100 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <Users className="h-8 w-8 text-violet-500" />
                <h3 className="mt-5 text-2xl font-black">구독 관리</h3>
                <p className="mt-3 leading-7 text-slate-500">
                  활성 구독자와 Bronze, Silver, Gold 플랜을 확인합니다.
                </p>
                <span className="mt-5 inline-block font-black text-violet-600">
                  구독 관리 열기 →
                </span>
              </Link>

              <Link
                href="/admin/revenue"
                className="rounded-3xl bg-white p-6 shadow-lg shadow-amber-100 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <BadgeDollarSign className="h-8 w-8 text-amber-500" />
                <h3 className="mt-5 text-2xl font-black">매출 관리</h3>
                <p className="mt-3 leading-7 text-slate-500">
                  스토어별 매출, 환불액과 최근 결제 내역을 확인합니다.
                </p>
                <span className="mt-5 inline-block font-black text-amber-600">
                  매출 관리 열기 →
                </span>
              </Link>
            </div>
          </section>
        )}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {overviewStats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-6 shadow-lg shadow-sky-100 md:p-7"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100 p-3">
                    <Icon className={`h-7 w-7 ${item.color}`} />
                  </div>
                  <LayoutDashboard className="h-5 w-5 text-slate-300" />
                </div>

                <h2 className="mt-6 text-sm font-black text-slate-500">
                  {item.title}
                </h2>
                <p className="mt-2 text-3xl font-black">{item.value}</p>
                <p className="mt-2 text-sm font-semibold text-slate-400">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        <section className="mt-10 rounded-[32px] bg-white p-6 shadow-xl shadow-violet-100 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-black text-violet-500">Live App Metrics</p>
              <h2 className="mt-2 text-3xl font-black">앱 실제 활동 통계</h2>
              <p className="mt-3 leading-7 text-slate-500">
                가짜 매출과 구독 수치를 제거하고 현재 DB에서 계산 가능한
                실제 수치만 표시합니다.
              </p>
            </div>
            <Activity className="h-9 w-9 text-violet-500" />
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {activityStats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl bg-slate-50 p-6"
                >
                  <Icon className={`h-7 w-7 ${item.color}`} />
                  <p className="mt-5 text-sm font-black text-slate-400">
                    {item.title}
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {item.value.toLocaleString("ko-KR")}
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-500">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {isOwner && (
          <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-sky-500">Countries</p>
                  <h2 className="mt-2 text-3xl font-black">국가별 유저</h2>
                </div>
                <Globe2 className="h-8 w-8 text-sky-500" />
              </div>

              <div className="mt-7 space-y-3">
                {appStats.countries.length === 0 ? (
                  <div className="rounded-2xl bg-slate-50 p-6 text-center font-bold text-slate-500">
                    국가 통계가 없습니다.
                  </div>
                ) : (
                  appStats.countries.map((country, index) => (
                    <div
                      key={`${country.countryCode}-${index}`}
                      className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4"
                    >
                      <span className="font-black">
                        {index + 1}. {country.countryCode}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-sky-600">
                        {country.count.toLocaleString("ko-KR")}명
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[32px] bg-gradient-to-br from-emerald-50 to-sky-50 p-6 shadow-xl shadow-emerald-100 md:p-8">
              <p className="font-black text-emerald-600">
                Account Connection
              </p>
              <h2 className="mt-2 text-3xl font-black">
                웹 계정 연결 현황
              </h2>

              <div className="mt-7 grid gap-4">
                <div className="rounded-3xl bg-white p-6">
                  <p className="text-sm font-black text-slate-400">
                    전체 웹 계정
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {totalWebUserCount.toLocaleString("ko-KR")}
                  </p>
                </div>

                <div className="rounded-3xl bg-white p-6">
                  <p className="text-sm font-black text-slate-400">
                    정상 웹 계정
                  </p>
                  <p className="mt-2 text-3xl font-black text-emerald-600">
                    {activeWebUserCount.toLocaleString("ko-KR")}
                  </p>
                </div>

                <div className="rounded-3xl bg-white p-6">
                  <p className="text-sm font-black text-slate-400">
                    정지 웹 계정
                  </p>
                  <p className="mt-2 text-3xl font-black text-rose-500">
                    {suspendedWebUserCount.toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-rose-500">Reports</p>
                <h2 className="mt-2 text-3xl font-black">신고 관리</h2>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/admin/reports"
                  className="rounded-2xl bg-rose-500 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-rose-600 md:px-5"
                >
                  신고 페이지
                </Link>
                <Flag className="hidden h-8 w-8 text-rose-400 sm:block" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {reports.length === 0 && (
                <div className="rounded-2xl bg-slate-50 p-6 text-center">
                  <p className="font-bold text-slate-500">
                    아직 접수된 신고가 없습니다.
                  </p>
                </div>
              )}

              {reports.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-black">{item.type}</p>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        대상: {item.target}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        접수일: {item.createdAt}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${statusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-slate-600">
                    사유: {item.reason}
                  </p>

                  <Link
                    href="/admin/reports"
                    className="mt-4 inline-flex rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white"
                  >
                    상세 처리
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-violet-100 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-violet-500">Inquiries</p>
                <h2 className="mt-2 text-3xl font-black">문의 관리</h2>
              </div>
              <MessageSquare className="h-8 w-8 text-violet-400" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-xs font-black">
              <span className="rounded-full bg-slate-50 px-3 py-2 text-slate-500">
                최근 {inquiries.length}
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-600">
                대기 {inquiries.filter((item) => item.status === "대기").length}
              </span>
              <span className="rounded-full bg-sky-50 px-3 py-2 text-sky-600">
                확인중{" "}
                {inquiries.filter((item) => item.status === "확인중").length}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-600">
                완료 {inquiries.filter((item) => item.status === "완료").length}
              </span>
            </div>

            <div className="mt-5 max-h-[720px] space-y-4 overflow-y-auto pr-1 md:pr-2">
              {inquiries.length === 0 && (
                <div className="rounded-2xl bg-slate-50 p-6 text-center">
                  <p className="font-bold text-slate-500">
                    아직 접수된 문의가 없습니다.
                  </p>
                </div>
              )}

              {inquiries.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-black">{item.name}</p>
                      <p className="mt-1 truncate text-sm text-slate-500">
                        {item.category} · {item.email}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        접수일: {item.createdAt}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${statusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-slate-600">
                    {item.message}
                  </p>

                  {item.adminReply && (
                    <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-600">
                      답변 완료
                    </p>
                  )}

                  <AdminContactActions contact={item} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-12 rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-black text-sky-500">Recent App Users</p>
              <h2 className="mt-2 text-3xl font-black">최근 앱 가입 유저</h2>
              <p className="mt-3 text-sm font-bold text-slate-500">
                앱 PostgreSQL 기준 최근 가입자
              </p>
            </div>

            <Link
              href="/admin/users"
              className="rounded-2xl bg-sky-500 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-sky-600 md:px-5"
            >
              유저 관리
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {appDashboard.recentUsers.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-8 text-center font-bold text-slate-500 md:col-span-2">
                최근 앱 유저 데이터를 불러오지 못했습니다.
              </div>
            ) : (
              appDashboard.recentUsers.map((appUser: RecentAppUser) => (
                <div
                  key={appUser.id}
                  className="flex items-center gap-4 rounded-3xl bg-slate-50 p-5"
                >
                  <SafeAvatar
                    src={appUser.avatar}
                    alt={appUser.username || appUser.name || "유저"}
                    className="h-14 w-14 rounded-2xl"
                    iconClassName="h-7 w-7 text-slate-400"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black">
                      {appUser.username || appUser.name || "insai 유저"}
                    </p>
                    <p className="mt-1 truncate text-sm font-bold text-slate-400">
                      {appUser.email || "이메일 없음"}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-400">
                      {appUser.countryCode || appUser.country || "UNKNOWN"} ·{" "}
                      {formatKoreanDate(appUser.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${statusStyle(
                      appUser.onboardingCompleted
                        ? "온보딩 완료"
                        : "대기"
                    )}`}
                  >
                    {appUser.onboardingCompleted ? "완료" : "미완료"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-12 rounded-[32px] bg-white p-6 shadow-xl shadow-emerald-100 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-black text-emerald-500">Web Accounts</p>
              <h2 className="mt-2 text-3xl font-black">최근 웹 연결 계정</h2>
              <p className="mt-3 text-sm font-bold text-slate-500">
                홈페이지 로그인 계정과 앱 연결 상태 확인
              </p>
            </div>
            <Link
              href="/admin/users"
              className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-black text-white"
            >
              전체 보기
            </Link>
          </div>

          <div className="mt-8 overflow-x-auto rounded-3xl border border-slate-100">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-5 bg-slate-50 px-6 py-4 text-sm font-black text-slate-500">
                <span>닉네임</span>
                <span>이메일</span>
                <span>가입 방식</span>
                <span>앱 연결</span>
                <span>상태</span>
              </div>

              {webUsers.length === 0 && (
                <div className="bg-white px-6 py-8 text-center">
                  <p className="font-bold text-slate-500">
                    아직 웹 연결 계정이 없습니다.
                  </p>
                </div>
              )}

              {webUsers.map((webUser) => (
                <div
                  key={webUser.id}
                  className="grid grid-cols-5 items-center border-t border-slate-100 bg-white px-6 py-5 text-sm"
                >
                  <span className="truncate font-black">
                    {webUser.nickname}
                  </span>
                  <span className="truncate text-slate-500">
                    {webUser.email}
                  </span>
                  <span className="font-bold text-sky-500">
                    {webUser.provider}
                  </span>
                  <span
                    className={
                      webUser.appUserId
                        ? "font-bold text-emerald-600"
                        : "font-bold text-amber-500"
                    }
                  >
                    {webUser.appUserId ? "연결 완료" : "미연결"}
                  </span>
                  <span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle(
                        webUser.status
                      )}`}
                    >
                      {webUser.status}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {isOwner && (
          <section className="mt-12 rounded-[32px] bg-white p-6 shadow-xl shadow-amber-100 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-amber-500">
                  Subscription & Revenue
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  구독·매출 현황
                </h2>
                <p className="mt-3 leading-7 text-slate-500">
                  Prisma의 Subscription과 Payment 데이터를 기준으로
                  계산합니다. 결제 데이터가 아직 없으면 0으로 표시됩니다.
                </p>
              </div>
              <ReceiptText className="h-9 w-9 text-amber-500" />
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl bg-emerald-50 p-6">
                <p className="text-sm font-black text-emerald-600">
                  활성 구독자
                </p>
                <p className="mt-2 text-3xl font-black">
                  {appStats.subscriptions.active.toLocaleString("ko-KR")}명
                </p>
                <p className="mt-2 text-sm font-bold text-emerald-600/70">
                  Bronze {appStats.subscriptions.bronze} · Silver{" "}
                  {appStats.subscriptions.silver} · Gold{" "}
                  {appStats.subscriptions.gold}
                </p>
              </div>

              <div className="rounded-3xl bg-sky-50 p-6">
                <p className="text-sm font-black text-sky-600">오늘 매출</p>
                <p className="mt-2 text-3xl font-black">
                  {formatMoney(appStats.revenue.today)}
                </p>
              </div>

              <div className="rounded-3xl bg-violet-50 p-6">
                <p className="text-sm font-black text-violet-600">
                  이번 달 매출
                </p>
                <p className="mt-2 text-3xl font-black">
                  {formatMoney(appStats.revenue.thisMonth)}
                </p>
                <p className="mt-2 text-sm font-bold text-violet-500">
                  전월 대비 {appStats.revenue.growthRate >= 0 ? "+" : ""}
                  {appStats.revenue.growthRate}%
                </p>
              </div>

              <div className="rounded-3xl bg-rose-50 p-6">
                <p className="text-sm font-black text-rose-600">
                  이번 달 환불
                </p>
                <p className="mt-2 text-3xl font-black">
                  {formatMoney(appStats.revenue.refundedThisMonth)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/admin/subscriptions"
                className="rounded-2xl bg-violet-500 px-5 py-3 font-black text-white"
              >
                구독 전체 보기
              </Link>
              <Link
                href="/admin/revenue"
                className="rounded-2xl bg-amber-500 px-5 py-3 font-black text-white"
              >
                매출 전체 보기
              </Link>
            </div>
          </section>
        )}

        <section className="mt-12 rounded-[32px] bg-gradient-to-br from-sky-50 to-violet-50 p-6 shadow-xl shadow-violet-100 md:p-8">
          <div>
            <p className="font-black text-violet-500">Judgement</p>
            <h2 className="mt-2 text-3xl font-black">운영 판결 상태</h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Clock,
                title: "대기",
                desc: "아직 검토 전",
                value: appStats.reports.pending,
              },
              {
                icon: ShieldCheck,
                title: "확인중",
                desc: "운영팀 검토 중",
                value: appStats.reports.reviewing,
              },
              {
                icon: CheckCircle2,
                title: "완료",
                desc: "조치 완료",
                value: appStats.reports.completed,
              },
              {
                icon: XCircle,
                title: "반려",
                desc: "위반 아님",
                value: appStats.reports.rejected,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl bg-white p-6 shadow-lg shadow-sky-100"
                >
                  <div className="flex items-center justify-between">
                    <Icon className="h-7 w-7 text-violet-500" />
                    <span className="text-2xl font-black">
                      {item.value}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-black">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
