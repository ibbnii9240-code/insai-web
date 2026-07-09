import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Contact from "@/models/Contact";
import Report from "@/models/Report";
import User from "@/models/User";
import AdminContactActions from "@/components/AdminContactActions";
import {
  Home,
  LayoutDashboard,
  Flag,
  MessageSquare,
  Users,
  FileText,
  Ban,
  DollarSign,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  LockKeyhole,
  UserCog,
  LogOut,
  UserPlus,
  Building2,
  Crown,
  BriefcaseBusiness,
  KeyRound,
  Activity,
} from "lucide-react";

type ContactStatus = "대기" | "확인중" | "완료";

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

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("insai_admin_auth")?.value;
  const role = cookieStore.get("insai_admin_role")?.value;

  if (isAdmin !== "true") {
    redirect("/admin/login");
  }

  const isOwner = role === "owner";

  await connectDB();

  const contacts = await Contact.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const reportDocs = await Report.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const userDocs = await User.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const totalUserCount = await User.countDocuments();
  const activeUserCount = await User.countDocuments({ status: "active" });
  const suspendedUserCount = await User.countDocuments({ status: "suspended" });

  const users = userDocs.map((user) => ({
    id: String(user._id),
    nickname: user.nickname || user.name || "이름 없음",
    email: user.email || "이메일 없음",
    status:
      user.status === "suspended"
        ? "정지"
        : user.status === "deleted"
          ? "탈퇴"
          : "정상",
    plan: user.subscriptionPlan || "Free",
    provider: user.provider || "-",
    createdAt: user.createdAt
      ? new Date(user.createdAt).toLocaleString("ko-KR")
      : "",
  }));

  const reports = reportDocs.map((report) => ({
    id: String(report._id),
    type: report.category || "신고",
    target: report.targetUserName || "대상 없음",
    targetId: report.targetUserId || "",
    reporter: report.reporterName || "신고자 없음",
    reporterEmail: report.reporterEmail || "",
    reason: report.reason || "",
    status: report.status || "대기",
    createdAt: report.createdAt
      ? new Date(report.createdAt).toLocaleString("ko-KR")
      : "",
  }));

  const pendingReportCount = reports.filter(
    (item) => item.status === "대기" || item.status === "확인중"
  ).length;

  const inquiries = contacts.map((contact) => ({
    id: String(contact._id),
    name: contact.name || "이름 없음",
    email: contact.email || "이메일 없음",
    category: contact.category || "일반 문의",
    message: contact.message || "",
    status: normalizeStatus(contact.status),
    adminReply: contact.adminReply || "",
    createdAt: contact.createdAt
      ? new Date(contact.createdAt).toLocaleString("ko-KR")
      : "",
    repliedAt: contact.repliedAt
      ? new Date(contact.repliedAt).toLocaleString("ko-KR")
      : "",
  }));

  const pendingInquiryCount = inquiries.filter(
    (item) => item.status === "대기" || item.status === "확인중"
  ).length;

  const stats = [
    {
      title: "총 유저",
      value: String(totalUserCount),
      desc: `정상 ${activeUserCount}명 / 정지 ${suspendedUserCount}명`,
      icon: Users,
      color: "text-sky-500",
    },
    {
      title: "대기 신고",
      value: String(pendingReportCount),
      desc: "검토 필요",
      icon: Flag,
      color: "text-rose-500",
    },
    {
      title: "문의",
      value: String(pendingInquiryCount),
      desc: "미처리 문의",
      icon: MessageSquare,
      color: "text-violet-500",
    },
    {
      title: "월 매출",
      value: "₩2,840,000",
      desc: "이번 달 예상 매출",
      icon: DollarSign,
      color: "text-emerald-500",
      ownerOnly: true,
    },
  ];

  const revenue = [
    {
      title: "구독 매출",
      value: "₩2,140,000",
      desc: "App Store / Play Store 구독",
      icon: CreditCard,
    },
    {
      title: "활성 구독자",
      value: "186명",
      desc: "Bronze / Silver / Gold",
      icon: Users,
    },
    {
      title: "전월 대비",
      value: "+18.4%",
      desc: "월간 성장률",
      icon: TrendingUp,
    },
  ];

  const staffMembers = [
    {
      name: "김민준",
      email: "staff@insai.app",
      role: "Staff",
      permission: "신고 / 문의 / 유저 판결",
      status: "활성",
    },
    {
      name: "이지아",
      email: "manager@insai.app",
      role: "Manager",
      permission: "운영 관리 / 직원 검토",
      status: "활성",
    },
    {
      name: "박서윤",
      email: "finance@insai.app",
      role: "Finance",
      permission: "정산 확인 / 매출 보조",
      status: "대기",
    },
  ];

  const organization = [
    {
      icon: Crown,
      title: "Owner",
      name: "인우",
      desc: "전체 권한 / 매출 / 직원 관리",
      color: "text-emerald-500",
    },
    {
      icon: BriefcaseBusiness,
      title: "Manager",
      name: "운영 매니저",
      desc: "신고 처리 / 직원 업무 관리",
      color: "text-blue-500",
    },
    {
      icon: ShieldCheck,
      title: "Staff",
      name: "운영 직원",
      desc: "문의 / 신고 / 유저 판결",
      color: "text-violet-500",
    },
    {
      icon: DollarSign,
      title: "Finance",
      name: "정산 담당",
      desc: "매출 확인 / 구독 리포트",
      color: "text-emerald-500",
    },
  ];

  const ownerMenus = [
    "매출 및 수익 통계",
    "구독자 관리",
    "직원 계정 생성",
    "직원 관리",
    "회사 조직도",
    "전체 운영 로그",
  ];

  const staffMenus = [
    "문의 관리",
    "신고 관리",
    "유저 판결",
    "게시물 검토",
  ];

  const visibleStats = stats.filter((item) => !item.ownerOnly || isOwner);

  const statusStyle = (status: string) => {
    if (status === "완료" || status === "정상" || status === "활성") {
      return "bg-emerald-50 text-emerald-600";
    }

    if (status === "대기") {
      return "bg-amber-50 text-amber-600";
    }

    if (status === "정지") {
      return "bg-rose-50 text-rose-600";
    }

    return "bg-sky-50 text-sky-600";
  };

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
            <span className="text-3xl font-extrabold tracking-tight">
              insai
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-4 py-2 text-sm font-black ${
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
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-600"
              >
                <LogOut className="h-4 w-4" />
                로그아웃
              </button>
            </form>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Home className="h-4 w-4" />
              홈으로
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div>
          <p className="font-black text-sky-500">Admin Dashboard</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">
            insai 관리자 페이지
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {isOwner
              ? "오너 계정입니다. 문의, 신고, 유저, 게시물, 직원, 조직도, 매출과 구독 수익까지 전체 관리할 수 있습니다."
              : "직원 계정입니다. 문의, 신고, 유저 판결, 게시물 검토 중심으로 운영 관리할 수 있습니다."}
          </p>
        </div>

        <div className="mt-8 rounded-[28px] bg-white p-7 shadow-lg shadow-sky-100">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
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
                  ? "오너는 수익, 구독, 직원 계정, 회사 조직도, 운영 로그까지 전체 접근 가능합니다."
                  : "직원은 매출/수익/직원 관리 정보 없이 운영 업무만 접근 가능합니다."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {(isOwner ? ownerMenus : staffMenus).map((menu) => (
                  <span
                    key={menu}
                    className="rounded-full bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600"
                  >
                    {menu}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {visibleStats.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-7 shadow-lg shadow-sky-100"
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

        {isOwner && (
          <>
            <section className="mt-8">
              <div className="grid gap-6 lg:grid-cols-3">
                {revenue.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-3xl bg-white p-7 shadow-lg shadow-violet-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-sky-100">
                          <Icon className="h-7 w-7 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-500">
                            {item.title}
                          </p>
                          <p className="mt-1 text-2xl font-black">
                            {item.value}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-12 rounded-[32px] bg-white p-8 shadow-xl shadow-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-emerald-500">Staff Management</p>
                  <h2 className="mt-2 text-3xl font-black">직원 관리</h2>
                  <p className="mt-4 leading-8 text-slate-600">
                    오너가 직접 직원 계정을 생성하고, 권한을 설정하고, 직원 상태를
                    관리하는 영역입니다.
                  </p>
                </div>
                <UserPlus className="h-9 w-9 text-emerald-500" />
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                <div className="rounded-3xl bg-slate-50 p-6">
                  <h3 className="text-2xl font-black">직원 계정 생성</h3>

                  <div className="mt-6 grid gap-4">
                    <input
                      type="text"
                      placeholder="직원 이름"
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-violet-400"
                    />

                    <input
                      type="email"
                      placeholder="직원 이메일"
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-violet-400"
                    />

                    <input
                      type="password"
                      placeholder="임시 비밀번호"
                      className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-violet-400"
                    />

                    <select className="rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-violet-400">
                      <option>직원 역할 선택</option>
                      <option>Staff - 신고/문의 처리</option>
                      <option>Manager - 운영 관리</option>
                      <option>Finance - 매출/정산 보조</option>
                    </select>

                    <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-6 py-4 font-bold text-white shadow-lg shadow-violet-200">
                      <UserPlus className="h-5 w-5" />
                      직원 계정 생성
                    </button>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-100">
                  <div className="grid grid-cols-5 bg-slate-50 px-6 py-4 text-sm font-black text-slate-500">
                    <span>이름</span>
                    <span>이메일</span>
                    <span>역할</span>
                    <span>상태</span>
                    <span>관리</span>
                  </div>

                  {staffMembers.map((staff) => (
                    <div
                      key={staff.email}
                      className="grid grid-cols-5 items-center border-t border-slate-100 bg-white px-6 py-5 text-sm"
                    >
                      <span className="font-black">{staff.name}</span>
                      <span className="text-slate-500">{staff.email}</span>
                      <span className="font-bold text-violet-500">
                        {staff.role}
                      </span>
                      <span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle(
                            staff.status
                          )}`}
                        >
                          {staff.status}
                        </span>
                      </span>
                      <span className="flex gap-2">
                        <button className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
                          수정
                        </button>
                        <button className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-bold text-white">
                          정지
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-12 rounded-[32px] bg-gradient-to-br from-sky-50 to-violet-50 p-8 shadow-xl shadow-violet-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-violet-500">Company Chart</p>
                  <h2 className="mt-2 text-3xl font-black">
                    insai 회사 계보도 / 조직도
                  </h2>
                  <p className="mt-4 leading-8 text-slate-600">
                    오너를 중심으로 운영 매니저, 직원, 정산 담당을 구분해서
                    회사 구조를 관리할 수 있습니다.
                  </p>
                </div>
                <Building2 className="h-9 w-9 text-violet-500" />
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                {organization.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-3xl bg-white p-6 shadow-lg shadow-sky-100"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
                        <Icon className={`h-7 w-7 ${item.color}`} />
                      </div>

                      <h3 className="mt-5 text-xl font-black">{item.title}</h3>
                      <p className="mt-2 font-bold text-slate-700">
                        {item.name}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-12 rounded-[32px] bg-white p-8 shadow-xl shadow-sky-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-black text-blue-500">Owner Controls</p>
                  <h2 className="mt-2 text-3xl font-black">오너 전용 권한 설정</h2>
                </div>
                <KeyRound className="h-9 w-9 text-blue-500" />
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  "직원 계정 생성",
                  "직원 권한 변경",
                  "직원 정지/삭제",
                  "직원 활동 로그 확인",
                  "매출 접근 권한 부여",
                  "운영 로그 전체 열람",
                  "관리자 비밀번호 초기화",
                  "부서/역할 관리",
                ].map((text) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 rounded-2xl bg-slate-50 p-5 font-bold"
                  >
                    <Activity className="h-5 w-5 text-violet-500" />
                    {text}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {!isOwner && (
          <section className="mt-8 rounded-[28px] border border-violet-100 bg-violet-50/60 p-6">
            <div className="flex items-center gap-3">
              <LockKeyhole className="h-5 w-5 text-violet-500" />
              <p className="font-bold text-violet-600">
                직원 계정은 매출, 수익, 구독자 통계, 직원 관리, 회사 조직도 영역이
                숨김 처리됩니다.
              </p>
            </div>
          </section>
        )}

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <section className="rounded-[32px] bg-white p-8 shadow-xl shadow-sky-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-black text-rose-500">Reports</p>
                <h2 className="mt-2 text-3xl font-black">신고 관리</h2>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/admin/reports"
                  className="rounded-2xl bg-rose-500 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-rose-600"
                >
                  신고 페이지로 이동
                </Link>
                <Flag className="h-8 w-8 text-rose-400" />
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {reports.length === 0 && (
                <div className="rounded-2xl bg-slate-50 p-6 text-center">
                  <p className="font-bold text-slate-500">
                    아직 접수된 신고가 없습니다.
                  </p>
                  <Link
                    href="/admin/reports"
                    className="mt-4 inline-flex rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white"
                  >
                    신고 관리 페이지 열기
                  </Link>
                </div>
              )}

              {reports.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-50 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-black">{item.type}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        대상: {item.target}
                      </p>
                      {item.createdAt && (
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          접수일: {item.createdAt}
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm text-slate-600">
                    사유: {item.reason}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href="/admin/reports"
                      className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm"
                    >
                      상세보기
                    </Link>
                    <Link
                      href="/admin/reports"
                      className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white"
                    >
                      처리하기
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-8 shadow-xl shadow-violet-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-violet-500">Inquiries</p>
                <h2 className="mt-2 text-3xl font-black">문의 관리</h2>
              </div>
              <MessageSquare className="h-8 w-8 text-violet-400" />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-5 py-4">
              <p className="text-sm font-black text-slate-600">
                최근 문의 {inquiries.length}개
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-black">
                <span className="rounded-full bg-white px-3 py-2 text-slate-500">
                  전체 {inquiries.length}
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-600">
                  대기 {inquiries.filter((item) => item.status === "대기").length}
                </span>
                <span className="rounded-full bg-sky-50 px-3 py-2 text-sky-600">
                  확인중 {inquiries.filter((item) => item.status === "확인중").length}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-600">
                  완료 {inquiries.filter((item) => item.status === "완료").length}
                </span>
              </div>
            </div>

            <div className="mt-5 max-h-[720px] space-y-4 overflow-y-auto pr-2">
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
                    <div>
                      <p className="font-black">{item.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.category} · {item.email}
                      </p>
                      {item.createdAt && (
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          접수일: {item.createdAt}
                        </p>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle(
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

        <section className="mt-12 rounded-[32px] bg-white p-8 shadow-xl shadow-sky-100">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-black text-sky-500">Users</p>
              <h2 className="mt-2 text-3xl font-black">유저 관리</h2>
              <p className="mt-3 text-sm font-bold text-slate-500">
                최근 가입 유저 {users.length}명 · 전체 {totalUserCount}명
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/admin/users"
                className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-sky-600"
              >
                유저 페이지로 이동
              </Link>
              <Users className="h-8 w-8 text-sky-400" />
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-100">
            <div className="grid grid-cols-5 bg-slate-50 px-6 py-4 text-sm font-black text-slate-500">
              <span>닉네임</span>
              <span>이메일</span>
              <span>가입방식</span>
              <span>구독</span>
              <span>상태</span>
            </div>

            {users.length === 0 && (
              <div className="bg-white px-6 py-8 text-center">
                <p className="font-bold text-slate-500">
                  아직 가입한 유저가 없습니다.
                </p>
              </div>
            )}

            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-5 items-center border-t border-slate-100 px-6 py-5 text-sm"
              >
                <span className="font-black">{user.nickname}</span>
                <span className="truncate text-slate-500">{user.email}</span>
                <span className="font-bold text-sky-500">{user.provider}</span>
                <span className="font-bold text-violet-500">{user.plan}</span>
                <span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle(
                      user.status
                    )}`}
                  >
                    {user.status}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 font-bold text-white"
            >
              <Ban className="h-4 w-4" />
              유저 정지 / 해제
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              유저 상세 관리
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white"
            >
              <FileText className="h-4 w-4" />
              유저 목록 보기
            </Link>
          </div>
        </section>

        <section className="mt-12 rounded-[32px] bg-gradient-to-br from-sky-50 to-violet-50 p-8 shadow-xl shadow-violet-100">
          <div>
            <p className="font-black text-violet-500">Judgement</p>
            <h2 className="mt-2 text-3xl font-black">운영 판결 상태</h2>
            <p className="mt-4 max-w-2xl leading-8 text-slate-600">
              신고나 문의를 검토한 뒤 처리 결과를 대기, 처리중, 완료, 기각으로
              관리할 수 있습니다.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              { icon: Clock, title: "대기", desc: "아직 검토 전" },
              { icon: ShieldCheck, title: "처리중", desc: "운영팀 검토 중" },
              { icon: CheckCircle2, title: "완료", desc: "조치 완료" },
              { icon: XCircle, title: "기각", desc: "위반 아님" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-3xl bg-white p-6 shadow-lg shadow-sky-100"
                >
                  <Icon className="h-7 w-7 text-violet-500" />
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
