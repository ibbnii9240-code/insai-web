"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Home,
  Inbox,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  XCircle,
} from "lucide-react";

type ReportStatus = "대기" | "확인중" | "완료" | "반려";

type ReportItem = {
  id: string;

  reporterId?: string;
  reporterName?: string;
  reporterEmail?: string;

  reportedUserId?: string;
  reportedNickname?: string;

  category?: string;
  reason?: string;
  message?: string;
  status: ReportStatus;

  adminNote?: string;
  processedBy?: string;
  processedAt?: string | null;

  userId?: string;
  appUserId?: string;
  webUserId?: string;
  source?: "app" | "web" | string;
  appVersion?: string;

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
  if (status === "반려") return "bg-slate-100 text-slate-500";
  return "bg-amber-50 text-amber-600";
}

function getStatusIcon(status: ReportStatus) {
  if (status === "완료") return CheckCircle2;
  if (status === "확인중") return Clock;
  if (status === "반려") return XCircle;
  return Inbox;
}

function reportTitle(report: ReportItem) {
  return (
    report.reportedNickname ||
    report.reportedUserId ||
    report.category ||
    "신고"
  );
}

function reporterLabel(report: ReportItem) {
  return report.reporterName || report.reporterEmail || report.reporterId || "신고자 정보 없음";
}

