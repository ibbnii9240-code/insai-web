"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Bell,
  BellOff,
  CheckCircle2,
  Heart,
  Home,
  Mail,
  Megaphone,
  MessageCircle,
  RefreshCw,
  Save,
  ShieldAlert,
  Sparkles,
  UserPlus,
  Users,
} from "lucide-react";
import {
  getStoredAuthToken,
  useAuth,
} from "@/contexts/AuthContext";

type NotificationSettings = {
  allNotifications: boolean;

  communityEnabled: boolean;
  follow: boolean;
  postLike: boolean;
  comment: boolean;
  communityMessage: boolean;
  friendRequest: boolean;

  datingEnabled: boolean;
  match: boolean;
  datingMessage: boolean;
  datingLike: boolean;

  supportEnabled: boolean;
  inquiryReply: boolean;
  reportResult: boolean;

  marketing: boolean;
};

const DEFAULT_SETTINGS: NotificationSettings = {
  allNotifications: true,

  communityEnabled: true,
  follow: true,
  postLike: true,
  comment: true,
  communityMessage: true,
  friendRequest: true,

  datingEnabled: true,
  match: true,
  datingMessage: true,
  datingLike: true,

  supportEnabled: true,
  inquiryReply: true,
  reportResult: true,

  marketing: false,
};

type ToggleRowProps = {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  icon: typeof Bell;
  iconClass: string;
  onChange: (checked: boolean) => void;
};

