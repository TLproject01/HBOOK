import { CalendarDays, Car, DoorOpen, Users } from "lucide-react";

import { requireCurrentUser } from "@/lib/auth/current-user";

const summaryCards = [
  { label: "Pending vehicle requests", value: "0", icon: Car },
  { label: "Today vehicle bookings", value: "0", icon: CalendarDays },
  { label: "Today room bookings", value: "0", icon: DoorOpen },
  { label: "Active users", value: "0", icon: Users },
];

export default async function DashboardPage() {
  const user = await requireCurrentUser();

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Booking overview</h1>
          <p className="mt-2 text-sm text-slate-600">Signed in as {user.name}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          Notification bell foundation
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={card.label}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-600">{card.label}</p>
                <Icon aria-hidden className="h-5 w-5 text-teal-700" />
              </div>
              <p className="mt-5 font-mono text-3xl font-semibold text-slate-950">
                {card.value}
              </p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