function reportReason(report: ReportItem) {
  return report.reason || report.message || "신고 내용 없음";
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"전체" | ReportStatus>("전체");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState("");

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

      const nextReports = result.reports || [];
      setReports(nextReports);

      if (selectedReport) {
        const refreshed = nextReports.find(
          (item: ReportItem) => item.id === selectedReport.id
        );
        setSelectedReport(refreshed || null);
      }
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
          adminNote,
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
      setAdminNote(result.report.adminNote || "");
    } catch (error) {
      console.error("Report update error:", error);
      alert("신고 처리 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function deleteReport() {
    if (!selectedReport) return;

    if (!window.confirm("이 신고내역을 삭제할까요?")) {
      return;
    }

    try {
      setIsUpdating(true);

      const response = await fetch(`/api/reports/${selectedReport.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "신고 삭제에 실패했습니다.");
      }

      setReports((prev) => prev.filter((item) => item.id !== selectedReport.id));
      setSelectedReport(null);
      setAdminNote("");
    } catch (error) {
      console.error("Report delete error:", error);
      alert("신고 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function suspendTargetUser() {
    if (!selectedReport) return;

    const targetUserId = selectedReport.reportedUserId;

    if (!targetUserId) {
      alert("신고 대상 유저 ID가 없어 계정 정지를 할 수 없습니다.");
      return;
    }

    if (
      !window.confirm(
        `${selectedReport.reportedNickname || targetUserId} 유저를 정지하고 신고를 완료 처리할까요?`
      )
    ) {
      return;
    }

    try {
      setIsUpdating(true);

      const userResponse = await fetch(`/api/users/${targetUserId}`, {
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
          adminNote:
            adminNote.trim().length > 0
              ? adminNote
              : "신고 검토 후 대상 유저를 정지 처리했습니다.",
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
      setAdminNote(reportResult.report.adminNote || "");

      alert("대상 유저가 정지 처리되고 신고가 완료 처리되었습니다.");
    } catch (error) {
      console.error("Suspend target user error:", error);
      alert("계정 정지 처리 중 오류가 발생했습니다. /api/users/[id]가 아직 없으면 정지 기능은 따로 연결해야 합니다.");
    } finally {
      setIsUpdating(false);
    }
  }

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAdminNote(selectedReport?.adminNote || "");
  }, [selectedReport]);

  const filteredReports = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesStatus =
        statusFilter === "전체" ? true : report.status === statusFilter;

      const targetText = [
        report.reporterName,
        report.reporterEmail,
        report.reporterId,
        report.reportedNickname,
        report.reportedUserId,
        report.category,
        report.reason,
        report.message,
        report.status,
        report.appUserId,
        report.webUserId,
        report.source,
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
      rejected: reports.filter((item) => item.status === "반려").length,
    };
  }, [reports]);

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6 md:py-5">
          <Link href="/" className="flex items-center gap-3">
            <ShieldAlert className="h-9 w-9 text-violet-500" />
            <span className="text-2xl font-extrabold md:text-3xl">
              insai Admin
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/admin"
              className="hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold shadow-sm md:inline-flex"
            >
              관리자 홈
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-sm md:px-5"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">홈으로</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-6 md:py-12">
        <div className="rounded-[32px] bg-white p-6 shadow-2xl shadow-sky-100 md:rounded-[36px] md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-violet-500">Reports</p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">
                신고 관리
              </h1>
              <p className="mt-5 max-w-2xl leading-8 text-slate-600">
                사용자 신고를 확인하고 상태와 운영팀 처리 내용을 관리합니다.
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
            { label: "반려", value: counts.rejected, color: "text-slate-500" },
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
          <section className="rounded-[32px] bg-white p-5 shadow-xl shadow-violet-100 md:p-8">
            <div>
              <p className="font-black text-sky-500">Report List</p>
              <h2 className="mt-2 text-3xl font-black">신고 목록</h2>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="신고자, 대상, 사유, App User ID 검색"
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
                <option value="반려">반려</option>
              </select>
            </div>

            <div className="mt-6 max-h-[720px] space-y-4 overflow-y-auto pr-1 md:pr-2">
              {isLoading && (
                <div className="rounded-3xl bg-slate-50 p-10 text-center">
                  <RefreshCw className="mx-auto h-10 w-10 animate-spin text-violet-300" />
                  <h3 className="mt-5 text-2xl font-black">
                    신고 목록을 불러오는 중입니다.
                  </h3>
                </div>
              )}

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
                        {report.category || "신고"}
                      </span>
                      {report.source && (
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-400">
                          {report.source === "app" ? "앱" : "웹"}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-xl font-black">
                      {reportTitle(report)}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {reportReason(report)}
                    </p>
                    <p className="mt-3 text-xs font-bold text-slate-400">
                      신고자: {reporterLabel(report)} · {formatDate(report.createdAt)}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[32px] bg-white p-5 shadow-xl shadow-sky-100 md:p-8">
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
                    <h2 className="mt-2 text-3xl font-black">신고 상세</h2>
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
                    <p className="mt-2 font-black">
                      {selectedReport.reporterName || "신고자 정보 없음"}
                    </p>
                    <p className="mt-1 break-all text-sm font-bold text-slate-500">
                      {selectedReport.reporterEmail || "-"}
                    </p>
                    <p className="mt-1 break-all text-xs font-bold text-slate-400">
                      Reporter ID: {selectedReport.reporterId || "-"}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-rose-50 p-5">
                    <p className="text-sm font-black text-rose-400">신고 대상</p>
                    <p className="mt-2 font-black text-rose-700">
                      {selectedReport.reportedNickname || "대상 닉네임 없음"}
                    </p>
                    <p className="mt-1 break-all text-sm font-bold text-rose-500">
                      {selectedReport.reportedUserId || "대상 ID 없음"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-black text-slate-400">App User ID</p>
                    <p className="mt-2 break-all font-bold">
                      {selectedReport.appUserId ||
                        selectedReport.userId ||
                        selectedReport.reporterId ||
                        "-"}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-black text-slate-400">Web User ID</p>
                    <p className="mt-2 break-all font-bold">
                      {selectedReport.webUserId || "-"}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-black text-slate-400">접수 경로</p>
                    <p className="mt-2 font-bold">
                      {selectedReport.source === "web" ? "웹" : "앱"}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-black text-slate-400">앱 버전</p>
                    <p className="mt-2 font-bold">
                      {selectedReport.appVersion || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm font-black text-slate-400">신고 유형</p>
                  <p className="mt-2 text-xl font-black">
                    {selectedReport.category || "신고"}
                  </p>
                </div>

                <div className="mt-5 rounded-3xl bg-white p-5 ring-1 ring-slate-100">
                  <p className="text-sm font-black text-slate-400">신고 사유</p>
                  <p className="mt-3 whitespace-pre-line leading-8 text-slate-700">
                    {reportReason(selectedReport)}
                  </p>
                </div>

                <div className="mt-5">
                  <label className="text-sm font-black text-slate-400">
                    운영팀 처리 내용
                  </label>
                  <textarea
                    value={adminNote}
                    onChange={(event) => setAdminNote(event.target.value)}
                    rows={5}
                    placeholder="사용자에게 보여줄 처리 내용 또는 내부 메모를 입력하세요."
                    className="mt-3 w-full rounded-3xl border border-slate-200 p-5 font-bold leading-7 outline-none focus:border-violet-400"
                  />
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={suspendTargetUser}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-4 font-black text-white transition hover:bg-rose-600 disabled:opacity-50"
                  >
                    <Ban className="h-5 w-5" />
                    계정 정지
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={deleteReport}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-200 px-5 py-4 font-black text-slate-700 transition hover:bg-slate-300 disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5" />
                    삭제
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => updateReportStatus("확인중")}
                    className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white transition hover:bg-sky-600 disabled:opacity-50"
                  >
                    확인중
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => updateReportStatus("완료")}
                    className="rounded-2xl bg-emerald-500 px-5 py-4 font-black text-white transition hover:bg-emerald-600 disabled:opacity-50"
                  >
                    완료
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => updateReportStatus("반려")}
                    className="rounded-2xl bg-slate-950 px-5 py-4 font-black text-white transition hover:bg-slate-800 disabled:opacity-50"
                  >
                    반려
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => updateReportStatus("대기")}
                    className="rounded-2xl bg-amber-500 px-5 py-4 font-black text-white transition hover:bg-amber-600 disabled:opacity-50"
                  >
                    대기
                  </button>
                </div>

                <div className="mt-4 rounded-3xl bg-rose-50 p-5">
                  <p className="text-sm font-bold leading-6 text-rose-600">
                    계정 정지는 /api/users/[id] PATCH가 연결되어 있어야 정상 작동합니다.
                    아직 유저 정지 API가 없으면 상태 변경만 먼저 사용해도 됩니다.
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