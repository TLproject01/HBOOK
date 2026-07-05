import { CalendarDays } from "lucide-react";

import { changePasswordAction } from "./actions";

export default function ChangePasswordPage() {
  return (
    <main className="grid min-h-screen bg-white text-slate-950 lg:grid-cols-[0.82fr_1.18fr]">
      <section className="hidden border-r border-slate-200 bg-slate-950 px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-slate-950">
            <CalendarDays aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-[0.22em]">HBOOK</p>
            <p className="text-xs text-slate-400">Account Security</p>
          </div>
        </div>
        <p className="max-w-sm text-3xl font-semibold leading-tight">
          ตั้งค่ารหัสผ่านก่อนเริ่มใช้งาน
        </p>
        <p className="text-xs text-slate-500">สำหรับบัญชีที่ต้องเปลี่ยนรหัสผ่าน</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-950 text-white">
              <CalendarDays aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-[0.22em] text-slate-950">HBOOK</p>
              <p className="text-xs text-slate-500">Account Security</p>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-950">เปลี่ยนรหัสผ่าน</h1>
            <p className="mt-1 text-sm text-slate-500">ตั้งรหัสผ่านใหม่เพื่อเข้าใช้งานต่อ</p>
          </div>

          <form action={changePasswordAction} className="space-y-4">
            {[
              ["currentPassword", "รหัสผ่านปัจจุบัน", "current-password"],
              ["newPassword", "รหัสผ่านใหม่", "new-password"],
              ["confirmPassword", "ยืนยันรหัสผ่านใหม่", "new-password"],
            ].map(([name, label, autoComplete]) => (
              <label className="block" key={name}>
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <input
                  className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-950"
                  name={name}
                  type="password"
                  autoComplete={autoComplete}
                />
              </label>
            ))}
            <button
              className="mt-2 min-h-11 w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              type="submit"
            >
              บันทึกรหัสผ่าน
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
