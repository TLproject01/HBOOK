import { CalendarDays } from "lucide-react";

import { loginAction } from "./actions";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  "auth-service": "ระบบยืนยันตัวตนไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้ง",
  database: "ระบบเชื่อมต่อฐานข้อมูลไม่ได้ กรุณาแจ้งผู้ดูแลระบบ",
  "invalid-credentials": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
  "invalid-input": "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorMessage = params?.error ? errorMessages[params.error] : null;

  return (
    <main className="grid min-h-screen bg-white text-slate-950 lg:grid-cols-[0.82fr_1.18fr]">
      <section className="hidden border-r border-slate-200 bg-slate-950 px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-950">
            <CalendarDays aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-[0.22em]">HBOOK</p>
            <p className="text-xs text-slate-400">Internal Operations</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
            Vehicle / Room
          </p>
          <p className="mt-4 max-w-sm text-3xl font-semibold leading-tight">
            ระบบจองสำหรับงานภายในองค์กร
          </p>
        </div>

        <p className="text-xs text-slate-500">สำหรับผู้ใช้งานที่ได้รับสิทธิ์เท่านั้น</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
              <CalendarDays aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-[0.22em] text-slate-950">HBOOK</p>
              <p className="text-xs text-slate-500">ระบบจองภายในองค์กร</p>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-950">HBOOK</h1>
            <p className="mt-1 text-sm text-slate-500">กรอกบัญชีเพื่อเข้าใช้งาน</p>
          </div>

          {errorMessage ? (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form action={loginAction} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">ชื่อผู้ใช้หรืออีเมล</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                name="identifier"
                type="text"
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">รหัสผ่าน</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                name="password"
                type="password"
                autoComplete="current-password"
              />
            </label>
            <button
              className="mt-2 min-h-11 w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              type="submit"
            >
              เข้าใช้งาน
            </button>
          </form>

          <p className="mt-6 text-xs text-slate-500">
            หากเข้าใช้งานไม่ได้ กรุณาติดต่อผู้ดูแลระบบ
          </p>
        </div>
      </section>
    </main>
  );
}
