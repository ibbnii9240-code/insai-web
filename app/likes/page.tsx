"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Flame,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type LikesTab = "RECEIVED" | "MATCHES" | "TOP";

type DatingUser = {
  id: string;
  username?: string;
  name?: string;
  avatar?: string;
  datingAvatar?: string;
  age?: number | null;
  location?: string | null;
  bio?: string | null;
  datingBio?: string | null;
  country?: string | null;
  countryCode?: string | null;
  isVerified?: boolean;
  action?: "LIKE" | "SUPER_LIKE";
  isSuperLike?: boolean;
  likedAt?: string;
};

type MatchItem = {
  id: string;
  partnerId: string;
  name?: string;
  avatar?: string;
  lastMessage?: string | null;
  time?: string;
  unread?: number;
  isNew?: boolean;
};

function displayName(user: DatingUser) {
  return user.username || user.name || "insai 사용자";
}

function avatarUrl(user: DatingUser) {
  return user.datingAvatar || user.avatar || "";
}

function formatDate(value?: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });
}

export default function LikesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const safeUser = user as any;
  const appUserId = safeUser?.appUserId || safeUser?.appId || "";

  const [activeTab, setActiveTab] = useState<LikesTab>("RECEIVED");
  const [receivedLikes, setReceivedLikes] = useState<DatingUser[]>([]);
  const [topUsers, setTopUsers] = useState<DatingUser[]>([]);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  async function fetchData() {
    if (!appUserId) {
      setErrorMessage("앱 계정 연결 정보가 없습니다.");
      setIsFetching(false);
      return;
    }

    try {
      setIsFetching(true);
      setErrorMessage("");

      const response = await fetch(
        `/api/likes?appUserId=${encodeURIComponent(appUserId)}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "좋아요/매칭 정보를 불러오지 못했습니다."
        );
      }

      setReceivedLikes(
        Array.isArray(result.receivedLikes) ? result.receivedLikes : []
      );
      setTopUsers(Array.isArray(result.topUsers) ? result.topUsers : []);
      setMatches(Array.isArray(result.matches) ? result.matches : []);
    } catch (error) {
      console.error("Likes page fetch error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "좋아요/매칭 정보를 불러오지 못했습니다."
      );
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    if (!isLoading && user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user, appUserId]);

  async function handleSwipe(
    targetId: string,
    action: "LIKE" | "PASS" | "SUPER_LIKE"
  ) {
    if (!appUserId || isUpdating) return;

    try {
      setIsUpdating(true);

      const response = await fetch("/api/likes/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appUserId,
          targetId,
          action,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "처리에 실패했습니다.");
      }

      setReceivedLikes((prev) =>
        prev.filter((item) => item.id !== targetId)
      );

      if (result.matched) {
        window.alert("매칭되었습니다! 앱에서 대화를 시작해보세요.");
        await fetchData();
        setActiveTab("MATCHES");
      }
    } catch (error) {
      console.error("Swipe action error:", error);
      window.alert(
        error instanceof Error ? error.message : "처리에 실패했습니다."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  const filteredReceived = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    if (!query) return receivedLikes;

    return receivedLikes.filter((item) =>
      [
        item.username,
        item.name,
        item.location,
        item.country,
        item.countryCode,
        item.bio,
        item.datingBio,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [receivedLikes, keyword]);

  const filteredMatches = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    if (!query) return matches;

    return matches.filter((item) =>
      [item.name, item.lastMessage, item.partnerId]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [matches, keyword]);

  const filteredTop = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    if (!query) return topUsers;

    return topUsers.filter((item) =>
      [
        item.username,
        item.name,
        item.location,
        item.country,
        item.countryCode,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [topUsers, keyword]);

  if (isLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FBFF]">
        <RefreshCw className="h-9 w-9 animate-spin text-violet-400" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6 md:py-5">
          <Link href="/mypage" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100">
              <Heart className="h-5 w-5 text-pink-500" />
            </div>

            <div>
              <p className="text-sm font-black text-pink-500">
                Likes & Matches
              </p>
              <p className="text-xl font-black">좋아요 / 매칭</p>
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
        <section className="overflow-hidden rounded-[36px] bg-gradient-to-br from-pink-500 via-violet-500 to-sky-500 p-7 text-white shadow-2xl shadow-violet-200 md:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Dating Connections
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              받은 좋아요와
              <br />
              새로운 매칭 확인
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
              앱의 받은 좋아요, 실시간 TOP 20, 소개팅 매칭 데이터를 웹에서도
              확인할 수 있습니다.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setActiveTab("RECEIVED")}
              className={`rounded-3xl p-5 text-left transition ${
                activeTab === "RECEIVED"
                  ? "bg-pink-500 text-white shadow-lg shadow-pink-200"
                  : "bg-slate-50"
              }`}
            >
              <Heart className="h-6 w-6" />
              <p className="mt-3 text-sm font-black opacity-70">받은 좋아요</p>
              <p className="mt-1 text-3xl font-black">
                {receivedLikes.length}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("MATCHES")}
              className={`rounded-3xl p-5 text-left transition ${
                activeTab === "MATCHES"
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-200"
                  : "bg-slate-50"
              }`}
            >
              <Users className="h-6 w-6" />
              <p className="mt-3 text-sm font-black opacity-70">매칭</p>
              <p className="mt-1 text-3xl font-black">{matches.length}</p>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("TOP")}
              className={`rounded-3xl p-5 text-left transition ${
                activeTab === "TOP"
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                  : "bg-slate-50"
              }`}
            >
              <Flame className="h-6 w-6" />
              <p className="mt-3 text-sm font-black opacity-70">
                실시간 TOP 20
              </p>
              <p className="mt-1 text-3xl font-black">{topUsers.length}</p>
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="닉네임, 위치, 국가 검색"
                className="w-full rounded-2xl border border-slate-200 py-4 pl-12 pr-5 font-bold outline-none focus:border-violet-400"
              />
            </div>

            <button
              type="button"
              onClick={fetchData}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 font-black text-white disabled:opacity-50"
            >
              <RefreshCw
                className={`h-5 w-5 ${
                  isFetching ? "animate-spin" : ""
                }`}
              />
              새로고침
            </button>
          </div>
        </section>

        {errorMessage && (
          <div className="mt-6 rounded-3xl bg-rose-50 p-6 text-center font-black text-rose-600">
            {errorMessage}
          </div>
        )}

        <section className="mt-8">
          {isFetching ? (
            <div className="rounded-[32px] bg-white p-14 text-center shadow-xl shadow-sky-100">
              <RefreshCw className="mx-auto h-10 w-10 animate-spin text-violet-400" />
              <p className="mt-5 font-black text-slate-500">
                데이터를 불러오는 중입니다.
              </p>
            </div>
          ) : activeTab === "MATCHES" ? (
            filteredMatches.length === 0 ? (
              <EmptyState
                icon={Users}
                title="아직 매칭이 없습니다."
                description="서로 좋아요를 누르면 이곳에 매칭으로 표시됩니다."
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {filteredMatches.map((match) => (
                  <article
                    key={match.id}
                    className="rounded-[30px] bg-white p-6 shadow-lg shadow-sky-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 to-violet-100">
                        {match.avatar ? (
                          <img
                            src={match.avatar}
                            alt={match.name || "매칭 상대"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound className="h-9 w-9 text-violet-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h2 className="truncate text-2xl font-black">
                            {match.name || "매칭 상대"}
                          </h2>
                          {match.isNew && (
                            <span className="rounded-full bg-pink-50 px-2 py-1 text-[10px] font-black text-pink-500">
                              NEW
                            </span>
                          )}
                        </div>

                        <p className="mt-2 line-clamp-1 text-sm font-bold text-slate-500">
                          {match.lastMessage || "새로운 매칭입니다. 먼저 인사해보세요!"}
                        </p>

                        <p className="mt-2 text-xs font-bold text-slate-400">
                          {formatDate(match.time)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <Link
                        href={`/user/${match.partnerId}`}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black"
                      >
                        프로필 보기
                      </Link>

                      <a
                        href={`insai://dating-chat/${match.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-3 text-sm font-black text-white"
                      >
                        <MessageCircle className="h-4 w-4" />
                        앱에서 대화
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : (
            <UserGrid
              users={
                activeTab === "RECEIVED"
                  ? filteredReceived
                  : filteredTop
              }
              mode={activeTab}
              isUpdating={isUpdating}
              onLike={(id) => handleSwipe(id, "LIKE")}
              onPass={(id) => handleSwipe(id, "PASS")}
              onSuperLike={(id) => handleSwipe(id, "SUPER_LIKE")}
            />
          )}
        </section>
      </section>
    </main>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Users;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[32px] bg-white p-14 text-center shadow-xl shadow-sky-100">
      <Icon className="mx-auto h-14 w-14 text-slate-200" />
      <h2 className="mt-5 text-3xl font-black">{title}</h2>
      <p className="mt-3 leading-8 text-slate-500">{description}</p>
    </div>
  );
}

