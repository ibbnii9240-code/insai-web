"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Home,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";

type Permission =
  | "dashboard"
  | "reports"
  | "contacts"
  | "users"
  | "subscriptions"
  | "revenue"
  | "staff"
  | "operationLogs";

type StaffItem = {
  id: string;
  username: string;
  name: string;
  role: "owner" | "staff";
  status: "active" | "suspended";
  department?: string;
  permissions: Permission[];
  lastLoginAt?: string | null;
  lastLoginIp?: string;
  createdAt: string;
};

const permissionOptions: Array<{
  value: Permission;
  label: string;
}> = [
  { value: "dashboard", label: "대시보드" },
  { value: "reports", label: "신고 관리" },
  { value: "contacts", label: "문의 관리" },
  { value: "users", label: "유저 관리" },
  { value: "subscriptions", label: "구독 관리" },
  { value: "revenue", label: "매출 조회" },
  { value: "staff", label: "직원 관리" },
  { value: "operationLogs", label: "운영 로그" },
];

const initialCreateForm = {
  username: "",
  password: "",
  name: "",
  department: "",
  role: "staff" as "owner" | "staff",
  permissions: [
    "dashboard",
    "reports",
    "contacts",
    "users",
  ] as Permission[],
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [selected, setSelected] = useState<StaffItem | null>(null);
  const [keyword, setKeyword] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [editForm, setEditForm] = useState({
    name: "",
    department: "",
    role: "staff" as "owner" | "staff",
    status: "active" as "active" | "suspended",
    permissions: [] as Permission[],
    password: "",
  });

  async function fetchStaff() {
    try {
      setIsLoading(true);

      const response = await fetch("/api/admin/staff", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "직원 목록을 불러오지 못했습니다."
        );
      }

      const nextStaff = Array.isArray(result.staff)
        ? result.staff
        : [];

      setStaff(nextStaff);

      if (selected) {
        const refreshed = nextStaff.find(
          (item: StaffItem) => item.id === selected.id
        );
        setSelected(refreshed || null);
      }
    } catch (error: any) {
      alert(error?.message || "직원 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selected) return;

    setEditForm({
      name: selected.name,
      department: selected.department || "",
      role: selected.role,
      status: selected.status,
      permissions: selected.permissions || [],
      password: "",
    });
  }, [selected]);

  const filteredStaff = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    if (!query) return staff;

    return staff.filter((item) =>
      [
        item.username,
        item.name,
        item.department,
        item.role,
        item.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [staff, keyword]);

  function togglePermission(
    current: Permission[],
    permission: Permission,
    mode: "create" | "edit"
  ) {
    const next = current.includes(permission)
      ? current.filter((item) => item !== permission)
      : [...current, permission];

    if (mode === "create") {
      setCreateForm((prev) => ({
        ...prev,
        permissions: next,
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        permissions: next,
      }));
    }
  }

  async function createStaff() {
    try {
      setIsSaving(true);

      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "직원 계정 생성에 실패했습니다."
        );
      }

      setStaff((prev) => [result.staff, ...prev]);
      setCreateForm(initialCreateForm);
      setIsCreateOpen(false);
      alert("직원 계정이 생성되었습니다.");
    } catch (error: any) {
      alert(error?.message || "직원 계정 생성에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function updateStaff() {
    if (!selected) return;

    try {
      setIsSaving(true);

      const response = await fetch(
        `/api/admin/staff/${selected.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "직원 계정 수정에 실패했습니다."
        );
      }

      setStaff((prev) =>
        prev.map((item) =>
          item.id === result.staff.id ? result.staff : item
        )
      );
      setSelected(result.staff);
      alert("직원 계정이 수정되었습니다.");
    } catch (error: any) {
      alert(error?.message || "직원 계정 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteStaff() {
    if (!selected) return;

    if (!window.confirm(`${selected.name} 계정을 삭제할까요?`)) {
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(
        `/api/admin/staff/${selected.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(
          result.message || "직원 계정 삭제에 실패했습니다."
        );
      }

      setStaff((prev) =>
        prev.filter((item) => item.id !== selected.id)
      );
      setSelected(null);
      alert("직원 계정이 삭제되었습니다.");
    } catch (error: any) {
      alert(error?.message || "직원 계정 삭제에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  const activeCount = staff.filter(
    (item) => item.status === "active"
  ).length;

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6">
          <div>
            <p className="text-sm font-black text-emerald-500">
              Staff Management
            </p>
            <h1 className="text-2xl font-black">직원 관리</h1>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">관리자 홈</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">홈</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-sky-100">
            <Users className="h-7 w-7 text-sky-500" />
            <p className="mt-5 text-sm font-black text-slate-400">
              DB 운영 계정
            </p>
            <p className="mt-2 text-3xl font-black">{staff.length}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-emerald-100">
            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            <p className="mt-5 text-sm font-black text-slate-400">
              활성 계정
            </p>
            <p className="mt-2 text-3xl font-black">{activeCount}</p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-violet-100">
            <UserCog className="h-7 w-7 text-violet-500" />
            <p className="mt-5 text-sm font-black text-slate-400">
              직원 계정
            </p>
            <p className="mt-2 text-3xl font-black">
              {staff.filter((item) => item.role === "staff").length}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-[32px] bg-white p-5 shadow-xl shadow-sky-100 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-emerald-500">Staff List</p>
              <h2 className="mt-2 text-3xl font-black">
                운영 계정 목록
              </h2>
              <p className="mt-3 leading-7 text-slate-500">
                환경변수 초기 계정은 유지되며, 여기에는 오너가 새로 만든
                DB 직원 계정만 표시됩니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={fetchStaff}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-black"
              >
                <RefreshCw
                  className={`h-5 w-5 ${
                    isLoading ? "animate-spin" : ""
                  }`}
                />
                새로고침
              </button>

              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white"
              >
                <Plus className="h-5 w-5" />
                직원 생성
              </button>
            </div>
          </div>

          <div className="relative mt-7">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="아이디, 이름, 부서 검색"
              className="w-full rounded-2xl border border-slate-200 py-4 pl-12 pr-5 font-bold outline-none focus:border-violet-400"
            />
          </div>

          <div className="mt-7 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="max-h-[720px] space-y-3 overflow-y-auto pr-1">
              {isLoading && (
                <div className="rounded-3xl bg-slate-50 p-10 text-center font-bold text-slate-500">
                  직원 목록을 불러오는 중입니다.
                </div>
              )}

              {!isLoading && filteredStaff.length === 0 && (
                <div className="rounded-3xl bg-slate-50 p-10 text-center font-bold text-slate-500">
                  등록된 DB 직원 계정이 없습니다.
                </div>
              )}

              {filteredStaff.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(item)}
                  className={`w-full rounded-3xl p-5 text-left transition ${
                    selected?.id === item.id
                      ? "bg-violet-50 ring-2 ring-violet-300"
                      : "bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black">
                        {item.name}
                      </p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-400">
                        {item.username}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        item.status === "active"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {item.status === "active" ? "정상" : "정지"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-bold text-violet-500">
                    {item.role === "owner" ? "Owner" : "Staff"}
                    {item.department ? ` · ${item.department}` : ""}
                  </p>
                  <p className="mt-2 text-xs font-bold text-slate-400">
                    최근 로그인: {formatDate(item.lastLoginAt)}
                  </p>
                </button>
              ))}
            </div>

            <div className="rounded-3xl bg-slate-50 p-5 md:p-7">
              {!selected ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
                  <ShieldCheck className="h-12 w-12 text-slate-300" />
                  <h3 className="mt-5 text-2xl font-black">
                    직원 계정을 선택해주세요
                  </h3>
                  <p className="mt-3 leading-7 text-slate-500">
                    왼쪽 목록에서 계정을 선택하면 수정할 수 있습니다.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black text-violet-500">
                        Staff Detail
                      </p>
                      <h3 className="mt-2 text-3xl font-black">
                        {selected.name}
                      </h3>
                      <p className="mt-2 font-bold text-slate-400">
                        {selected.username}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="rounded-xl bg-white p-2"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="font-bold">
                      이름
                      <input
                        value={editForm.name}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                      />
                    </label>

                    <label className="font-bold">
                      담당 부서
                      <input
                        value={editForm.department}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            department: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                      />
                    </label>

                    <label className="font-bold">
                      권한 등급
                      <select
                        value={editForm.role}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            role: event.target.value as
                              | "owner"
                              | "staff",
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                      >
                        <option value="staff">Staff</option>
                        <option value="owner">Owner</option>
                      </select>
                    </label>

                    <label className="font-bold">
                      계정 상태
                      <select
                        value={editForm.status}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            status: event.target.value as
                              | "active"
                              | "suspended",
                          }))
                        }
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                      >
                        <option value="active">정상</option>
                        <option value="suspended">정지</option>
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 block font-bold">
                    새 비밀번호
                    <input
                      value={editForm.password}
                      onChange={(event) =>
                        setEditForm((prev) => ({
                          ...prev,
                          password: event.target.value,
                        }))
                      }
                      type="password"
                      placeholder="변경할 때만 입력"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
                    />
                  </label>

                  <div className="mt-5">
                    <p className="font-black">세부 권한</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {permissionOptions.map((permission) => (
                        <label
                          key={permission.value}
                          className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 font-bold"
                        >
                          <input
                            type="checkbox"
                            checked={editForm.permissions.includes(
                              permission.value
                            )}
                            onChange={() =>
                              togglePermission(
                                editForm.permissions,
                                permission.value,
                                "edit"
                              )
                            }
                          />
                          {permission.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={updateStaff}
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-500 px-5 py-4 font-black text-white disabled:opacity-50"
                    >
                      <Edit3 className="h-5 w-5" />
                      수정 저장
                    </button>

                    <button
                      type="button"
                      onClick={deleteStaff}
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-4 font-black text-white disabled:opacity-50"
                    >
                      <Trash2 className="h-5 w-5" />
                      계정 삭제
                    </button>
                  </div>

                  <div className="mt-5 rounded-2xl bg-white p-4 text-sm font-bold text-slate-500">
                    최근 로그인: {formatDate(selected.lastLoginAt)}
                    <br />
                    최근 IP: {selected.lastLoginIp || "-"}
                    <br />
                    생성일: {formatDate(selected.createdAt)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 py-8">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-black text-emerald-500">
                  Create Staff
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  직원 계정 생성
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl bg-slate-100 p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="font-bold">
                로그인 아이디
                <input
                  value={createForm.username}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      username: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                />
              </label>

              <label className="font-bold">
                이름
                <input
                  value={createForm.name}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                />
              </label>

              <label className="font-bold">
                초기 비밀번호
                <input
                  value={createForm.password}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  type="password"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                />
              </label>

              <label className="font-bold">
                담당 부서
                <input
                  value={createForm.department}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      department: event.target.value,
                    }))
                  }
                  placeholder="예: 고객지원팀"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                />
              </label>

              <label className="font-bold sm:col-span-2">
                권한 등급
                <select
                  value={createForm.role}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      role: event.target.value as
                        | "owner"
                        | "staff",
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
                >
                  <option value="staff">Staff</option>
                  <option value="owner">Owner</option>
                </select>
              </label>
            </div>

            <div className="mt-5">
              <p className="font-black">세부 권한</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {permissionOptions.map((permission) => (
                  <label
                    key={permission.value}
                    className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 font-bold"
                  >
                    <input
                      type="checkbox"
                      checked={createForm.permissions.includes(
                        permission.value
                      )}
                      onChange={() =>
                        togglePermission(
                          createForm.permissions,
                          permission.value,
                          "create"
                        )
                      }
                    />
                    {permission.label}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={createStaff}
              disabled={isSaving}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 font-black text-white disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              {isSaving ? "생성 중..." : "직원 계정 생성"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
