import { CheckCircle2, Inbox } from "lucide-react";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { getPrisma } from "@/lib/db/prisma";
import { markNotificationReadAction } from "./actions";

export default async function NotificationsPage() {
  const user = await requireCurrentUser();
  const prisma = getPrisma();
  const notifications = await prisma.notification.findMany({
    where: { recipientUserId: user.id },
    orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
  });

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
          Notifications
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Notification inbox</h1>
        <p className="mt-2 text-sm text-slate-600">
          {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
        </p>
      </div>

      <section className="space-y-3">
        {notifications.map((notification) => (
          <article
            className={`rounded-lg border p-5 shadow-sm ${
              notification.isRead
                ? "border-slate-200 bg-white"
                : "border-teal-200 bg-teal-50"
            }`}
            key={notification.id}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-950">
                    {notification.title}
                  </h2>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${
                      notification.isRead
                        ? "bg-slate-100 text-slate-700"
                        : "bg-teal-700 text-white"
                    }`}
                  >
                    {notification.isRead ? "Read" : "Unread"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{notification.message}</p>
                <p className="mt-3 text-xs text-slate-500">
                  {notification.module} - {formatDateTime(notification.createdAt)}
                </p>
              </div>

              {!notification.isRead ? (
                <form action={markNotificationReadAction}>
                  <input name="id" type="hidden" value={notification.id} />
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-teal-200 bg-white px-3 py-2 text-sm font-medium text-teal-700"
                    type="submit"
                  >
                    <CheckCircle2 aria-hidden className="h-4 w-4" />
                    Mark read
                  </button>
                </form>
              ) : null}
            </div>
          </article>
        ))}

        {notifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <Inbox aria-hidden className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-950">
              No notifications yet
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Booking updates and review decisions will appear here.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
