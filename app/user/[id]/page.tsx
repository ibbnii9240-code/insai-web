"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Globe2,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type AppUserProfile = {
  id: string;
  username?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
  country?: string;
  countryCode?: string;
  language?: string;
  age?: number | null;
  gender?: string | null;
  location?: string | null;
  mbti?: string | null;
  interests?: string[];
  vibes?: string[];
  styles?: string[];
  followerCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
  createdAt?: string;
  posts?: Array<{
    id: string;
    text?: string;
    image?: string;
    createdAt?: string;
    _count?: {
      likes?: number;
      comments?: number;
    };
  }>;
};

function normalizeArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item || "").trim()).filter(Boolean);
    }
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeMedia(value?: string) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item || "").trim()).filter(Boolean);
    }
  } catch {
    return [value];
  }

  return [value];
}

function displayName(profile: AppUserProfile) {
  return profile.username || profile.name || "insai 사용자";
}

function countryLabel(profile: AppUserProfile) {
  return profile.countryCode || profile.country || "GLOBAL";
}

export default function WebUserProfilePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();

  const profileId = String(params?.id || "");
  const safeUser = user as any;
  const myAppUserId = safeUser?.appUserId || safeUser?.appId || "";

  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isFollowUpdating, setIsFollowUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  async function fetchProfile() {
    if (!profileId) return;

    try {
      setIsFetching(true);
      setErrorMessage("");

      const query = myAppUserId
        ? `?myId=${encodeURIComponent(myAppUserId)}`
        : "";

      const response = await fetch(
        `/api/app-users/${encodeURIComponent(profileId)}${query}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "프로필을 불러오지 못했습니다."
        );
      }

      setProfile(result.user);
    } catch (error) {
      console.error("Profile fetch error:", error);
      setProfile(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "프로필을 불러오지 못했습니다."
      );
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    if (!isLoading && user && profileId) {
      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user, profileId, myAppUserId]);

  async function toggleFollow() {
    if (!profile || !myAppUserId || profile.id === myAppUserId) return;

    try {
      setIsFollowUpdating(true);

      const response = await fetch(
        `/api/app-users/${encodeURIComponent(profile.id)}/follow`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ myId: myAppUserId }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "팔로우 처리에 실패했습니다.");
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              isFollowing: Boolean(result.isFollowing),
              followerCount:
                typeof result.followerCount === "number"
                  ? result.followerCount
                  : Math.max(
                      0,
                      (prev.followerCount || 0) +
                        (result.isFollowing ? 1 : -1)
                    ),
            }
          : prev
      );
    } catch (error) {
      console.error("Follow update error:", error);
      window.alert(
        error instanceof Error
          ? error.message
          : "팔로우 처리에 실패했습니다."
      );
    } finally {
      setIsFollowUpdating(false);
    }
  }

  const tags = useMemo(() => {
    if (!profile) return [];

    return Array.from(
      new Set([
        ...normalizeArray(profile.interests),
        ...normalizeArray(profile.vibes),
        ...normalizeArray(profile.styles),
      ])
    ).slice(0, 12);
  }, [profile]);

  if (isLoading || !user || isFetching) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8FBFF]">
        <RefreshCw className="h-9 w-9 animate-spin text-violet-400" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#F8FBFF] px-5 py-16 text-slate-900">
        <div className="mx-auto max-w-xl rounded-[32px] bg-white p-10 text-center shadow-xl shadow-sky-100">
          <UserRound className="mx-auto h-14 w-14 text-slate-200" />
          <h1 className="mt-5 text-3xl font-black">
            프로필을 찾을 수 없습니다.
          </h1>
          <p className="mt-3 leading-7 text-slate-500">
            {errorMessage || "삭제되었거나 접근할 수 없는 사용자입니다."}
          </p>

          <Link
            href="/friends"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 font-black text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            친구 목록으로
          </Link>
        </div>
      </main>
    );
  }

  const isMyProfile = profile.id === myAppUserId;
  const avatar = profile.avatar || "";
  const posts = Array.isArray(profile.posts) ? profile.posts : [];

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6 md:py-5">
          <Link href="/friends" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
              <UserRound className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <p className="text-sm font-black text-violet-500">
                User Profile
              </p>
              <p className="text-xl font-black">상대방 프로필</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/friends"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">친구 목록</span>
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
        <section className="overflow-hidden rounded-[36px] bg-white shadow-2xl shadow-sky-100">
          <div className="h-44 bg-gradient-to-br from-sky-400 via-violet-500 to-fuchsia-500 md:h-56" />

          <div className="px-6 pb-8 md:px-10 md:pb-10">
            <div className="-mt-16 flex flex-col gap-6 md:-mt-20 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-[32px] border-8 border-white bg-gradient-to-br from-sky-100 to-violet-100 shadow-xl md:h-40 md:w-40">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={displayName(profile)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-16 w-16 text-violet-400" />
                  )}
                </div>

                <div className="pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-4xl font-black md:text-5xl">
                      {displayName(profile)}
                    </h1>

                    {profile.isVerified && (
                      <BadgeCheck className="h-7 w-7 text-sky-500" />
                    )}
                  </div>

                  {profile.name &&
                    profile.name !== profile.username && (
                      <p className="mt-2 font-bold text-slate-400">
                        {profile.name}
                      </p>
                    )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1.5 text-sm font-black text-sky-600">
                      <Globe2 className="h-4 w-4" />
                      {countryLabel(profile)}
                    </span>

                    {profile.location && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1.5 text-sm font-black text-violet-600">
                        <MapPin className="h-4 w-4" />
                        {profile.location}
                      </span>
                    )}

                    {profile.age && (
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-black text-slate-600">
                        {profile.age}세
                      </span>
                    )}

                    {profile.mbti && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-black text-emerald-600">
                        {profile.mbti}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!isMyProfile && (
                <div className="flex flex-wrap gap-3 pb-2">
                  <button
                    type="button"
                    onClick={toggleFollow}
                    disabled={isFollowUpdating || !myAppUserId}
                    className={`inline-flex items-center gap-2 rounded-2xl px-6 py-4 font-black text-white shadow-lg transition disabled:opacity-50 ${
                      profile.isFollowing
                        ? "bg-slate-700 hover:bg-slate-800"
                        : "bg-gradient-to-r from-sky-500 to-violet-500"
                    }`}
                  >
                    {isFollowUpdating ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <UserPlus className="h-5 w-5" />
                    )}
                    {profile.isFollowing ? "팔로잉" : "팔로우"}
                  </button>

                  <a
                    href={`insai://user/${profile.id}`}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 font-black text-slate-700 shadow-sm"
                  >
                    <MessageCircle className="h-5 w-5 text-violet-500" />
                    앱에서 보기
                  </a>
                </div>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-slate-50 p-5 text-center">
                <p className="text-sm font-black text-slate-400">팔로워</p>
                <p className="mt-2 text-3xl font-black">
                  {profile.followerCount || 0}
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5 text-center">
                <p className="text-sm font-black text-slate-400">팔로잉</p>
                <p className="mt-2 text-3xl font-black">
                  {profile.followingCount || 0}
                </p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-5 text-center">
                <p className="text-sm font-black text-slate-400">게시물</p>
                <p className="mt-2 text-3xl font-black">{posts.length}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-6">
            <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-500" />
                <p className="font-black text-emerald-600">About</p>
              </div>

              <h2 className="mt-3 text-3xl font-black">소개</h2>

              <p className="mt-5 whitespace-pre-line leading-8 text-slate-600">
                {profile.bio || "등록된 소개글이 없습니다."}
              </p>
            </section>

            <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-violet-100 md:p-8">
              <p className="font-black text-violet-500">Interests</p>
              <h2 className="mt-2 text-3xl font-black">관심사와 바이브</h2>

              {tags.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gradient-to-r from-sky-50 to-violet-50 px-4 py-2 text-sm font-black text-violet-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-slate-500">
                  등록된 관심사가 없습니다.
                </p>
              )}
            </section>
          </div>

          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-pink-500">Posts</p>
                <h2 className="mt-2 text-3xl font-black">게시물</h2>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 px-4 py-2 text-sm font-black text-pink-600">
                <Heart className="h-4 w-4" />
                {posts.length}
              </div>
            </div>

            {posts.length === 0 ? (
              <div className="mt-8 rounded-3xl bg-slate-50 p-12 text-center">
                <UserRound className="mx-auto h-12 w-12 text-slate-200" />
                <p className="mt-4 font-black text-slate-500">
                  공개된 게시물이 없습니다.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
                {posts.map((post) => {
                  const media = normalizeMedia(post.image)[0] || "";

                  return (
                    <a
                      key={post.id}
                      href={`insai://post/${post.id}`}
                      className="group relative aspect-square overflow-hidden rounded-3xl bg-slate-100"
                    >
                      {media ? (
                        <img
                          src={media}
                          alt={post.text || "게시물"}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center p-5 text-center">
                          <p className="line-clamp-5 text-sm font-bold leading-6 text-slate-500">
                            {post.text || "텍스트 게시물"}
                          </p>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white opacity-0 transition group-hover:opacity-100">
                        <p className="line-clamp-2 text-xs font-bold">
                          {post.text || "게시물 보기"}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}