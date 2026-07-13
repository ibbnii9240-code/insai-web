"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Globe2,
  Home,
  Languages,
  RefreshCw,
  Save,
  Sparkles,
} from "lucide-react";
import {
  getStoredAuthToken,
  useAuth,
} from "@/contexts/AuthContext";

type LanguageCode =
  | "ko"
  | "en"
  | "ja"
  | "zh"
  | "vi"
  | "fr"
  | "de"
  | "es"
  | "ru"
  | "ar";

type LanguageOption = {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
};

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", description: "한국어로 insai를 이용합니다." },
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", description: "Use insai in English." },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", description: "insaiを日本語で利用します。" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", description: "使用中文浏览 insai。" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flag: "🇻🇳", description: "Sử dụng insai bằng tiếng Việt." },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", description: "Utiliser insai en français." },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", description: "insai auf Deutsch verwenden." },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", description: "Usar insai en español." },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", description: "Использовать insai на русском языке." },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", description: "استخدم insai باللغة العربية." },
];

function normalizeLanguage(value?: string | null): LanguageCode {
  const language = String(value || "").toLowerCase();
  if (language.startsWith("en")) return "en";
  if (language.startsWith("ja") || language.startsWith("jp")) return "ja";
  if (language.startsWith("zh") || language.startsWith("cn")) return "zh";
  if (language.startsWith("vi") || language.startsWith("vn")) return "vi";
  if (language.startsWith("fr")) return "fr";
  if (language.startsWith("de")) return "de";
  if (language.startsWith("es")) return "es";
  if (language.startsWith("ru")) return "ru";
  if (language.startsWith("ar")) return "ar";
  return "ko";
}

export default function LanguageSettingsPage() {
  const router = useRouter();
  const { user, isLoading, refreshMe } = useAuth();

  const safeUser = user as any;
  const appUserId = safeUser?.appUserId || safeUser?.appId || "";

  const currentLanguage = useMemo(
    () =>
      normalizeLanguage(
        safeUser?.language ||
          safeUser?.appLanguage ||
          safeUser?.preferredLanguage ||
          safeUser?.locale
      ),
    [
      safeUser?.language,
      safeUser?.appLanguage,
      safeUser?.preferredLanguage,
      safeUser?.locale,
    ]
  );

  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageCode>("ko");
  const [savedLanguage, setSavedLanguage] =
    useState<LanguageCode>("ko");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
    setSavedLanguage(currentLanguage);
  }, [currentLanguage]);

  const hasChanges = selectedLanguage !== savedLanguage;
  const selectedOption =
    LANGUAGE_OPTIONS.find((item) => item.code === selectedLanguage) ||
    LANGUAGE_OPTIONS[0];

  async function handleSave() {
    if (!appUserId) {
      setMessage("앱 계정 연결 정보가 없습니다.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");

      const token = getStoredAuthToken();

      const response = await fetch("/api/settings/language", {
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
          language: selectedLanguage,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "언어 설정을 저장하지 못했습니다."
        );
      }

      setSavedLanguage(selectedLanguage);
      setMessage(
        `${selectedOption.nativeName}로 언어 설정이 저장되었습니다.`
      );

      await refreshMe();
    } catch (error) {
      console.error("Language save error:", error);
      setMessage(
        error instanceof Error
          ? error.message
          : "언어 설정 저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FBFF]">
        <RefreshCw className="h-9 w-9 animate-spin text-violet-400" />
      </main>
    );
  }

  return (
    <main
      dir={selectedLanguage === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-[#F8FBFF] text-slate-900"
    >
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6 md:py-5">
          <Link href="/mypage" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-violet-100">
              <Globe2 className="h-5 w-5 text-cyan-500" />
            </div>

            <div>
              <p className="text-sm font-black text-cyan-500">
                Language Settings
              </p>
              <p className="text-xl font-black">언어 설정</p>
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
        <section className="overflow-hidden rounded-[36px] bg-gradient-to-br from-cyan-500 via-sky-500 to-violet-500 p-7 text-white shadow-2xl shadow-sky-200 md:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Global Language
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              앱과 웹에서 사용할
              <br />
              언어를 선택하세요
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
              선택한 언어는 웹 계정과 연결된 insai 앱 계정에 함께
              저장됩니다.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-cyan-500">Current Language</p>
              <h2 className="mt-2 text-3xl font-black">현재 선택 언어</h2>
              <p className="mt-3 text-slate-500">
                앱 알림과 번역 기준 언어에도 사용됩니다.
              </p>
            </div>

            <div className="flex items-center gap-4 rounded-3xl bg-slate-50 px-6 py-5">
              <span className="text-4xl">{selectedOption.flag}</span>
              <div>
                <p className="text-sm font-black text-slate-400">
                  Selected
                </p>
                <p className="mt-1 text-2xl font-black">
                  {selectedOption.nativeName}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2">
          {LANGUAGE_OPTIONS.map((option) => {
            const isSelected = selectedLanguage === option.code;

            return (
              <button
                key={option.code}
                type="button"
                onClick={() => {
                  setSelectedLanguage(option.code);
                  setMessage("");
                }}
                className={`flex items-center gap-5 rounded-[28px] border p-6 text-left shadow-lg transition hover:-translate-y-1 ${
                  isSelected
                    ? "border-violet-300 bg-gradient-to-r from-sky-50 to-violet-50 ring-2 ring-violet-200 shadow-violet-100"
                    : "border-transparent bg-white shadow-sky-100 hover:border-sky-100"
                }`}
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">
                  {option.flag}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black">
                      {option.nativeName}
                    </h3>

                    {isSelected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500 px-3 py-1 text-xs font-black text-white">
                        <Check className="h-3.5 w-3.5" />
                        선택됨
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm font-bold text-slate-400">
                    {option.name}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </section>

        <section className="sticky bottom-5 z-40 mt-8 rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-2xl shadow-violet-200 backdrop-blur-xl md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-100">
                <Languages className="h-5 w-5 text-cyan-600" />
              </div>

              <div>
                <p className="font-black">
                  {selectedOption.flag} {selectedOption.nativeName}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-400">
                  {hasChanges
                    ? "변경사항이 아직 저장되지 않았습니다."
                    : "현재 설정이 저장되어 있습니다."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-7 py-4 font-black text-white shadow-lg shadow-violet-200 transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              {isSaving ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              언어 저장
            </button>
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