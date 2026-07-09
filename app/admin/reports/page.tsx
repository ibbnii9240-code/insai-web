"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Home,
  Inbox,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
  Ban,
} from "lucide-react";

type ReportStatus = "대기" | "확인중" | "완료" | "기각";

type ReportItem = {
  id: string;

  reporterId: string;
  reporterName: string;
  reporterEmail: string;

  targetUserId: string;
  targetUserName: string;

  category: string;
  reason: string;
  status: ReportStatus;

  adminMemo?: string;
  processedBy?: string;
  processedAt?: string | null;

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

function getStatusStyle(status: ReportStatus) {
  if (status === "완료") return "bg-emerald-50 text-emerald-600";
  if (status === "확인중") return "bg-sky-50 text-sky-600";
  if (status === "기각") return "bg-slate-100 text-slate-500";
  return "bg-amber-50 text-amber-600";
}

function getStatusIcon(status: ReportStatus) {
  if (status === "완료") return CheckCircle2;
  if (status === "확인중") return Clock;
  if (status === "기각") return XCircle;
  return Inbox;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"전체" | ReportStatus>("전체");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminMemo, setAdminMemo] = useState("");

  async function fetchReports() {
    try {
      setIsLoading(true);

      const response = await fetch("/api/reports", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "신고 목록을 불러오지 못했습니다.");
      }

      setReports(result.reports || []);
    } catch (error) {
      console.error("Reports fetch error:", error);
      alert("신고 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateReportStatus(nextStatus: ReportStatus) {
    if (!selectedReport) return;

    try {
      setIsUpdating(true);

      const response = await fetch(`/api/reports/${selectedReport.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          adminMemo,
          processedBy: "관리자",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "신고 처리 중 오류가 발생했습니다.");
      }

      setReports((prev) =>
        prev.map((item) => (item.id === result.report.id ? result.report : item))
      );
      setSelectedReport(result.report);
      setAdminMemo(result.report.adminMemo || "");
    } catch (error) {
      console.error("Report update error:", error);
      alert("신고 처리 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }


  async function suspendTargetUser() {
    if (!selectedReport) return;

    if (
      !window.confirm(
        `${selectedReport.targetUserName} 유저를 정지하고 신고를 완료 처리할까요?`
      )
    ) {
      return;
    }

    try {
      setIsUpdating(true);

      const userResponse = await fetch(`/api/users/${selectedReport.targetUserId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "suspended",
        }),
      });

      const userResult = await userResponse.json();

      if (!userResponse.ok || !userResult.ok) {
        throw new Error(userResult.message || "유저 정지 처리에 실패했습니다.");
      }

      const reportResponse = await fetch(`/api/reports/${selectedReport.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "완료",
          adminMemo:
            adminMemo.trim().length > 0
              ? adminMemo
              : "신고 검토 후 대상 유저를 정지 처리했습니다.",
          processedBy: "관리자",
        }),
      });

      const reportResult = await reportResponse.json();

      if (!reportResponse.ok || !reportResult.ok) {
        throw new Error(reportResult.message || "신고 완료 처리에 실패했습니다.");
      }

      setReports((prev) =>
        prev.map((item) =>
          item.id === reportResult.report.id ? reportResult.report : item
        )
      );
      setSelectedReport(reportResult.report);
      setAdminMemo(reportResult.report.adminMemo || "");

      alert("대상 유저가 정지 처리되고 신고가 완료 처리되었습니다.");
    } catch (error) {
      console.error("Suspend target user error:", error);
      alert("계정 정지 처리 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    setAdminMemo(selectedReport?.adminMemo || "");
  }, [selectedReport]);

  const filteredReports = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesStatus =
        statusFilter === "전체" ? true : report.status === statusFilter;

      const targetText = [
        report.reporterName,
        report.reporterEmail,
        report.targetUserName,
        report.category,
        report.reason,
        report.status,
      ]
        .join(" ")
        .toLowerCase();

      const matchesKeyword = lowerKeyword
        ? targetText.includes(lowerKeyword)
        : true;

      return matchesStatus && matchesKeyword;
    });
  }, [reports, keyword, statusFilter]);

  const counts = useMemo(() => {
    return {
      total: reports.length,
      waiting: reports.filter((item) => item.status === "대기").length,
      checking: reports.filter((item) => item.status === "확인중").length,
      done: reports.filter((item) => item.status === "완료").length,
      rejected: reports.filter((item) => item.status === "기각").length,
    };
  }, [reports]);

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <ShieldAlert className="h-9 w-9 text-violet-500" />
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
              <p className="font-black text-violet-500">Reports</p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">
                신고 관리
              </h1>
              <p className="mt-5 max-w-2xl leading-8 text-slate-600">
                사용자 신고를 확인하고 상태를 변경할 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchReports}
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
            { label: "대기", value: counts.waiting, color: "text-amber-600" },
            { label: "확인중", value: counts.checking, color: "text-sky-600" },
            { label: "완료", value: counts.done, color: "text-emerald-600" },
            { label: "기각", value: counts.rejected, color: "text-slate-500" },
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-violet-100 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-black text-sky-500">Report List</p>
                <h2 className="mt-2 text-3xl font-black">신고 목록</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="신고자, 대상, 사유 검색"
                  className="w-full rounded-2xl border border-slate-200 py-4 pl-12 pr-5 font-bold outline-none focus:border-violet-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "전체" | ReportStatus)
                }
                className="rounded-2xl border border-slate-200 px-5 py-4 font-bold outline-none focus:border-violet-400"
              >
                <option value="전체">전체 상태</option>
                <option value="대기">대기</option>
                <option value="확인중">확인중</option>
                <option value="완료">완료</option>
                <option value="기각">기각</option>
              </select>
            </div>

            <div className="mt-6 max-h-[720px] space-y-4 overflow-y-auto pr-2">
              {!isLoading && filteredReports.length === 0 && (
                <div className="rounded-3xl bg-slate-50 p-10 text-center">
                  <Inbox className="mx-auto h-10 w-10 text-slate-300" />
                  <h3 className="mt-5 text-2xl font-black">
                    신고가 없습니다.
                  </h3>
                </div>
              )}

              {filteredReports.map((report) => {
                const StatusIcon = getStatusIcon(report.status);
                const isSelected = selectedReport?.id === report.id;

                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className={`w-full rounded-3xl p-5 text-left transition ${
                      isSelected
                        ? "bg-violet-50 ring-2 ring-violet-300"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${getStatusStyle(
                          report.status
                        )}`}
                      >
                        <StatusIcon className="h-3.5 w-3.5" />
                        {report.status}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-violet-500">
                        {report.category}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-black">
                      {report.targetUserName}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {report.reason}
                    </p>
                    <p className="mt-3 text-xs font-bold text-slate-400">
                      신고자: {report.reporterName} · {formatDate(report.createdAt)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
            {!selectedReport ? (
              <div className="flex min-h-[560px] flex-col items-center justify-center rounded-3xl bg-slate-50 p-10 text-center">
                <AlertTriangle className="h-12 w-12 text-slate-300" />
                <h2 className="mt-5 text-3xl font-black">
                  신고를 선택해주세요
                </h2>
                <p className="mt-3 leading-7 text-slate-500">
                  왼쪽 목록에서 신고를 누르면 상세 내용과 처리 버튼이 표시됩니다.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-black text-violet-500">Report Detail</p>
                    <h2 className="mt-2 text-3xl font-black">
                      신고 상세
                    </h2>
                    <p className="mt-2 text-sm font-bold text-slate-400">
                      접수일: {formatDate(selectedReport.createdAt)}
                    </p>
                  </div>

                  {(() => {
                    const StatusIcon = getStatusIcon(selectedReport.status);

                    return (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-black ${getStatusStyle(
                          selectedReport.status
                        )}`}
                      >
                        <StatusIcon className="h-4 w-4" />
                        {selectedReport.status}
                      </span>
                    );
                  })()}
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-black text-slate-400">신고자</p>
                    <p className="mt-2 font-black">{selectedReport.reporterName}</p>
                    <p className="mt-1 text-sm font-bold text-slate-500">
                      {selectedReport.reporterEmail || "-"}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-rose-50 p-5">
                    <p className="text-sm font-black text-rose-400">신고 대상</p>
                    <p className="mt-2 font-black text-rose-700">
                      {selectedReport.targetUserName}
                    </p>
                    <p className="mt-1 break-all text-sm font-bold text-rose-500">
                      {selectedReport.targetUserId}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-black text-slate-400">신고 유형</p>
                  <p className="mt-2 text-xl font-black">{selectedReport.category}</p>
                </div>

                <div className="mt-5 rounded-3xl bg-white p-5 ring-1 ring-slate-100">
                  <p className="text-sm font-black text-slate-400">신고 사유</p>
                  <p className="mt-3 whitespace-pre-line leading-8 text-slate-700">
                    {selectedReport.reason}
                  </p>
                </div>

                <div className="mt-5">
                  <label className="text-sm font-black text-slate-400">
                    관리자 메모
                  </label>
                  <textarea
                    value={adminMemo}
                    onChange={(event) => setAdminMemo(event.target.value)}
                    rows={5}
                    placeholder="처리 내용이나 내부 메모를 입력하세요."
                    className="mt-3 w-full rounded-3xl border border-slate-200 p-5 font-bold leading-7 outline-none focus:border-violet-400"
                  />
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-5">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={suspendTargetUser}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-4 font-black text-white transition hover:bg-rose-600 disabled:opacity-50"
                  >
                    <Ban className="h-5 w-5" />
                    계정 정지
                  </button>

                  {(["확인중", "완료", "기각", "대기"] as ReportStatus[]).map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        disabled={isUpdating}
                        onClick={() => updateReportStatus(status)}
                        className="rounded-2xl bg-slate-950 px-5 py-4 font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
                      >
                        {status}
                      </button>
                    )
                  )}
                </div>

                <div className="mt-4 rounded-3xl bg-rose-50 p-5">
                  <p className="text-sm font-bold leading-6 text-rose-600">
                    계정 정지를 누르면 신고 대상 유저의 status가 suspended로 변경되고,
                    해당 신고는 자동으로 완료 처리됩니다.
                  </p>
                </div>

                {(selectedReport.processedAt || selectedReport.processedBy) && (
                  <div className="mt-5 rounded-3xl bg-emerald-50 p-5">
                    <p className="font-black text-emerald-700">처리 정보</p>
                    <p className="mt-2 text-sm font-bold text-emerald-600">
                      처리자: {selectedReport.processedBy || "-"}
                    </p>
                    <p className="mt-1 text-sm font-bold text-emerald-600">
                      처리일: {formatDate(selectedReport.processedAt)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
