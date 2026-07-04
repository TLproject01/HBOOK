import { changePasswordAction } from "./actions";

export default function ChangePasswordPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold text-slate-950">Change password</h1>
      <form action={changePasswordAction} className="mt-8 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        {[
          ["currentPassword", "Current password", "current-password"],
          ["newPassword", "New password", "new-password"],
          ["confirmPassword", "Confirm new password", "new-password"],
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
          Update password
        </button>
      </form>
    </main>
  );
}
