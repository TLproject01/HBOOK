import Link from "next/link";
import { CalendarDays, Car, DoorOpen, Users } from "lucide-react";
import { RoomBookingStatus, VehicleBookingStatus } from "@prisma/client";

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
  const quickActions = [
    { href: "/vehicles/new", label: "ขอใช้รถ", description: "ส่งคำขอใหม่ให้ผู้ดูแลพิจารณา", icon: Car },
    { href: "/rooms/new", label: "จองห้องประชุม", description: "จองห้องหรือสร้างรายการซ้ำ", icon: DoorOpen },
    { href: "/vehicles/calendar", label: "ดูตารางรถ", description: "ตรวจรถว่างและรายการใช้งาน", icon: CalendarDays },
    { href: "/rooms/calendar", label: "ดูตารางห้อง", description: "ตรวจห้องว่างตามวันและห้อง", icon: CalendarDays },
  ];
  const todayLabel = new Intl.DateTimeFormat("th-TH", {
    dateStyle: "full",
  }).format(now);

  return (
    <main className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:py-8">
      <div className="rounded-xl border border-sky-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-sky-700">ภาพรวมวันนี้</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">
              สวัสดี, {user.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {todayLabel} · ข้อมูลอัปเดตจากรายการจองจริง
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800"
              href="/vehicles/new"
            >
              ขอใช้รถ
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-100"
              href="/rooms/new"
            >
              จองห้องประชุม
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm"
              key={card.label}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-600">{card.label}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-5 font-mono text-3xl font-semibold text-slate-950">
                {card.value.toLocaleString("th-TH")}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-200 hover:bg-sky-50"
              href={action.href}
              key={action.href}
            >
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 group-hover:bg-sky-100 group-hover:text-sky-800">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-950">{action.label}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      {user.role === "ADMIN" ? (
        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">งานที่ต้องติดตาม</h2>
              <p className="mt-1 text-sm text-slate-600">
                ตรวจคำขอรออนุมัติและส่งออกรายงานสำหรับผู้ดูแล
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                href="/admin/vehicle-requests"
              >
                อนุมัติคำขอใช้รถ
              </Link>
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                href="/admin/reports"
              >
                รายงาน
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
