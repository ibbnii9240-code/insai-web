"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clover,
  Crown,
  Gem,
  Home,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type PackageId = "1w" | "1m" | "3m";
type PlanId = "basic" | "plus" | "vip";

type PackageOption = {
  id: PackageId;
  label: string;
  price: string;
  monthlyCalc?: string;
  badge?: string;
};

type Plan = {
  id: PlanId;
  name: string;
  subtitle: string;
  icon: typeof Star;
  badge?: string;
  features: string[];
  packages: PackageOption[];
  cardClass: string;
  iconClass: string;
  buttonClass: string;
};

type CloverPack = {
  id: string;
  count: number;
  price: string;
  badge?: string;
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic Plan",
    subtitle: "insai의 핵심 프리미엄 기능을 시작하는 기본 요금제",
    icon: Star,
    features: [
      "스크롤 라이크 무제한",
      "되돌리기 무제한",
      "매주 부스터 1개",
      "매주 슈퍼라이크 1개",
      "패스포트 모드 무제한",
    ],
    packages: [
      {
        id: "1w",
        label: "1주",
        price: "₩7,000",
      },
      {
        id: "1m",
        label: "1개월",
        price: "₩14,000",
        badge: "인기",
      },
      {
        id: "3m",
        label: "3개월",
        price: "₩29,000",
        monthlyCalc: "월 약 ₩9,667",
      },
    ],
    cardClass:
      "border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900 text-white",
    iconClass: "bg-white/10 text-white",
    buttonClass: "bg-white text-slate-950 hover:bg-slate-100",
  },
  {
    id: "plus",
    name: "Plus Plan",
    subtitle: "좋아요 확인과 더 많은 주간 혜택을 제공하는 인기 요금제",
    icon: Gem,
    badge: "추천",
    features: [
      "스크롤 라이크 무제한",
      "내가 받은 라이크 보기",
      "되돌리기 무제한",
      "매주 무료 부스터 2개",
      "매주 무료 슈퍼라이크 3개",
      "패스포트 무제한",
      "실시간 국내 TOP 20 유저 5명에게 무료 친구신청",
    ],
    packages: [
      {
        id: "1w",
        label: "1주",
        price: "₩9,900",
      },
      {
        id: "1m",
        label: "1개월",
        price: "₩29,000",
        badge: "인기",
      },
      {
        id: "3m",
        label: "3개월",
        price: "₩59,000",
        monthlyCalc: "월 약 ₩19,667",
      },
    ],
    cardClass:
      "border-sky-200 bg-gradient-to-b from-white via-sky-50 to-white text-slate-950 ring-2 ring-sky-100",
    iconClass: "bg-sky-100 text-sky-600",
    buttonClass:
      "bg-gradient-to-r from-sky-500 to-violet-500 text-white hover:opacity-90",
  },
  {
    id: "vip",
    name: "VIP Plan",
    subtitle: "글로벌 우선 노출과 토크패스까지 제공하는 최고 등급 요금제",
    icon: Crown,
    badge: "VIP",
    features: [
      "스크롤 라이크 무제한",
      "내가 받은 라이크 보기",
      "되돌리기 무제한",
      "매주 무료 슈퍼라이크 4개",
      "패스포트 무제한",
      "실시간 글로벌 TOP 20 유저 5명에게 매주 무료 친구신청",
      "상대에게 내 프로필 먼저 보이게 하기",
      "토크패스 매주 5개 무료",
    ],
    packages: [
      {
        id: "1w",
        label: "1주",
        price: "₩19,000",
      },
      {
        id: "1m",
        label: "1개월",
        price: "₩49,000",
        badge: "인기",
      },
      {
        id: "3m",
        label: "3개월",
        price: "₩99,000",
        monthlyCalc: "월 ₩33,000",
      },
    ],
    cardClass:
      "border-violet-200 bg-gradient-to-br from-violet-100 via-sky-50 to-fuchsia-100 text-slate-950",
    iconClass: "bg-violet-100 text-violet-600",
    buttonClass:
      "bg-gradient-to-r from-violet-600 to-indigo-700 text-white hover:opacity-90",
  },
];

const CLOVER_PACKS: CloverPack[] = [
  {
    id: "c1",
    count: 1,
    price: "₩1,500",
  },
  {
    id: "c3",
    count: 3,
    price: "₩3,900",
    badge: "5% OFF",
  },
  {
    id: "c5",
    count: 5,
    price: "₩5,900",
    badge: "10% OFF",
  },
  {
    id: "c10",
    count: 10,
    price: "₩9,900",
    badge: "BEST",
    highlight: true,
  },
  {
    id: "c20",
    count: 20,
    price: "₩19,000",
    badge: "20% OFF",
  },
];

