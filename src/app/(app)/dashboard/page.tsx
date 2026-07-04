import { CalendarDays, Car, DoorOpen, Users } from "lucide-react";
import { VehicleBookingStatus, RoomBookingStatus } from "@prisma/client";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { getPrisma } from "@/lib/db/prisma";

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const prisma = getPrisma();
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const [
    pendingVehicleRequests,
    todayVehicleBookings,
    todayRoomBookings,
    activeUsers,
  ] = await Promise.all([
    prisma.vehicleBooking.count({
      where: { status: VehicleBookingStatus.PENDING },
    }),
    prisma.vehicleBooking.count({
      where: {
        status: VehicleBookingStatus.APPROVED,
        startAt: { lte: endOfDay },
        endAt: { gte: startOfDay },
      },
    }),
    prisma.roomBooking.count({
      where: {
        status: RoomBookingStatus.APPROVED,
        startAt: { lte: endOfDay },
        endAt: { gte: startOfDay },
      },
    }),
    prisma.user.count({
      where: { isActive: true, deletedAt: null },
    }),
  ]);

  const summaryCards = [
    { label: "คำขอใช้รถรออนุมัติ", value: pendingVehicleRequests, icon: Car },
    { label: "รายการใช้รถวันนี้", value: todayVehicleBookings, icon: CalendarDays },
    { label: "การจองห้องวันนี้", value: todayRoomBookings, icon: DoorOpen },
    { label: "ผู้ใช้งานที่เปิดใช้งาน", value: activeUsers, icon: Users },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
            HBOOK
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">ภาพรวมการจอง</h1>
          <p className="mt-2 text-sm text-slate-600">ลงชื่อเข้าใช้ในชื่อ {user.name}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          ข้อมูลอัปเดตตามรายการจองจริง
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
                {card.value.toLocaleString("th-TH")}
              </p>
            </article>
          );
        })}
      </section>
    </main>
  );
}
