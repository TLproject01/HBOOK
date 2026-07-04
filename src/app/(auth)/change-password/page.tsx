import { changePasswordAction } from "./actions";

export default function ChangePasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-teal-700">HBOOK</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-950">เปลี่ยนรหัสผ่าน</h1>
      <p className="mt-2 text-sm text-slate-600">
        ตั้งรหัสผ่านใหม่ก่อนเริ่มใช้งานระบบ
      </p>
      <form action={changePasswordAction} className="mt-8 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {[
          ["currentPassword", "รหัสผ่านปัจจุบัน", "current-password"],
          ["newPassword", "รหัสผ่านใหม่", "new-password"],
          ["confirmPassword", "ยืนยันรหัสผ่านใหม่", "new-password"],
        ].map(([name, label, autoComplete]) => (
          <label className="block" key={name}>
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              name={name}
              type="password"
              autoComplete={autoComplete}
            />
          </label>
        ))}
        <button
          className="w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white"
          type="submit"
        >
          บันทึกรหัสผ่านใหม่
        </button>
      </form>
    </main>
  );
}