function normalizeCurrentPlan(value: unknown): PlanId | "free" {
  const plan = String(value || "free").toLowerCase();

  if (plan === "basic" || plan === "bronze") return "basic";
  if (plan === "plus" || plan === "silver") return "plus";
  if (plan === "vip" || plan === "gold") return "vip";

  return "free";
}

function currentPlanLabel(plan: PlanId | "free") {
  if (plan === "basic") return "Basic Plan";
  if (plan === "plus") return "Plus Plan";
  if (plan === "vip") return "VIP Plan";
  return "무료 이용중";
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [selectedPackages, setSelectedPackages] = useState<
    Record<PlanId, PackageId>
  >({
    basic: "1m",
    plus: "1m",
    vip: "1m",
  });
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const safeUser = user as any;

  const currentPlan = useMemo(
    () =>
      normalizeCurrentPlan(
        safeUser?.subscriptionPlan ||
          safeUser?.plan ||
          safeUser?.membership ||
          safeUser?.premiumPlan
      ),
    [
      safeUser?.subscriptionPlan,
      safeUser?.plan,
      safeUser?.membership,
      safeUser?.premiumPlan,
    ]
  );

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  function selectPackage(planId: PlanId, packageId: PackageId) {
    setSelectedPackages((prev) => ({
      ...prev,
      [planId]: packageId,
    }));
  }

  function handleSelectPlan(plan: Plan) {
    const selectedPackage =
      plan.packages.find(
        (packageOption) =>
          packageOption.id === selectedPackages[plan.id]
      ) || plan.packages[1];

    setSelectedPlan(plan.id);

    window.alert(
      `${plan.name} ${selectedPackage.label} 요금제(${selectedPackage.price}) 결제는 insai 앱의 App Store 또는 Google Play 인앱결제로 진행해주세요.`
    );
  }

  function handleCloverPurchase(pack: CloverPack) {
    window.alert(
      `클로버 ${pack.count}개(${pack.price}) 구매는 insai 앱의 인앱결제로 진행해주세요.`
    );
  }

  function handleExchangeItem(itemName: string, cost: number) {
    window.alert(
      `${itemName}은 클로버 ${cost}개로 앱에서 교환할 수 있습니다.`
    );
  }

  async function handleRestorePurchase() {
    try {
      setIsRestoring(true);

      await new Promise((resolve) => setTimeout(resolve, 700));

      window.alert(
        "구매 복원은 insai 앱의 프리미엄 화면에서 진행해주세요."
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
        <section className="overflow-hidden rounded-[36px] bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-950 p-7 text-white shadow-2xl shadow-violet-200 md:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-black backdrop-blur">
              <Zap className="h-4 w-4 text-cyan-300" />
              Upgrade to Insai Premium
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              Basic · Plus · VIP
              <br />
              앱과 동일한 프리미엄 혜택
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
              앱에서 제공 중인 실제 요금제, 기간별 가격, 클로버 상품과
              교환 아이템을 웹에서도 확인할 수 있습니다.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[30px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-sky-500">Current Plan</p>
              <h2 className="mt-2 text-3xl font-black">현재 구독 상태</h2>
              <p className="mt-3 text-slate-500">
                웹 계정과 연결된 앱 구독 정보를 기준으로 표시합니다.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-50 px-6 py-5">
              <p className="text-sm font-black text-slate-400">현재 플랜</p>
              <p className="mt-2 text-2xl font-black">
                {currentPlanLabel(currentPlan)}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 xl:grid-cols-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const selectedPackageId = selectedPackages[plan.id];
            const selectedPackage =
              plan.packages.find(
                (packageOption) =>
                  packageOption.id === selectedPackageId
              ) || plan.packages[1];

            const isCurrent = currentPlan === plan.id;
            const isSelected = selectedPlan === plan.id;

            return (
              <article
                key={plan.id}
                className={`relative flex h-full flex-col rounded-[32px] border p-7 shadow-xl shadow-sky-100 transition hover:-translate-y-1 md:p-8 ${plan.cardClass}`}
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

                <p
                  className={`mt-3 min-h-14 leading-7 ${
                    plan.id === "basic"
                      ? "text-white/60"
                      : "text-slate-500"
                  }`}
                >
                  {plan.subtitle}
                </p>

                <div className="mt-7 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3"
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.id === "basic"
                            ? "bg-white/10"
                            : "bg-emerald-100"
                        }`}
                      >
                        <Check
                          className={`h-3.5 w-3.5 ${
                            plan.id === "basic"
                              ? "text-cyan-300"
                              : "text-emerald-600"
                          }`}
                        />
                      </div>

                      <p
                        className={`text-sm font-bold leading-6 ${
                          plan.id === "basic"
                            ? "text-white/80"
                            : "text-slate-600"
                        }`}
                      >
                        {feature}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 grid grid-cols-3 gap-2">
                  {plan.packages.map((packageOption) => {
                    const active =
                      selectedPackageId === packageOption.id;

                    return (
                      <button
                        key={packageOption.id}
                        type="button"
                        onClick={() =>
                          selectPackage(plan.id, packageOption.id)
                        }
                        className={`relative rounded-2xl border px-2 py-4 text-center transition ${
                          active
                            ? plan.id === "basic"
                              ? "border-cyan-300 bg-white/10"
                              : "border-violet-400 bg-violet-50"
                            : plan.id === "basic"
                              ? "border-white/10 bg-white/5 hover:bg-white/10"
                              : "border-slate-200 bg-white/70 hover:bg-white"
                        }`}
                      >
                        {packageOption.badge && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-2 py-1 text-[9px] font-black text-white">
                            {packageOption.badge}
                          </span>
                        )}

                        <p className="text-xs font-black opacity-60">
                          {packageOption.label}
                        </p>

                        <p className="mt-2 text-sm font-black">
                          {packageOption.price}
                        </p>

                        {packageOption.monthlyCalc && (
                          <p className="mt-1 text-[10px] font-bold opacity-50">
                            {packageOption.monthlyCalc}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-auto pt-8">
                  <div className="mb-4 text-center">
                    <p className="text-sm font-black opacity-50">
                      선택한 상품
                    </p>
                    <p className="mt-1 text-3xl font-black">
                      {selectedPackage.price}
                    </p>
                    <p className="mt-1 text-sm font-bold opacity-50">
                      {selectedPackage.label} 자동 갱신 구독
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent}
                    className={`w-full rounded-2xl px-5 py-4 font-black shadow-lg transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none ${plan.buttonClass}`}
                  >
                    {isCurrent
                      ? "현재 이용중"
                      : isSelected
                        ? "앱에서 결제하기"
                        : `${plan.name} 선택`}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                <Clover className="h-6 w-6 text-emerald-600" />
              </div>

              <div>
                <p className="font-black text-emerald-600">Clover Shop</p>
                <h2 className="mt-1 text-3xl font-black">클로버 충전</h2>
              </div>
            </div>

            <p className="mt-4 leading-8 text-slate-500">
              클로버를 충전해서 프로필 부스터와 슈퍼라이크로 교환할 수
              있습니다.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {CLOVER_PACKS.map((pack) => (
              <button
                key={pack.id}
                type="button"
                onClick={() => handleCloverPurchase(pack)}
                className={`relative rounded-3xl border p-6 text-left transition hover:-translate-y-1 ${
                  pack.highlight
                    ? "border-rose-300 bg-rose-50 ring-2 ring-rose-100"
                    : "border-slate-200 bg-slate-50 hover:bg-white"
                }`}
              >
                {pack.badge && (
                  <span
                    className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[10px] font-black text-white ${
                      pack.highlight ? "bg-rose-500" : "bg-slate-800"
                    }`}
                  >
                    {pack.badge}
                  </span>
                )}

                <p className="text-3xl">🍀</p>
                <p className="mt-4 text-2xl font-black">× {pack.count}</p>
                <p className="mt-2 font-black text-slate-500">
                  {pack.price}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-xl shadow-violet-100 md:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
              <Rocket className="h-6 w-6 text-violet-600" />
            </div>

            <div>
              <p className="font-black text-violet-500">Item Exchange</p>
              <h2 className="mt-1 text-3xl font-black">아이템 교환</h2>
            </div>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <button
              type="button"
              onClick={() => handleExchangeItem("프로필 부스터", 1)}
              className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6 text-left transition hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
                  <Zap className="h-6 w-6 text-violet-600" />
                </div>
                <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">
                  1 🍀
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-black">프로필 부스터</h3>
              <p className="mt-3 leading-7 text-slate-500">
                일정 시간 동안 내 프로필의 노출 기회를 높입니다.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleExchangeItem("슈퍼라이크", 2)}
              className="rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-6 text-left transition hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100">
                  <Star className="h-6 w-6 text-sky-600" />
                </div>
                <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">
                  2 🍀
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-black">슈퍼라이크</h3>
              <p className="mt-3 leading-7 text-slate-500">
                상대방에게 더 강하게 관심을 표현할 수 있습니다.
              </p>
            </button>
          </div>
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
                실제 결제와 복원은 앱에서
              </h2>

              <p className="mt-3 max-w-2xl leading-8 text-slate-500">
                구독과 클로버 결제는 Apple App Store 또는 Google
                Play의 인앱결제로 진행됩니다. 구독은 취소하지 않는 한
                선택한 기간마다 자동 갱신됩니다.
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
              구매 복원 안내
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}
