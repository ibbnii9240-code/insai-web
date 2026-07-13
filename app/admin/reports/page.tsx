"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  ExternalLink,
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
  appReportId?: string;

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

  postId?: string;
  postText?: string;
  postImages?: string[];
  postAuthorId?: string;
  postAuthorName?: string;
  postAuthorAvatar?: string;
  postCreatedAt?: string | null;

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

function reportReason(report: ReportItem) {
  return report.reason || report.message || "신고 내용 없음";
}

function reportTitle(report: ReportItem) {
  if (report.postText) {
    return report.postText.slice(0, 45);
  }

  return (
    report.reportedNickname ||
    report.reportedUserId ||
    report.category ||
    "신고"
  );
}

function isVideoUrl(url?: string) {
  const clean = String(url || "").toLowerCase().split("?")[0];

  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".m4v") ||
    clean.endsWith(".webm")
  );
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"전체" | ReportStatus>("전체");
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
        throw new Error(
          result.message || "신고 목록을 불러오지 못했습니다."
        );
      }

      const nextReports: ReportItem[] = result.reports || [];
      setReports(nextReports);

      if (selectedReport) {
        const refreshed = nextReports.find(
          (item) => item.id === selectedReport.id
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
        throw new Error(
          result.message || "신고 처리 중 오류가 발생했습니다."
        );
      }

      setReports((prev) =>
        prev.map((item) =>
          item.id === result.report.id ? result.report : item
        )
      );

      setSelectedReport(result.report);
      setAdminNote(result.report.adminNote || "");
    } catch (error) {
      console.error("Report update error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "신고 처리 중 오류가 발생했습니다."
      );
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

      setReports((prev) =>
        prev.filter((item) => item.id !== selectedReport.id)
      );
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
      alert("신고 대상 유저 ID가 없습니다.");
      return;
    }

    if (
      !window.confirm(
        `${
          selectedReport.reportedNickname || targetUserId
        } 유저를 정지하고 신고를 완료 처리할까요?`
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
        throw new Error(
          userResult.message || "유저 정지 처리에 실패했습니다."
        );
      }

      const reportResponse = await fetch(
        `/api/reports/${selectedReport.id}`,
        {
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
        }
      );

      const reportResult = await reportResponse.json();

      if (!reportResponse.ok || !reportResult.ok) {
        throw new Error(
          reportResult.message || "신고 완료 처리에 실패했습니다."
        );
      }

      setReports((prev) =>
        prev.map((item) =>
          item.id === reportResult.report.id
            ? reportResult.report
            : item
        )
      );
      setSelectedReport(reportResult.report);
      setAdminNote(reportResult.report.adminNote || "");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAdminNote(selectedReport?.adminNote || "");
  }, [selectedReport]);

  const filteredReports = useMemo(() => {
    const lowerKeyword = keyword.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesStatus =
        statusFilter === "전체"
          ? true
          : report.status === statusFilter;

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
        report.postId,
        report.postText,
        report.postAuthorName,
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

  const previewImage = selectedReport?.postImages?.[0] || "";

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

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold shadow-sm md:inline-flex"
            >
              관리자 홈
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold shadow-sm"
            >
              <Home className="h-4 w-4" />
              홈으로
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-6 md:py-12">
        <div className="rounded-[32px] bg-white p-6 shadow-2xl shadow-sky-100 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black text-violet-500">Reports</p>
              <h1 className="mt-3 text-4xl font-black md:text-6xl">
                신고 관리
              </h1>
              <p className="mt-5 max-w-2xl leading-8 text-slate-600">
                신고 당시 게시물의 사진, 본문, 작성자를 직접 확인할 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchReports}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 px-6 py-4 font-black text-white disabled:opacity-50"
            >
              <RefreshCw
                className={`h-5 w-5 ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
              새로고침
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {[
            { label: "전체", value: counts.total },
            { label: "대기", value: counts.waiting },
            { label: "확인중", value: counts.checking },
            { label: "완료", value: counts.done },
            { label: "반려", value: counts.rejected },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-3xl bg-white p-6 shadow-lg shadow-sky-100"
            >
              <p className="text-sm font-black text-slate-400">
                {item.label}
              </p>
              <p className="mt-2 text-3xl font-black">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[32px] bg-white p-5 shadow-xl shadow-violet-100 md:p-8">
            <p className="font-black text-sky-500">Report List</p>
            <h2 className="mt-2 text-3xl font-black">신고 목록</h2>

            <div className="mt-6 grid gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-300" />
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="게시물 내용, 작성자, 신고자 검색"
                  className="w-full rounded-2xl border border-slate-200 py-4 pl-12 pr-5 font-bold outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as "전체" | ReportStatus
                  )
                }
                className="rounded-2xl border border-slate-200 px-5 py-4 font-bold"
              >
                <option value="전체">전체 상태</option>
                <option value="대기">대기</option>
                <option value="확인중">확인중</option>
                <option value="완료">완료</option>
                <option value="반려">반려</option>
              </select>
            </div>

            <div className="mt-6 max-h-[760px] space-y-4 overflow-y-auto">
              {isLoading && (
                <div className="rounded-3xl bg-slate-50 p-10 text-center">
                  <RefreshCw className="mx-auto h-10 w-10 animate-spin text-violet-300" />
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
                const thumbnail = report.postImages?.[0];
                const isSelected = selectedReport?.id === report.id;

                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className={`w-full rounded-3xl p-4 text-left transition ${
                      isSelected
                        ? "bg-violet-50 ring-2 ring-violet-300"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex gap-4">
                      {thumbnail && !isVideoUrl(thumbnail) ? (
                        <img
                          src={thumbnail}
                          alt="신고 게시물"
                          className="h-20 w-20 shrink-0 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-xs font-black text-slate-400">
                          {thumbnail ? "VIDEO" : "NO IMAGE"}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
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
                        </div>

                        <h3 className="mt-3 line-clamp-1 text-lg font-black">
                          {reportTitle(report)}
                        </h3>

                        <p className="mt-1 line-clamp-1 text-sm font-bold text-slate-400">
                          작성자:{" "}
                          {report.postAuthorName ||
                            report.reportedNickname ||
                            "-"}
                        </p>

                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                          {reportReason(report)}
                        </p>
                      </div>
                    </div>
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
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-black text-violet-500">
                      Report Detail
                    </p>
                    <h2 className="mt-2 text-3xl font-black">
                      신고 상세
                    </h2>
                    <p className="mt-2 text-sm font-bold text-slate-400">
                      접수일: {formatDate(selectedReport.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-4 py-2 text-sm font-black ${getStatusStyle(
                      selectedReport.status
                    )}`}
                  >
                    {selectedReport.status}
                  </span>
                </div>

                {selectedReport.postId && (
                  <section className="mt-8 overflow-hidden rounded-[28px] border border-slate-100 bg-slate-950">
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 text-white">
                      <div className="min-w-0">
                        <p className="text-xs font-black text-violet-300">
                          신고된 게시물
                        </p>
                        <p className="mt-1 truncate font-black">
                          {selectedReport.postAuthorName ||
                            selectedReport.reportedNickname ||
                            "작성자 정보 없음"}
                        </p>
                      </div>

                      <a
                        href={`insai://post/${selectedReport.postId}`}
                        className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-900"
                      >
                        <ExternalLink className="h-4 w-4" />
                        앱에서 열기
                      </a>
                    </div>

                    {previewImage ? (
                      isVideoUrl(previewImage) ? (
                        <video
                          src={previewImage}
                          controls
                          className="max-h-[520px] w-full bg-black object-contain"
                        />
                      ) : (
                        <img
                          src={previewImage}
                          alt="신고된 게시물"
                          className="max-h-[520px] w-full bg-black object-contain"
                        />
                      )
                    ) : (
                      <div className="flex h-56 items-center justify-center text-sm font-black text-slate-400">
                        저장된 미디어가 없습니다.
                      </div>
                    )}

                    <div className="bg-white p-5">
                      <p className="text-xs font-black text-slate-400">
                        게시물 ID: {selectedReport.postId}
                      </p>

                      <p className="mt-4 whitespace-pre-line leading-8 text-slate-700">
                        {selectedReport.postText ||
                          "게시물 본문이 없거나 신고 당시 저장되지 않았습니다."}
                      </p>

                      {selectedReport.postImages &&
                        selectedReport.postImages.length > 1 && (
                          <div className="mt-5 grid grid-cols-3 gap-3">
                            {selectedReport.postImages
                              .slice(1)
                              .map((url, index) =>
                                isVideoUrl(url) ? (
                                  <video
                                    key={`${url}-${index}`}
                                    src={url}
                                    controls
                                    className="aspect-square w-full rounded-2xl bg-black object-cover"
                                  />
                                ) : (
                                  <img
                                    key={`${url}-${index}`}
                                    src={url}
                                    alt={`신고 게시물 ${index + 2}`}
                                    className="aspect-square w-full rounded-2xl object-cover"
                                  />
                                )
                              )}
                          </div>
                        )}
                    </div>
                  </section>
                )}

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm font-black text-slate-400">
                      신고자
                    </p>
                    <p className="mt-2 font-black">
                      {selectedReport.reporterName ||
                        "신고자 정보 없음"}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-500">
                      {selectedReport.reporterEmail || "-"}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-rose-50 p-5">
                    <p className="text-sm font-black text-rose-400">
                      신고 대상
                    </p>
                    <p className="mt-2 font-black text-rose-700">
                      {selectedReport.reportedNickname ||
                        "대상 닉네임 없음"}
                    </p>
                    <p className="mt-1 text-sm font-bold text-rose-500">
                      {selectedReport.reportedUserId || "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl bg-white p-5 ring-1 ring-slate-100">
                  <p className="text-sm font-black text-slate-400">
                    신고 사유
                  </p>
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
                    onChange={(event) =>
                      setAdminNote(event.target.value)
                    }
                    rows={5}
                    className="mt-3 w-full rounded-3xl border border-slate-200 p-5 font-bold leading-7 outline-none"
                  />
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={suspendTargetUser}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-5 py-4 font-black text-white disabled:opacity-50"
                  >
                    <Ban className="h-5 w-5" />
                    계정 정지
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={deleteReport}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-200 px-5 py-4 font-black text-slate-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5" />
                    삭제
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() =>
                      updateReportStatus("확인중")
                    }
                    className="rounded-2xl bg-sky-500 px-5 py-4 font-black text-white disabled:opacity-50"
                  >
                    확인중
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => updateReportStatus("완료")}
                    className="rounded-2xl bg-emerald-500 px-5 py-4 font-black text-white disabled:opacity-50"
                  >
                    완료
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => updateReportStatus("반려")}
                    className="rounded-2xl bg-slate-950 px-5 py-4 font-black text-white disabled:opacity-50"
                  >
                    반려
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => updateReportStatus("대기")}
                    className="rounded-2xl bg-amber-500 px-5 py-4 font-black text-white disabled:opacity-50"
                  >
                    대기
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
