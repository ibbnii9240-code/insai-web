"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Home,
  RefreshCw,
  Search,
  ShieldAlert,
  UserRound,
  Users,
  XCircle,
  Ban,
} from "lucide-react";

type UserStatus = "active" | "suspended" | "deleted";

type UserItem = {
  id: string;
  provider: string;
  providerId: string;
  email: string;
  emailVerified: boolean;
  name: string;
  nickname: string;
  avatar: string;
  role: "user" | "staff" | "owner";
  status: UserStatus;
  isProfileCompleted: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string;
};

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });
}

function getStatusLabel(status: UserStatus) {
  if (status === "active") return "정상";
  if (status === "suspended") return "정지";
  return "탈퇴";
}

function getStatusStyle(status: UserStatus) {
  if (status === "active") return "bg-emerald-50 text-emerald-600";
  if (status === "suspended") return "bg-rose-50 text-rose-600";
  return "bg-slate-100 text-slate-500";
}

function getStatusIcon(status: UserStatus) {
  if (status === "active") return CheckCircle2;
  if (status === "suspended") return ShieldAlert;
  return XCircle;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"전체" | UserStatus>("전체");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  async function fetchUsers() {
    try {
      setIsLoading(true);

      const response = await fetch("/api/users", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "유저 목록을 불러오지 못했습니다.");
      }

      setUsers(result.users || []);
    } catch (error) {
      console.error("Users fetch error:", error);
      alert("유저 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }


  async function updateUserStatus(nextStatus: UserStatus) {
    if (!selectedUser) return;

    const confirmMessage =
      nextStatus === "suspended"
        ? "이 유저를 정지 처리할까요?"
        : nextStatus === "active"
          ? "이 유저의 정지를 해제할까요?"
          : "이 유저를 탈퇴 처리할까요?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsUpdating(true);

      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: nextStatus === "deleted" ? "DELETE" : "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          nextStatus === "deleted"
            ? undefined
            : JSON.stringify({
                status: nextStatus,
              }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "유저 상태 변경에 실패했습니다.");
      }

      const updatedUser = result.user as UserItem;

      setUsers((prev) =>
        prev.map((item) => (item.id === updatedUser.id ? updatedUser : item))
      );

      setSelectedUser(updatedUser);
    } catch (error) {
      console.error("User status update error:", error);
      alert("유저 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();

    return users.filter((user) => {
      const matchesStatus =
        statusFilter === "전체" ? true : user.status === statusFilter;

      const targetText = [
        user.email,
        user.name,
        user.nickname,
        user.provider,
        user.role,
        getStatusLabel(user.status),
      ]
        .join(" ")
        .toLowerCase();

      const matchesKeyword = lowerKeyword
        ? targetText.includes(lowerKeyword)
        : true;

      return matchesStatus && matchesKeyword;
    });
  }, [users, keyword, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((item) => item.status === "active").length,
      suspended: users.filter((item) => item.status === "suspended").length,
      deleted: users.filter((item) => item.status === "deleted").length,
      completed: users.filter((item) => item.isProfileCompleted).length,
    };
  }, [users]);

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <Users className="h-9 w-9 text-sky-500" />
            <span className="text-3xl font-extrabold">insai Admin</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold shadow-sm md:inline-flex"
            >
              관리자 홈
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold shadow-sm"
            >
              <Home className="h-4 w-4" />
              홈으로
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-[36px] bg-white p-8 shadow-2xl shadow-sky-100 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-sky-500">Users</p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">
                유저 관리
              </h1>
              <p className="mt-5 max-w-2xl leading-8 text-slate-600">
                실제 가입한 유저 목록을 조회하고 계정 상태를 확인할 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-6 py-4 font-black text-white shadow-lg shadow-violet-200 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`}
              />
              새로고침
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {[
            { label: "전체", value: counts.total, color: "text-slate-700" },
            { label: "정상", value: counts.active, color: "text-emerald-600" },
            { label: "정지", value: counts.suspended, color: "text-rose-600" },
            { label: "탈퇴", value: counts.deleted, color: "text-slate-500" },
            { label: "온보딩 완료", value: counts.completed, color: "text-sky-600" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl bg-white p-6 shadow-lg shadow-sky-100"
            >
              <p className="text-sm font-black text-slate-400">{item.label}</p>
              <p className={`mt-2 text-3xl font-black ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-violet-100 md:p-8">
            <div>
              <p className="font-black text-sky-500">User List</p>
              <h2 className="mt-2 text-3xl font-black">유저 목록</h2>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="이메일, 닉네임, 이름 검색"
                  className="w-full rounded-2xl border border-slate-200 py-4 pl-12 pr-5 font-bold outline-none focus:border-violet-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "전체" | UserStatus)
                }
                className="rounded-2xl border border-slate-200 px-5 py-4 font-bold outline-none focus:border-violet-400"
              >
                <option value="전체">전체 상태</option>
                <option value="active">정상</option>
                <option value="suspended">정지</option>
                <option value="deleted">탈퇴</option>
              </select>
            </div>

            <div className="mt-6 max-h-[760px] space-y-4 overflow-y-auto pr-2">
              {!isLoading && filteredUsers.length === 0 && (
                <div className="rounded-3xl bg-slate-50 p-10 text-center">
                  <Users className="mx-auto h-10 w-10 text-slate-300" />
                  <h3 className="mt-5 text-2xl font-black">
                    유저가 없습니다.
                  </h3>
                </div>
              )}

              {filteredUsers.map((user) => {
                const StatusIcon = getStatusIcon(user.status);
                const isSelected = selectedUser?.id === user.id;

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUser(user)}
                    className={`w-full rounded-3xl p-5 text-left transition ${
                      isSelected
                        ? "bg-sky-50 ring-2 ring-sky-300"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100">
                        {user.avatar ? (
                          <Image
                            src={user.avatar}
                            alt="profile"
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound className="h-7 w-7 text-violet-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-lg font-black">
                            {user.nickname || user.name || "이름 없음"}
                          </p>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${getStatusStyle(
                              user.status
                            )}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {getStatusLabel(user.status)}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-sm font-bold text-slate-500">
                          {user.email || "-"}
                        </p>

                        <p className="mt-2 text-xs font-bold text-slate-400">
                          {user.provider.toUpperCase()} · 가입일{" "}
                          {formatDate(user.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
            {!selectedUser ? (
              <div className="flex min-h-[560px] flex-col items-center justify-center rounded-3xl bg-slate-50 p-10 text-center">
                <UserRound className="h-12 w-12 text-slate-300" />
                <h2 className="mt-5 text-3xl font-black">
                  유저를 선택해주세요
                </h2>
                <p className="mt-3 leading-7 text-slate-500">
                  왼쪽 목록에서 유저를 누르면 상세 정보가 표시됩니다.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-start gap-5">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-sky-100 to-violet-100">
                    {selectedUser.avatar ? (
                      <Image
                        src={selectedUser.avatar}
                        alt="profile"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-10 w-10 text-violet-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-black text-sky-500">User Detail</p>
                    <h2 className="mt-2 break-words text-3xl font-black">
                      {selectedUser.nickname || selectedUser.name || "이름 없음"}
                    </h2>
                    <p className="mt-2 break-all text-sm font-bold text-slate-500">
                      {selectedUser.email || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-black text-slate-400">상태</p>
                    <p className="mt-2 font-black">
                      {getStatusLabel(selectedUser.status)}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-black text-slate-400">권한</p>
                    <p className="mt-2 font-black">{selectedUser.role}</p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-black text-slate-400">가입 방식</p>
                    <p className="mt-2 font-black">
                      {selectedUser.provider || "-"}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-black text-slate-400">
                      이메일 인증
                    </p>
                    <p className="mt-2 font-black">
                      {selectedUser.emailVerified ? "인증됨" : "미인증"}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-black text-slate-400">
                      온보딩
                    </p>
                    <p className="mt-2 font-black">
                      {selectedUser.isProfileCompleted ? "완료" : "미완료"}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-black text-slate-400">
                      마지막 로그인
                    </p>
                    <p className="mt-2 font-black">
                      {formatDate(selectedUser.lastLoginAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-black text-slate-400">User ID</p>
                  <p className="mt-2 break-all font-mono text-sm font-bold text-slate-700">
                    {selectedUser.id}
                  </p>
                </div>

                <div className="mt-5 rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-black text-slate-400">
                    Provider ID
                  </p>
                  <p className="mt-2 break-all font-mono text-sm font-bold text-slate-700">
                    {selectedUser.providerId || "-"}
                  </p>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    disabled={isUpdating || selectedUser.status === "suspended"}
                    onClick={() => updateUserStatus("suspended")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-4 font-black text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Ban className="h-5 w-5" />
                    정지하기
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating || selectedUser.status === "active"}
                    onClick={() => updateUserStatus("active")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 font-black text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    정지 해제
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating || selectedUser.status === "deleted"}
                    onClick={() => updateUserStatus("deleted")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 font-black text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5" />
                    탈퇴 처리
                  </button>
                </div>

                <div className="mt-5 rounded-3xl bg-amber-50 p-5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <p className="font-black text-amber-700">
                      정지된 유저는 로그인 시 접근이 차단됩니다. 탈퇴 처리는 status를 deleted로 변경합니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
