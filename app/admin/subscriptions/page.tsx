import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarClock, CheckCircle2, CreditCard, Home, Users } from "lucide-react";

type SubscriptionItem = {
  id: string;
  plan: "BRONZE" | "SILVER" | "GOLD";
  status: string;
  provider: string;
  productId: string;
  startedAt: string;
  expiresAt?: string | null;
  autoRenew: boolean;
  user: {
    id: string;
    username?: string | null;
    name?: string | null;
    email?: string | null;
    countryCode?: string | null;
  };
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}

async function loadSubscriptions(): Promise<SubscriptionItem[]> {
  const baseUrl = process.env.APP_BACKEND_URL;
  const secret = process.env.WEB_AUTH_SECRET || "";
  if (!baseUrl) return [];

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/admin/subscriptions`, {
    headers: {
      ...(secret ? { "x-web-auth-secret": secret } : {}),
      "ngrok-skip-browser-warning": "69420",
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success === false) return [];
  return Array.isArray(result.subscriptions) ? result.subscriptions : [];
}

export default async function AdminSubscriptionsPage() {
  const cookieStore = await cookies();

  if (cookieStore.get("insai_admin_auth")?.value !== "true") {
    redirect("/admin/login");
  }
  if (cookieStore.get("insai_admin_role")?.value !== "owner") {
    redirect("/admin");
  }

  const subscriptions = await loadSubscriptions();
  const active = subscriptions.filter((item) => item.status === "ACTIVE").length;

  const cards = [
    { label: "활성 구독", value: active, icon: CheckCircle2, color: "text-emerald-500" },
    { label: "Bronze", value: subscriptions.filter((item) => item.plan === "BRONZE" && item.status === "ACTIVE").length, icon: CreditCard, color: "text-amber-600" },
    { label: "Silver", value: subscriptions.filter((item) => item.plan === "SILVER" && item.status === "ACTIVE").length, icon: Users, color: "text-slate-500" },
    { label: "Gold", value: subscriptions.filter((item) => item.plan === "GOLD" && item.status === "ACTIVE").length, icon: CalendarClock, color: "text-yellow-500" },
  ];

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6">
          <div>
            <p className="text-sm font-black text-emerald-500">Subscription Management</p>
            <h1 className="text-2xl font-black">구독 관리</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black">
              <ArrowLeft className="h-4 w-4" /> 관리자 홈
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black">
              <Home className="h-4 w-4" /> 홈
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-3xl bg-white p-6 shadow-lg shadow-sky-100">
                <Icon className={`h-7 w-7 ${item.color}`} />
                <p className="mt-5 text-sm font-black text-slate-400">{item.label}</p>
                <p className="mt-2 text-3xl font-black">{item.value}</p>
              </div>
            );
          })}
        </div>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
          <p className="font-black text-emerald-500">Subscription List</p>
          <h2 className="mt-2 text-3xl font-black">구독 목록</h2>

          <div className="mt-7 overflow-x-auto rounded-3xl border border-slate-100">
            <div className="min-w-[1050px]">
              <div className="grid grid-cols-7 bg-slate-50 px-6 py-4 text-sm font-black text-slate-500">
                <span>유저</span><span>플랜</span><span>상태</span><span>스토어</span><span>자동 갱신</span><span>시작일</span><span>만료일</span>
              </div>
              {subscriptions.map((item) => (
                <div key={item.id} className="grid grid-cols-7 items-center border-t border-slate-100 px-6 py-5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-black">{item.user.username || item.user.name || "insai 유저"}</p>
                    <p className="truncate text-xs text-slate-400">{item.user.email || item.user.id}</p>
                  </div>
                  <span className="font-black text-violet-500">{item.plan}</span>
                  <span className="font-black">{item.status}</span>
                  <span>{item.provider}</span>
                  <span>{item.autoRenew ? "ON" : "OFF"}</span>
                  <span>{formatDate(item.startedAt)}</span>
                  <span>{formatDate(item.expiresAt)}</span>
                </div>
              ))}
              {subscriptions.length === 0 && (
                <div className="px-6 py-10 text-center font-bold text-slate-500">
                  아직 저장된 구독 데이터가 없습니다.
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}