function UserGrid({
  users,
  mode,
  isUpdating,
  onLike,
  onPass,
  onSuperLike,
}: {
  users: DatingUser[];
  mode: "RECEIVED" | "TOP";
  isUpdating: boolean;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  onSuperLike: (id: string) => void;
}) {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={mode === "RECEIVED" ? Heart : Flame}
        title={
          mode === "RECEIVED"
            ? "아직 받은 좋아요가 없습니다."
            : "표시할 TOP 유저가 없습니다."
        }
        description={
          mode === "RECEIVED"
            ? "새로운 좋아요가 도착하면 이곳에 표시됩니다."
            : "조건에 맞는 인기 유저가 나타나면 이곳에 표시됩니다."
        }
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {users.map((item, index) => {
        const image = avatarUrl(item);
        const isSuperLike =
          item.action === "SUPER_LIKE" || item.isSuperLike;

        return (
          <article
            key={item.id}
            className="overflow-hidden rounded-[30px] bg-white shadow-lg shadow-sky-100 transition hover:-translate-y-1 hover:shadow-xl"
          >
            <Link
              href={`/user/${item.id}`}
              className="relative block aspect-[4/5] bg-slate-100"
            >
              {image ? (
                <img
                  src={image}
                  alt={displayName(item)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <UserRound className="h-16 w-16 text-slate-300" />
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 text-white">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-2xl font-black">
                    {displayName(item)}
                    {item.age ? `, ${item.age}` : ""}
                  </h2>

                  {item.isVerified && (
                    <BadgeCheck className="h-5 w-5 shrink-0 text-sky-300" />
                  )}
                </div>

                <p className="mt-2 flex items-center gap-1 text-sm font-bold text-white/80">
                  <MapPin className="h-4 w-4" />
                  {item.location || item.countryCode || "GLOBAL"}
                </p>
              </div>

              {mode === "TOP" && (
                <span className="absolute left-4 top-4 rounded-full bg-slate-950/80 px-3 py-2 text-sm font-black text-white backdrop-blur">
                  #{index + 1}
                </span>
              )}

              {isSuperLike && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-2 text-xs font-black text-white">
                  <Star className="h-4 w-4" />
                  SUPER
                </span>
              )}
            </Link>

            <div className="p-4">
              {mode === "RECEIVED" ? (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => onPass(item.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 font-black text-slate-600 disabled:opacity-50"
                  >
                    <X className="h-5 w-5" />
                    패스
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => onLike(item.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-4 py-3 font-black text-white disabled:opacity-50"
                  >
                    <Heart className="h-5 w-5" />
                    좋아요
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => onSuperLike(item.id)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3 font-black text-white disabled:opacity-50"
                >
                  <Star className="h-5 w-5" />
                  슈퍼라이크
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}