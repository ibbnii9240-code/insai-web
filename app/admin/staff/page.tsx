import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { ArrowLeft, Home, ShieldCheck, UserCog, Users } from "lucide-react";

function formatDate(value?: Date | string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}

export default async function AdminStaffPage() {
  const cookieStore = await cookies();

  if (cookieStore.get("insai_admin_auth")?.value !== "true") {
    redirect("/admin/login");
  }

  if (cookieStore.get("insai_admin_role")?.value !== "owner") {
    redirect("/admin");
  }

  await connectDB();

  const docs = await User.find({
    role: { $in: ["owner", "staff"] },
  })
    .sort({ role: 1, createdAt: 1 })
    .lean();

  const staff = docs.map((item: any) => ({
    id: String(item._id),
    nickname: item.nickname || item.name || "이름 없음",
    email: item.email || "이메일 없음",
    role: item.role || "staff",
    status: item.status || "active",
    provider: item.provider || "-",
    lastLoginAt: formatDate(item.lastLoginAt),
    createdAt: formatDate(item.createdAt),
  }));

  const activeCount = staff.filter((item) => item.status === "active").length;

  return (
    <main className="min-h-screen bg-[#F8FBFF] text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-6">
          <div>
            <p className="text-sm font-black text-emerald-500">Staff Management</p>
            <h1 className="text-2xl font-black">직원 관리</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black">
              <ArrowLeft className="h-4 w-4" /> 관리자 홈
            </Link>
            <Link href="/" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black">
              <Home className="h-4 w-4" /> 홈
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-sky-100">
            <Users className="h-7 w-7 text-sky-500" />
            <p className="mt-5 text-sm font-black text-slate-400">전체 운영 계정</p>
            <p className="mt-2 text-3xl font-black">{staff.length}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-emerald-100">
            <ShieldCheck className="h-7 w-7 text-emerald-500" />
            <p className="mt-5 text-sm font-black text-slate-400">활성 계정</p>
            <p className="mt-2 text-3xl font-black">{activeCount}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-lg shadow-violet-100">
            <UserCog className="h-7 w-7 text-violet-500" />
            <p className="mt-5 text-sm font-black text-slate-400">직원 계정</p>
            <p className="mt-2 text-3xl font-black">
              {staff.filter((item) => item.role === "staff").length}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-[32px] bg-white p-6 shadow-xl shadow-sky-100 md:p-8">
          <p className="font-black text-emerald-500">Staff List</p>
          <h2 className="mt-2 text-3xl font-black">운영 계정 목록</h2>
          <p className="mt-3 text-slate-500">Owner와 Staff 권한을 가진 웹 계정입니다.</p>

          <div className="mt-7 overflow-x-auto rounded-3xl border border-slate-100">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-6 bg-slate-50 px-6 py-4 text-sm font-black text-slate-500">
                <span>이름</span><span>이메일</span><span>권한</span><span>상태</span><span>최근 로그인</span><span>생성일</span>
              </div>
              {staff.map((item) => (
                <div key={item.id} className="grid grid-cols-6 items-center border-t border-slate-100 px-6 py-5 text-sm">
                  <span className="font-black">{item.nickname}</span>
                  <span className="truncate text-slate-500">{item.email}</span>
                  <span className="font-black text-violet-500">{item.role === "owner" ? "Owner" : "Staff"}</span>
                  <span className={item.status === "active" ? "font-black text-emerald-600" : "font-black text-rose-500"}>
                    {item.status === "active" ? "정상" : "정지"}
                  </span>
                  <span className="text-slate-500">{item.lastLoginAt}</span>
                  <span className="text-slate-500">{item.createdAt}</span>
                </div>
              ))}
              {staff.length === 0 && (
                <div className="px-6 py-10 text-center font-bold text-slate-500">
                  등록된 운영 계정이 없습니다.
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}