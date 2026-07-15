import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Banknote, CreditCard, Home, ReceiptText, RotateCcw } from "lucide-react";

type PaymentItem = {
  id: string;
  provider: string;
  status: string;
  productId: string;
  transactionId: string;
  amount: number;
  currency: string;
  purchasedAt: string;
  user: {
    id: string;
    username?: string | null;
    name?: string | null;
    email?: string | null;
  };
  subscription?: {
    plan?: string | null;
    status?: string | null;
  } | null;
};

function formatMoney(value: number, currency = "KRW") {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}

async function loadPayments(): Promise<PaymentItem[]> {
  const baseUrl = process.env.APP_BACKEND_URL;
  const secret = process.env.WEB_AUTH_SECRET || "";
  if (!baseUrl) return [];

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/admin/revenue`, {
    headers: {
      ...(secret ? { "x-web-auth-secret": secret } : {}),
      "ngrok-skip-browser-warning": "69420",
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success === false) return [];
  return Array.isArray(result.payments) ? result.payments : [];
}

export default async function AdminRevenuePage() {
  const cookieStore = await cookies();

  if (cookieStore.get("insai_admin_auth")?.value !== "true") {
    redirect("/admin/login");
  }
  if (cookieStore.get("insai_admin_role")?.value !== "owner") {
    redirect("/admin");
  }

  const payments = await loadPayments();
  const paidPayments = payments.filter((item) => item.status === "PAID");
  const totalRevenue = paidPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const refundedRevenue = payments
    .filter((item) => ["REFUNDED", "PARTIALLY_REFUNDED"].includes(item.status))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const cards = [
    { label: "누적 결제 매출", value: formatMoney(totalRevenue), icon: Banknote, color: "text-emerald-500" },
    { label: "결제 성공 건", value: `${paidPayments.length}건`, icon: ReceiptText, color: "text-sky-500" },
    { label: "환불 금액", value: formatMoney(refundedRevenue), icon: RotateCcw, color: "text-rose-500" },
    { label: "전체 결제 기록", value: `${payments.length}건`, icon: CreditCard, color: "text-violet-500" },
  ];

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6">
          <div>
            <p className="text-sm font-black text-emerald-500">Revenue Management</p>
            <h1 className="text-2xl font-black">매출 관리</h1>
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
          <p className="font-black text-emerald-500">Payment List</p>
          <h2 className="mt-2 text-3xl font-black">최근 결제 내역</h2>

          <div className="mt-7 overflow-x-auto rounded-3xl border border-slate-100">
            <div className="min-w-[1100px]">
              <div className="grid grid-cols-8 bg-slate-50 px-6 py-4 text-sm font-black text-slate-500">
                <span>유저</span><span>플랜</span><span>스토어</span><span>상품 ID</span><span>금액</span><span>상태</span><span>거래 ID</span><span>결제일</span>
              </div>
              {payments.map((item) => (
                <div key={item.id} className="grid grid-cols-8 items-center border-t border-slate-100 px-6 py-5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-black">{item.user.username || item.user.name || "insai 유저"}</p>
                    <p className="truncate text-xs text-slate-400">{item.user.email || item.user.id}</p>
                  </div>
                  <span className="font-black text-violet-500">{item.subscription?.plan || "-"}</span>
                  <span>{item.provider}</span>
                  <span className="truncate">{item.productId}</span>
                  <span className="font-black">{formatMoney(item.amount, item.currency)}</span>
                  <span>{item.status}</span>
                  <span className="truncate text-xs text-slate-400">{item.transactionId}</span>
                  <span>{formatDate(item.purchasedAt)}</span>
                </div>
              ))}
              {payments.length === 0 && (
                <div className="px-6 py-10 text-center font-bold text-slate-500">
                  아직 저장된 결제 데이터가 없습니다.
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}