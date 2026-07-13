"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Crown,
  Gem,
  Home,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type BillingCycle = "monthly" | "yearly";
type PlanId = "bronze" | "silver" | "gold";

type Plan = {
  id: PlanId;
  name: string;
  subtitle: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: typeof Star;
  badge?: string;
  features: string[];
  cardClass: string;
  iconClass: string;
  buttonClass: string;
};

const plans: Plan[] = [
  {
    id: "bronze",
    name: "Bronze",
    subtitle: "insai를 가볍게 시작하는 기본 플랜",
    monthlyPrice: 4900,
    yearlyPrice: 49000,
    icon: Star,
    features: [
      "일일 스와이프 기본 제공",
      "기본 검색 필터",
      "커뮤니티 핵심 기능 이용",
      "기본 고객지원",
    ],
    cardClass: "border-amber-200 bg-gradient-to-b from-amber-50 to-white",
    iconClass: "bg-amber-100 text-amber-600",
    buttonClass:
      "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-100",
  },
  {
    id: "silver",
    name: "Silver",
    subtitle: "더 많은 연결과 편리한 기능을 원하는 플랜",
    monthlyPrice: 9900,
    yearlyPrice: 99000,
    icon: Gem,
    badge: "추천",
    features: [
      "Bronze의 모든 기능",
      "일일 스와이프 추가 제공",
      "고급 검색 필터",
      "좋아요 확인 기능",
      "광고 노출 감소",
    ],
    cardClass:
      "border-sky-300 bg-gradient-to-b from-sky-50 via-white to-violet-50 ring-2 ring-sky-200",
    iconClass: "bg-sky-100 text-sky-600",
    buttonClass:
      "bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-violet-200 hover:opacity-90",
  },
  {
    id: "gold",
    name: "Gold",
    subtitle: "insai의 모든 프리미엄 기능을 이용하는 최고 플랜",
    monthlyPrice: 19900,
    yearlyPrice: 199000,
    icon: Crown,
    badge: "Premium",
    features: [
      "Silver의 모든 기능",
      "좋아요 전체 확인",
      "프로필 우선 노출",
      "프로필 부스트",
      "광고 제거",
      "프리미엄 고객지원",
    ],
    cardClass: "border-violet-300 bg-gradient-to-b from-violet-50 to-white",
    iconClass: "bg-violet-100 text-violet-600",
    buttonClass:
      "bg-slate-950 text-white hover:bg-slate-800 shadow-slate-200",
  },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] =
    useState<PlanId | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const safeUser = user as any;
  const currentPlan = String(
    safeUser?.subscriptionPlan ||
      safeUser?.plan ||
      safeUser?.membership ||
      "free"
  ).toLowerCase();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  const yearlySavingText = useMemo(() => {
    return "연간 결제 시 약 2개월 할인";
  }, []);

  function handleSelectPlan(plan: Plan) {
    setSelectedPlan(plan.id);

    window.alert(
      `${plan.name} 플랜 결제는 insai 앱의 App Store 또는 Google Play 인앱결제로 진행해주세요.`
    );
  }

  async function handleRestorePurchase() {
    try {
      setIsRestoring(true);

      await new Promise((resolve) => setTimeout(resolve, 700));

      window.alert(
        "구독 복원은 insai 앱의 구독 관리 화면에서 진행해주세요."
      );
    } finally {
      setIsRestoring(false);
    }
  }

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FBFF]">
        <RefreshCw className="h-8 w-8 animate-spin text-violet-400" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6 md:py-5">
          <Link href="/mypage" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
              <Sparkles className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-black text-violet-500">
                insai Premium
              </p>
              <p className="text-xl font-black">구독 관리</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/mypage"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">마이페이지</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black shadow-sm transition hover:bg-slate-50"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">홈으로</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-6 md:py-14">
        <section className="overflow-hidden rounded-[36px] bg-gradient-to-br from-sky-500 via-violet-500 to-fuchsia-500 p-7 text-white shadow-2xl shadow-violet-200 md:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
              <Zap className="h-4 w-4" />
              insai Premium
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              더 많은 연결을 위한
              <br />
              나에게 맞는 플랜
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
              Bronze, Silver, Gold 중 원하는 플랜을 비교하고 앱에서
              안전하게 구독할 수 있습니다.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[30px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-sky-500">Current Plan</p>
              <h2 className="mt-2 text-3xl font-black">현재 구독 상태</h2>
              <p className="mt-3 text-slate-500">
                현재 계정에 연결된 구독 정보를 확인합니다.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 px-6 py-5">
              <p className="text-sm font-black text-slate-400">현재 플랜</p>
              <p className="mt-2 text-2xl font-black capitalize">
                {currentPlan === "free" ? "무료 이용중" : currentPlan}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-2xl bg-white p-1.5 shadow-lg shadow-sky-100">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-xl px-6 py-3 text-sm font-black transition ${
                billingCycle === "monthly"
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              월간
            </button>

            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`rounded-xl px-6 py-3 text-sm font-black transition ${
                billingCycle === "yearly"
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              연간
            </button>
          </div>
        </div>

        {billingCycle === "yearly" && (
          <p className="mt-4 text-center font-black text-emerald-600">
            {yearlySavingText}
          </p>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price =
              billingCycle === "monthly"
                ? plan.monthlyPrice
                : plan.yearlyPrice;
            const isSelected = selectedPlan === plan.id;
            const isCurrent = currentPlan === plan.id;

            return (
              <article
                key={plan.id}
                className={`relative rounded-[32px] border p-7 shadow-xl shadow-sky-100 transition hover:-translate-y-1 md:p-8 ${plan.cardClass}`}
              >
                {plan.badge && (
                  <span className="absolute right-6 top-6 rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white">
                    {plan.badge}
                  </span>
                )}

                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${plan.iconClass}`}
                >
                  <Icon className="h-7 w-7" />
                </div>

                <h2 className="mt-6 text-3xl font-black">{plan.name}</h2>
                <p className="mt-3 min-h-14 leading-7 text-slate-500">
                  {plan.subtitle}
                </p>

                <div className="mt-6">
                  <span className="text-4xl font-black">
                    ₩{formatPrice(price)}
                  </span>
                  <span className="ml-2 font-bold text-slate-400">
                    / {billingCycle === "monthly" ? "월" : "년"}
                  </span>
                </div>

                <div className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                      <p className="text-sm font-bold leading-6 text-slate-600">
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrent}
                  className={`mt-8 w-full rounded-2xl px-5 py-4 font-black shadow-lg transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none ${plan.buttonClass}`}
                >
                  {isCurrent
                    ? "현재 이용중"
                    : isSelected
                      ? "앱에서 구독하기"
                      : `${plan.name} 선택`}
                </button>
              </article>
            );
          })}
        </section>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-xl shadow-violet-100 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-500" />
                <p className="font-black text-emerald-600">
                  안전한 인앱결제
                </p>
              </div>

              <h2 className="mt-3 text-3xl font-black">
                결제와 구독 변경은 앱에서
              </h2>

              <p className="mt-3 max-w-2xl leading-8 text-slate-500">
                실제 결제, 구독 변경, 해지는 Apple App Store 또는
                Google Play의 인앱결제를 통해 처리됩니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRestorePurchase}
              disabled={isRestoring}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-5 w-5 ${
                  isRestoring ? "animate-spin" : ""
                }`}
              />
              구독 복원 안내
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
