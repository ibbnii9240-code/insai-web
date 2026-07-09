import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

async function loginAction(formData: FormData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");

  let role: "owner" | "staff" | null = null;

  if (
    email === process.env.OWNER_EMAIL &&
    password === process.env.OWNER_PASSWORD
  ) {
    role = "owner";
  }

  if (
    email === process.env.STAFF_EMAIL &&
    password === process.env.STAFF_PASSWORD
  ) {
    role = "staff";
  }

  if (role) {
    const cookieStore = await cookies();

    cookieStore.set("insai_admin_auth", "true", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    cookieStore.set("insai_admin_role", role, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    redirect("/admin");
  }

  redirect("/admin/login?error=1");
}

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("insai_admin_auth")?.value;

  if (isAdmin === "true") {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FBFF] px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-100px] top-20 h-[300px] w-[300px] rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-[-100px] bottom-20 h-[350px] w-[350px] rounded-full bg-violet-200/40 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[36px] bg-white p-10 shadow-2xl shadow-sky-100">
          <div className="flex flex-col items-center">
            <Image
              src="/insai-logo.png"
              alt="insai logo"
              width={70}
              height={70}
              className="rounded-2xl"
              priority
            />

            <h1 className="mt-5 text-4xl font-black">Admin Login</h1>

            <p className="mt-3 text-center text-slate-500">
              오너 또는 직원 관리자 계정으로 로그인하세요.
            </p>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="font-black text-emerald-600">Owner</p>
              <p className="mt-2 text-xs leading-5 text-emerald-700">
                매출, 수익, 구독, 운영 관리 전체 접근
              </p>
            </div>

            <div className="rounded-2xl bg-violet-50 p-4">
              <p className="font-black text-violet-600">Staff</p>
              <p className="mt-2 text-xs leading-5 text-violet-700">
                신고, 문의, 유저 판결 중심 접근
              </p>
            </div>
          </div>

          <form action={loginAction} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                관리자 이메일
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4">
                <Mail className="h-5 w-5 text-slate-400" />

                <input
                  name="email"
                  type="email"
                  placeholder="owner@insai.app 또는 staff@insai.app"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-slate-700">
                비밀번호
              </label>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-4">
                <Lock className="h-5 w-5 text-slate-400" />

                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 to-violet-500 py-4 font-bold text-white shadow-lg shadow-violet-200 transition hover:scale-[1.02]"
            >
              로그인
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-violet-500" />

              <span className="font-black text-slate-800">보안 안내</span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              오너와 직원 권한은 분리됩니다.
              <br />
              직원 계정은 매출/수익 정보를 볼 수 없습니다.
            </p>
          </div>

          <Link
            href="/"
            className="mt-6 block text-center text-sm font-bold text-violet-500"
          >
            ← 홈페이지로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
