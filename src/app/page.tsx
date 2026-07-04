import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-12">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-teal-700">
        Internal Booking
      </p>
      <h1 className="max-w-3xl text-4xl font-semibold text-slate-950 sm:text-5xl">
        Vehicle and meeting room booking system
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
        Phase 0/1 foundation is ready: App Router, TypeScript, Prisma schema,
        domain helpers, and a clean path for the booking workflows.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white"
          href="/dashboard"
        >
          Open Dashboard
        </Link>
        <Link
          className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800"
          href="/login"
        >
          Login
        </Link>
      </div>
    </main>
  );
}
