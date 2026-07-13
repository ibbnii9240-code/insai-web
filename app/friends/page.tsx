"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Globe2,
  Home,
  RefreshCw,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type FriendItem = {
  id: string;
  username?: string;
  name?: string;
  avatar?: string;
  bio?: string;
};

function getDisplayName(friend: FriendItem) {
  return friend.username || friend.name || "insai 사용자";
}

function getSafeAvatar(value?: string) {
  if (!value || value === "null" || value === "undefined") {
    return "";
  }

  return value.replace(/["'\[\]]/g, "").trim();
}

export default function FriendsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const safeUser = user as any;
  const appUserId = safeUser?.appUserId || safeUser?.appId || "";

  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  async function fetchFriends() {
    if (!appUserId) {
      setFriends([]);
      setErrorMessage("앱 계정 연결 정보가 없습니다.");
      setIsFetching(false);
      return;
    }

    try {
      setIsFetching(true);
      setErrorMessage("");

      const response = await fetch(
        `/api/friends?appUserId=${encodeURIComponent(appUserId)}`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "친구 목록을 불러오지 못했습니다."
        );
      }

      setFriends(Array.isArray(result.friends) ? result.friends : []);
    } catch (error) {
      console.error("Friends fetch error:", error);
      setFriends([]);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "친구 목록을 불러오지 못했습니다."
      );
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    if (!isLoading && user) {
      fetchFriends();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user, appUserId]);

  const filteredFriends = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    if (!query) {
      return friends;
    }

    return friends.filter((friend) => {
      const searchable = [
        friend.username,
        friend.name,
        friend.bio,
        friend.id,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [friends, keyword]);

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
              <Users className="h-5 w-5 text-blue-500" />
            </div>

            <div>
              <p className="text-sm font-black text-blue-500">Friends</p>
              <p className="text-xl font-black">친구 목록</p>
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
        <section className="overflow-hidden rounded-[36px] bg-gradient-to-br from-blue-500 via-sky-500 to-violet-500 p-7 text-white shadow-2xl shadow-sky-200 md:p-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
              <Globe2 className="h-4 w-4" />
              Mutual Friends
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
              서로 팔로우한
              <br />
              insai 친구들
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-white/85 md:text-lg">
              앱에서 서로 팔로우 중인 사용자만 친구 목록에 표시됩니다.
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-blue-500">Friend Count</p>
              <h2 className="mt-2 text-3xl font-black">
                친구 {friends.length}명
              </h2>
              <p className="mt-3 text-slate-500">
                앱 계정의 맞팔 관계를 기준으로 불러옵니다.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchFriends}
              disabled={isFetching}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-5 w-5 ${
                  isFetching ? "animate-spin" : ""
                }`}
              />
              새로고침
            </button>
          </div>

          <div className="relative mt-7">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="닉네임, 이름, 소개글 검색"
              className="w-full rounded-2xl border border-slate-200 py-4 pl-12 pr-5 font-bold outline-none transition focus:border-violet-400"
            />
          </div>
        </section>

        {errorMessage && (
          <section className="mt-6 rounded-3xl bg-rose-50 p-6 text-center">
            <p className="font-black text-rose-600">{errorMessage}</p>
          </section>
        )}

        <section className="mt-8">
          {isFetching ? (
            <div className="rounded-[32px] bg-white p-14 text-center shadow-xl shadow-sky-100">
              <RefreshCw className="mx-auto h-10 w-10 animate-spin text-violet-400" />
              <p className="mt-5 font-black text-slate-500">
                친구 목록을 불러오는 중입니다.
              </p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="rounded-[32px] bg-white p-14 text-center shadow-xl shadow-sky-100">
              <Users className="mx-auto h-14 w-14 text-slate-200" />
              <h2 className="mt-5 text-3xl font-black">
                표시할 친구가 없습니다.
              </h2>
              <p className="mt-3 leading-8 text-slate-500">
                앱에서 서로 팔로우하면 이곳에 친구로 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredFriends.map((friend) => {
                const avatar = getSafeAvatar(friend.avatar);

                return (
                  <article
                    key={friend.id}
                    className="rounded-[30px] bg-white p-6 shadow-lg shadow-sky-100 transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 to-violet-100">
                        {avatar ? (
                          <Image
                            src={avatar}
                            alt={getDisplayName(friend)}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound className="h-9 w-9 text-violet-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-2xl font-black">
                          {getDisplayName(friend)}
                        </h3>

                        {friend.name &&
                          friend.name !== friend.username && (
                            <p className="mt-1 truncate text-sm font-bold text-slate-400">
                              {friend.name}
                            </p>
                          )}

                        <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
                          맞팔 친구
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 min-h-20 rounded-2xl bg-slate-50 p-4">
                      <p className="line-clamp-3 text-sm font-bold leading-6 text-slate-500">
                        {friend.bio || "등록된 소개글이 없습니다."}
                      </p>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <a
                        href={`insai://user/${friend.id}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 py-3 text-sm font-black text-white"
                      >
                        앱에서 보기
                      </a>

                      <Link
                        href={`/user/${friend.id}`}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                      >
                        웹 프로필
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
