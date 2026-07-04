import { XCircle } from "lucide-react";
import { RoomBookingStatus } from "@prisma/client";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { getPrisma } from "@/lib/db/prisma";
import { cancelOwnRoomBookingAction, moveOwnRoomBookingAction } from "./actions";

export default async function MyRoomBookingsPage() {
  const user = await requireCurrentUser();
  const prisma = getPrisma();
  const [bookings, rooms] = await Promise.all([
    prisma.roomBooking.findMany({
      where: { requesterUserId: user.id },
      orderBy: { startAt: "desc" },
    }),
    prisma.meetingRoom.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
          Meeting rooms
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">My room bookings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Future approved room bookings can be cancelled when plans change.
        </p>
      </div>

      <section className="space-y-4">
        {bookings.map((booking) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={booking.id}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-950">
                    {booking.meetingTitle} - {booking.roomNameSnapshot}
                  </h2>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {formatDateTime(booking.startAt)} to {formatDateTime(booking.endAt)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Contact: {booking.contactName} - {booking.contactPhone}
                </p>
              </div>

              {booking.status === RoomBookingStatus.APPROVED &&
              booking.startAt > new Date() ? (
                <div className="w-full space-y-3 lg:w-80">
                  <form action={moveOwnRoomBookingAction} className="space-y-3">
                    <input name="id" type="hidden" value={booking.id} />
                    <RoomMoveFields booking={booking} rooms={rooms} />
                    <button
                      className="inline-flex w-full items-center justify-center rounded-md border border-teal-200 px-3 py-2 text-sm font-medium text-teal-700"
                      type="submit"
                    >
                      Move booking
                    </button>
                  </form>
                  <form action={cancelOwnRoomBookingAction} className="space-y-3">
                    <input name="id" type="hidden" value={booking.id} />
                    <textarea
                      className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      name="cancelReason"
                      placeholder="Cancel reason"
                      required
                    />
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700"
                      type="submit"
                    >
                      <XCircle aria-hidden className="h-4 w-4" />
                      Cancel booking
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function RoomMoveFields({
  booking,
  rooms,
}: {
  booking: { endAt: Date; roomId: string; startAt: Date };
  rooms: Array<{ id: string; name: string }>;
}) {
  return (
    <>
      <select
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        defaultValue={booking.roomId}
        name="roomId"
        required
      >
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>
      <input
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        defaultValue={toDateTimeLocalValue(booking.startAt)}
        name="startAt"
        required
        type="datetime-local"
      />
      <input
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        defaultValue={toDateTimeLocalValue(booking.endAt)}
        name="endAt"
        required
        type="datetime-local"
      />
    </>
  );
}

function toDateTimeLocalValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function StatusBadge({ status }: { status: RoomBookingStatus }) {
  const tone = {
    APPROVED: "bg-emerald-50 text-emerald-800",
    CANCELLED: "bg-slate-100 text-slate-700",
  }[status];

  return <span className={`rounded-md px-2 py-1 text-xs font-medium ${tone}`}>{status}</span>;
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
