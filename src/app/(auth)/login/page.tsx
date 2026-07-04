import { loginAction } from "./actions";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold text-slate-950">Sign in</h1>
      <form action={loginAction} className="mt-8 space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Username or email</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            name="identifier"
            type="text"
            autoComplete="username"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
            name="password"
            type="password"
            autoComplete="current-password"
          />
        </label>
        <button
          className="w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white"
          type="submit"
        >
          Login
        </button>
      </form>
    </main>
  );
}