function ToggleRow({
  title,
  description,
  checked,
  disabled = false,
  icon: Icon,
  iconClass,
  onChange,
}: ToggleRowProps) {
  return (
    <div
      className={`flex items-center justify-between gap-5 rounded-3xl border p-5 transition ${
        disabled
          ? "border-slate-100 bg-slate-50 opacity-55"
          : checked
            ? "border-violet-100 bg-gradient-to-r from-white to-violet-50"
            : "border-slate-100 bg-white"
      }`}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50">
          <Icon className={`h-6 w-6 ${iconClass}`} />
        </div>

        <div className="min-w-0">
          <h3 className="font-black text-slate-900">{title}</h3>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition ${
          checked ? "bg-violet-500" : "bg-slate-200"
        } disabled:cursor-not-allowed`}
      >
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition ${
            checked ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="font-black text-violet-500">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-black">{title}</h2>
      <p className="mt-3 leading-7 text-slate-500">{description}</p>
    </div>
  );
}

export default function NotificationSettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const safeUser = user as any;
  const appUserId = safeUser?.appUserId || safeUser?.appId || "";

  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  async function fetchSettings() {
    try {
      setIsFetching(true);
      setMessage("");

      const token = getStoredAuthToken();

      const response = await fetch("/api/settings/notifications", {
        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "알림 설정을 불러오지 못했습니다."
        );
      }

      const nextSettings = {
        ...DEFAULT_SETTINGS,
        ...(result.settings || {}),
      };

      setSettings(nextSettings);
      setSavedSettings(nextSettings);
    } catch (error) {
      console.error("Notification settings fetch error:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "알림 설정을 불러오지 못했습니다."
      );
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    if (!isLoading && user) {
      fetchSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user]);

  const hasChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSettings),
    [settings, savedSettings]
  );

  const enabledCount = useMemo(() => {
    return Object.entries(settings).filter(
      ([key, value]) =>
        key !== "allNotifications" &&
        key !== "communityEnabled" &&
        key !== "datingEnabled" &&
        key !== "supportEnabled" &&
        value === true
    ).length;
  }, [settings]);

  function updateSetting<K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) {
    setMessage("");

    setSettings((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };

      if (key === "allNotifications") {
        const enabled = Boolean(value);

        return {
          ...next,
          communityEnabled: enabled,
          follow: enabled,
          postLike: enabled,
          comment: enabled,
          communityMessage: enabled,
          friendRequest: enabled,

          datingEnabled: enabled,
          match: enabled,
          datingMessage: enabled,
          datingLike: enabled,

          supportEnabled: enabled,
          inquiryReply: enabled,
          reportResult: enabled,
        };
      }

      if (key === "communityEnabled") {
        const enabled = Boolean(value);

        return {
          ...next,
          follow: enabled,
          postLike: enabled,
          comment: enabled,
          communityMessage: enabled,
          friendRequest: enabled,
        };
      }

      if (key === "datingEnabled") {
        const enabled = Boolean(value);

        return {
          ...next,
          match: enabled,
          datingMessage: enabled,
          datingLike: enabled,
        };
      }

      if (key === "supportEnabled") {
        const enabled = Boolean(value);

        return {
          ...next,
          inquiryReply: enabled,
          reportResult: enabled,
        };
      }

      const serviceKeys: Array<keyof NotificationSettings> = [
        "follow",
        "postLike",
        "comment",
        "communityMessage",
        "friendRequest",
        "match",
        "datingMessage",
        "datingLike",
        "inquiryReply",
        "reportResult",
      ];

      if (serviceKeys.includes(key)) {
        const anyEnabled = serviceKeys.some((itemKey) =>
          itemKey === key ? Boolean(value) : Boolean(next[itemKey])
        );

        next.allNotifications = anyEnabled;
      }

      return next;
    });
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      setMessage("");

      const token = getStoredAuthToken();

      const response = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
        body: JSON.stringify({
          appUserId,
          settings,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "알림 설정을 저장하지 못했습니다."
        );
      }

      const nextSettings = {
        ...DEFAULT_SETTINGS,
        ...(result.settings || settings),
      };

      setSettings(nextSettings);
      setSavedSettings(nextSettings);
      setMessage("알림 설정이 저장되었습니다.");
    } catch (error) {
      console.error("Notification settings save error:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "알림 설정 저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !user || isFetching) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FBFF]">
        <RefreshCw className="h-9 w-9 animate-spin text-violet-400" />
      </main>
    );
  }

  const serviceDisabled = !settings.allNotifications;

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6 md:py-5">
          <Link href="/mypage" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-violet-100">
              <Bell className="h-5 w-5 text-amber-500" />
            </div>

            <div>
              <p className="text-sm font-black text-amber-500">
                Notification Settings
              </p>
              <p className="text-xl font-black">알림 설정</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/mypage"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">마이페이지</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black shadow-sm"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">홈으로</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-6 md:py-14">
        <section className="overflow-hidden rounded-[36px] bg-gradient-to-br from-amber-400 via-pink-500 to-violet-600 p-7 text-white shadow-2xl shadow-violet-200 md:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Push & Service Alerts
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              필요한 소식만
              <br />
              원하는 방식으로 받기
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
              앱 알림 화면에서 사용하는 커뮤니티·소개팅 알림 종류를
              기준으로 설정할 수 있습니다.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-amber-500">Master Control</p>
              <h2 className="mt-2 text-3xl font-black">전체 알림</h2>
              <p className="mt-3 leading-7 text-slate-500">
                모든 서비스 알림을 한 번에 켜거나 끕니다.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-3xl bg-slate-50 px-6 py-5">
              {settings.allNotifications ? (
                <Bell className="h-8 w-8 text-violet-500" />
              ) : (
                <BellOff className="h-8 w-8 text-slate-400" />
              )}

              <div>
                <p className="text-sm font-black text-slate-400">
                  현재 상태
                </p>
                <p className="mt-1 text-2xl font-black">
                  {settings.allNotifications ? "알림 사용" : "알림 끔"}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={settings.allNotifications}
                onClick={() =>
                  updateSetting(
                    "allNotifications",
                    !settings.allNotifications
                  )
                }
                className={`relative ml-2 h-9 w-16 rounded-full transition ${
                  settings.allNotifications
                    ? "bg-violet-500"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1.5 h-6 w-6 rounded-full bg-white shadow-sm transition ${
                    settings.allNotifications ? "left-8" : "left-1.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
            <SectionHeader
              eyebrow="Community"
              title="커뮤니티 알림"
              description="팔로우, 게시물 반응, 커뮤니티 메시지와 친구 요청 알림입니다."
            />

            <div className="mt-6 space-y-4">
              <ToggleRow
                title="커뮤니티 알림 전체"
                description="커뮤니티 관련 알림을 한 번에 설정합니다."
                checked={settings.communityEnabled}
                disabled={serviceDisabled}
                icon={Users}
                iconClass="text-sky-500"
                onChange={(value) =>
                  updateSetting("communityEnabled", value)
                }
              />

              <ToggleRow
                title="새 팔로우"
                description="다른 사용자가 나를 팔로우했을 때 알림을 받습니다."
                checked={settings.follow}
                disabled={
                  serviceDisabled || !settings.communityEnabled
                }
                icon={UserPlus}
                iconClass="text-cyan-500"
                onChange={(value) => updateSetting("follow", value)}
              />

              <ToggleRow
                title="게시물 좋아요"
                description="내 게시물에 새로운 좋아요가 등록됐을 때 알림을 받습니다."
                checked={settings.postLike}
                disabled={
                  serviceDisabled || !settings.communityEnabled
                }
                icon={Heart}
                iconClass="text-rose-500"
                onChange={(value) => updateSetting("postLike", value)}
              />

              <ToggleRow
                title="새 댓글"
                description="내 게시물에 댓글이 작성됐을 때 알림을 받습니다."
                checked={settings.comment}
                disabled={
                  serviceDisabled || !settings.communityEnabled
                }
                icon={MessageCircle}
                iconClass="text-violet-500"
                onChange={(value) => updateSetting("comment", value)}
              />

              <ToggleRow
                title="커뮤니티 메시지"
                description="커뮤니티 채팅과 DM 메시지 알림을 받습니다."
                checked={settings.communityMessage}
                disabled={
                  serviceDisabled || !settings.communityEnabled
                }
                icon={Mail}
                iconClass="text-sky-500"
                onChange={(value) =>
                  updateSetting("communityMessage", value)
                }
              />

              <ToggleRow
                title="친구 요청"
                description="새로운 친구 요청과 대화 신청 알림을 받습니다."
                checked={settings.friendRequest}
                disabled={
                  serviceDisabled || !settings.communityEnabled
                }
                icon={UserPlus}
                iconClass="text-fuchsia-500"
                onChange={(value) =>
                  updateSetting("friendRequest", value)
                }
              />
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-violet-100 md:p-8">
            <SectionHeader
              eyebrow="Dating"
              title="소개팅 알림"
              description="좋아요, 새로운 매칭과 소개팅 채팅 알림입니다."
            />

            <div className="mt-6 space-y-4">
              <ToggleRow
                title="소개팅 알림 전체"
                description="소개팅 관련 알림을 한 번에 설정합니다."
                checked={settings.datingEnabled}
                disabled={serviceDisabled}
                icon={Heart}
                iconClass="text-pink-500"
                onChange={(value) =>
                  updateSetting("datingEnabled", value)
                }
              />

              <ToggleRow
                title="받은 좋아요"
                description="새로운 좋아요와 슈퍼라이크가 도착했을 때 알림을 받습니다."
                checked={settings.datingLike}
                disabled={serviceDisabled || !settings.datingEnabled}
                icon={Heart}
                iconClass="text-rose-500"
                onChange={(value) =>
                  updateSetting("datingLike", value)
                }
              />

              <ToggleRow
                title="새로운 매칭"
                description="서로 좋아요를 눌러 매칭됐을 때 알림을 받습니다."
                checked={settings.match}
                disabled={serviceDisabled || !settings.datingEnabled}
                icon={Users}
                iconClass="text-violet-500"
                onChange={(value) => updateSetting("match", value)}
              />

              <ToggleRow
                title="소개팅 메시지"
                description="매칭 상대가 새 메시지를 보냈을 때 알림을 받습니다."
                checked={settings.datingMessage}
                disabled={serviceDisabled || !settings.datingEnabled}
                icon={MessageCircle}
                iconClass="text-pink-500"
                onChange={(value) =>
                  updateSetting("datingMessage", value)
                }
              />
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-emerald-100 md:p-8">
            <SectionHeader
              eyebrow="Support"
              title="고객지원 알림"
              description="문의 답변과 신고 처리 결과를 알려드립니다."
            />

            <div className="mt-6 space-y-4">
              <ToggleRow
                title="고객지원 알림 전체"
                description="문의와 신고 처리 관련 알림을 한 번에 설정합니다."
                checked={settings.supportEnabled}
                disabled={serviceDisabled}
                icon={CheckCircle2}
                iconClass="text-emerald-500"
                onChange={(value) =>
                  updateSetting("supportEnabled", value)
                }
              />

              <ToggleRow
                title="문의 답변"
                description="운영팀이 문의에 답변했을 때 알림을 받습니다."
                checked={settings.inquiryReply}
                disabled={serviceDisabled || !settings.supportEnabled}
                icon={Mail}
                iconClass="text-emerald-500"
                onChange={(value) =>
                  updateSetting("inquiryReply", value)
                }
              />

              <ToggleRow
                title="신고 처리 결과"
                description="내가 접수한 신고의 상태가 변경됐을 때 알림을 받습니다."
                checked={settings.reportResult}
                disabled={serviceDisabled || !settings.supportEnabled}
                icon={ShieldAlert}
                iconClass="text-rose-500"
                onChange={(value) =>
                  updateSetting("reportResult", value)
                }
              />
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-amber-100 md:p-8">
            <SectionHeader
              eyebrow="Marketing"
              title="혜택과 소식"
              description="이벤트, 신규 기능과 프로모션 안내입니다."
            />

            <div className="mt-6 space-y-4">
              <ToggleRow
                title="마케팅 알림"
                description="이벤트, 할인 혜택과 새로운 기능 소식을 받습니다."
                checked={settings.marketing}
                icon={Megaphone}
                iconClass="text-amber-500"
                onChange={(value) => updateSetting("marketing", value)}
              />
            </div>

            <div className="mt-5 rounded-3xl bg-amber-50 p-5">
              <p className="text-sm font-bold leading-7 text-amber-700">
                기기의 푸시 알림 권한 자체가 꺼져 있으면 이 설정을
                켜도 알림이 표시되지 않습니다. iPhone 또는 Android
                설정에서도 insai 알림 권한을 확인해주세요.
              </p>
            </div>
          </section>
        </div>

        <section className="sticky bottom-5 z-40 mt-8 rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-2xl shadow-violet-200 backdrop-blur-xl md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black">
                현재 개별 알림 {enabledCount}개 사용 중
              </p>
              <p className="mt-1 text-sm font-bold text-slate-400">
                {hasChanges
                  ? "변경사항이 아직 저장되지 않았습니다."
                  : "현재 설정이 저장되어 있습니다."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={fetchSettings}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black text-slate-600"
              >
                <RefreshCw className="h-5 w-5" />
                되돌리기
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-violet-500 px-7 py-4 font-black text-white shadow-lg shadow-violet-200 transition disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {isSaving ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                설정 저장
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`mt-4 rounded-2xl px-5 py-4 text-sm font-black ${
                message.includes("저장되었습니다")
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {message}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}