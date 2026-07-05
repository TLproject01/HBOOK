import { CalendarDays } from "lucide-react";

import { changePasswordAction } from "./actions";

export default function ChangePasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-700 text-white">
            <CalendarDays aria-hidden className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-sky-800">HBOOK</p>
            <p className="text-xs text-slate-500">ตั้งค่าความปลอดภัยบัญชี</p>
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-slate-950">เปลี่ยนรหัสผ่าน</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          ตั้งรหัสผ่านใหม่ก่อนเริ่มใช้งานระบบ
        </p>
        <form
          action={changePasswordAction}
          className="mt-8 space-y-5 rounded-lg border border-sky-100 bg-white p-6 shadow-sm"
        >
          {[
            ["currentPassword", "รหัสผ่านปัจจุบัน", "current-password"],
            ["newPassword", "รหัสผ่านใหม่", "new-password"],
            ["confirmPassword", "ยืนยันรหัสผ่านใหม่", "new-password"],
          ].map(([name, label, autoComplete]) => (
            <label className="block" key={name}>
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none focus:border-sky-600"
                name={name}
                type="password"
                autoComplete={autoComplete}
              />
            </label>
          ))}
          <button
            className="min-h-11 w-full rounded-md bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-800"
            type="submit"
          >
            บันทึกรหัสผ่านใหม่
          </button>
        </form>
      </section>
    </main>
  );
}
