import Link from "next/link";

import { RoomCalendarClient } from "@/components/calendar/room-calendar-client";
import { getPrisma } from "@/lib/db/prisma";

export default async function RoomCalendarPage() {
  const prisma = getPrisma();
  const [rooms, bookings] = await Promise.all([
    prisma.meetingRoom.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.roomBooking.findMany({
      where: { status: "APPROVED" },
      orderBy: { startAt: "asc" },
      select: {
        id: true,
        meetingTitle: true,
        roomId: true,
        roomNameSnapshot: true,
        requesterNameSnapshot: true,
        departmentNameSnapshot: true,
        startAt: true,
        endAt: true,
        status: true,
      },
    }),
  ]);

  const events = bookings.map((booking) => ({
    id: booking.id,
    title: `${booking.meetingTitle} - ${booking.roomNameSnapshot}`,
    start: booking.startAt.toISOString(),
    end: booking.endAt.toISOString(),
    roomId: booking.roomId,
    resourceLabel: `${booking.requesterNameSnapshot}, ${booking.departmentNameSnapshot}`,
    status: booking.status,
  }));

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
            ห้องประชุม
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">ตารางห้องประชุม</h1>
          <p className="mt-2 text-sm text-slate-600">
            เลือกดูตามห้องหรือดูภาพรวมการจองที่อนุมัติแล้วทั้งหมด
          </p>
        </div>
        <Link
          className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white"
          href="/rooms/new"
        >
          จองห้องประชุม
        </Link>
      </div>
      <RoomCalendarClient events={events} rooms={rooms} />
    </main>
  );
}
