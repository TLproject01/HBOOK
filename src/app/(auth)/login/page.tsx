import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { loginAction } from "./actions";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-10">
      <section className="w-full max-w-md">
        <Link className="mb-8 inline-flex items-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-700 text-white">
            <CalendarDays aria-hidden className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold tracking-[0.18em] text-sky-800">
              HBOOK
            </span>
            <span className="block text-xs text-slate-500">ระบบจองรถและห้องประชุม</span>
          </span>
        </Link>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-slate-950">ลงชื่อเข้าใช้</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            ใช้บัญชีที่ได้รับจากผู้ดูแลระบบเพื่อเข้าสู่ HBOOK
          </p>
        </div>
        <form
          action={loginAction}
          className="space-y-5 rounded-lg border border-sky-100 bg-white p-6 shadow-sm"
        >
          <label className="block">
            <span className="text-sm font-medium text-slate-700">ชื่อผู้ใช้หรืออีเมล</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-sky-600"
              name="identifier"
              type="text"
              autoComplete="username"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">รหัสผ่าน</span>
            <input
              className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-sky-600"
              name="password"
              type="password"
              autoComplete="current-password"
            />
          </label>
          <button
            className="min-h-11 w-full rounded-md bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-800"
            type="submit"
          >
            ลงชื่อเข้าใช้
          </button>
        </form>
      </section>
    </main>
  );
}
