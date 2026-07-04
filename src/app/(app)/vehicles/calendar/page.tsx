import Link from "next/link";

import { BookingCalendar } from "@/components/calendar/booking-calendar";
import { getPrisma } from "@/lib/db/prisma";

export default async function VehicleCalendarPage() {
  const prisma = getPrisma();
  const bookings = await prisma.vehicleBooking.findMany({
    where: { status: { in: ["PENDING", "APPROVED"] } },
    orderBy: { startAt: "asc" },
    select: {
      id: true,
      requesterNameSnapshot: true,
      departmentNameSnapshot: true,
      vehicleLicensePlateSnapshot: true,
      vehicleModelSnapshot: true,
      startAt: true,
      endAt: true,
      status: true,
    },
  });
  const events = bookings.map((booking) => ({
    id: booking.id,
    title: `${booking.vehicleLicensePlateSnapshot} - ${booking.requesterNameSnapshot}`,
    start: booking.startAt,
    end: booking.endAt,
    resourceLabel: `${booking.departmentNameSnapshot}, ${booking.vehicleModelSnapshot}`,
    status: booking.status,
  }));

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
            รถส่วนกลาง
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">ตารางใช้รถ</h1>
          <p className="mt-2 text-sm text-slate-600">
            ตรวจสอบช่วงเวลาที่มีคำขอรออนุมัติและรายการใช้รถที่อนุมัติแล้ว
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
            href="/vehicles/requests"
          >
            คำขอของฉัน
          </Link>
          <Link
            className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white"
            href="/vehicles/new"
          >
            ขอใช้รถ
          </Link>
        </div>
      </div>
      <BookingCalendar emptyMessage="ยังไม่มีคำขอใช้รถหรือรายการใช้รถที่อนุมัติแล้ว" events={events} />
    </main>
  );
}
