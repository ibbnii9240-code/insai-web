"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  MessageSquareReply,
  Trash2,
  X,
} from "lucide-react";

type ContactStatus = "대기" | "확인중" | "완료";

type ContactItem = {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
};

type AdminContactActionsProps = {
  contact: ContactItem;
};

export default function AdminContactActions({
  contact,
}: AdminContactActionsProps) {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reply, setReply] = useState(contact.adminReply || "");

  async function updateStatus(status: ContactStatus) {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/contact/${contact.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Failed to update contact status");
      }

      router.refresh();
    } catch (error) {
      alert("문의 상태 변경 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitReply() {
    if (!reply.trim()) {
      alert("답변 내용을 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(`/api/contact/${contact.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adminReply: reply,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Failed to save reply");
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      alert("답변 저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteContact() {
    const confirmed = window.confirm("이 문의를 삭제할까요?");

    if (!confirmed) return;

    try {
      setIsLoading(true);

      const response = await fetch(`/api/contact/${contact.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Failed to delete contact");
      }

      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      alert("문의 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Eye className="h-4 w-4" />
          크게 보기 / 답변
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => updateStatus("확인중")}
          className="inline-flex items-center gap-1 rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Clock className="h-4 w-4" />
          확인중
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => updateStatus("완료")}
          className="inline-flex items-center gap-1 rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          완료 처리
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={deleteContact}
          className="inline-flex items-center gap-1 rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          삭제
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/45 px-5 backdrop-blur-sm">
          <div className="max-h-[88vh] w-full max-w-4xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl shadow-slate-900/20 md:p-8">
            <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-5">
              <div>
                <p className="font-black text-violet-500">Inquiry Detail</p>
                <h3 className="mt-2 text-3xl font-black">문의 상세보기</h3>
                <p className="mt-2 text-sm text-slate-500">
                  {contact.category} · {contact.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-2xl bg-slate-50 p-3 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-black text-slate-400">이름</p>
                <p className="mt-2 text-lg font-black">{contact.name}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-black text-slate-400">상태</p>
                <p className="mt-2 text-lg font-black">{contact.status}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-xs font-black text-slate-400">접수일</p>
                <p className="mt-2 text-lg font-black">{contact.createdAt || "-"}</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl bg-slate-50 p-6">
              <p className="font-black text-slate-700">문의 내용</p>
              <p className="mt-4 whitespace-pre-line text-xl leading-10 text-slate-800">
                {contact.message}
              </p>
            </div>

            {contact.adminReply && (
              <div className="mt-6 rounded-3xl bg-emerald-50 p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <p className="font-black text-emerald-700">관리자 답변</p>
                </div>

                <p className="mt-4 whitespace-pre-line text-lg leading-9 text-emerald-900">
                  {contact.adminReply}
                </p>

                {contact.repliedAt && (
                  <p className="mt-3 text-xs font-bold text-emerald-500">
                    답변일: {contact.repliedAt}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 rounded-3xl border border-violet-100 bg-white p-6">
              <div className="flex items-center gap-2">
                <MessageSquareReply className="h-5 w-5 text-violet-500" />
                <p className="font-black">관리자 답변 작성</p>
              </div>

              <textarea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                rows={7}
                placeholder="사용자에게 보낼 답변 내용을 입력하세요."
                className="mt-4 w-full rounded-2xl border border-slate-200 px-5 py-4 outline-none focus:border-violet-400"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={submitReply}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-violet-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <MessageSquareReply className="h-4 w-4" />
                  답변 저장 및 완료 처리
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => updateStatus("확인중")}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Clock className="h-4 w-4" />
                  확인중 처리
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={deleteContact}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
