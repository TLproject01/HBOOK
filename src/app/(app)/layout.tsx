import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarDays,
  Car,
  ClipboardCheck,
  Download,
  DoorOpen,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/dashboard", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/vehicles/calendar", label: "ตารางรถ", icon: Car },
  { href: "/vehicles/requests", label: "คำขอใช้รถของฉัน", icon: Car },
  { href: "/rooms/calendar", label: "ตารางห้องประชุม", icon: DoorOpen },
  { href: "/rooms/bookings", label: "การจองห้องของฉัน", icon: DoorOpen },
  { href: "/notifications", label: "แจ้งเตือน", icon: Bell },
  { href: "/admin/vehicle-requests", label: "อนุมัติคำขอใช้รถ", icon: ClipboardCheck },
  { href: "/admin/room-bookings", label: "จัดการจองห้อง", icon: ClipboardCheck },
  { href: "/admin/reports", label: "รายงาน", icon: Download },
  { href: "/admin/users", label: "ผู้ใช้งาน", icon: Settings },
  { href: "/admin/departments", label: "หน่วยงาน", icon: Building2 },
  { href: "/admin/vehicles", label: "ข้อมูลรถ", icon: Car },
  { href: "/admin/drivers", label: "ข้อมูลคนขับ", icon: Settings },
  { href: "/admin/rooms", label: "ข้อมูลห้องประชุม", icon: DoorOpen },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUser();

  if (user.mustChangePassword) {
    redirect("/change-password");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link className="flex items-center gap-2" href="/dashboard">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-700 text-white">
              <CalendarDays aria-hidden className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">HBOOK</span>
              <span className="block text-xs text-slate-500">รถและห้องประชุม</span>
            </span>
          </Link>
          <form action={logoutAction}>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 text-slate-700"
              title="ออกจากระบบ"
              type="submit"
            >
              <LogOut aria-hidden className="h-4 w-4" />
            </button>
          </form>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden className="h-4 w-4 text-slate-500" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <Link className="flex items-center gap-3" href="/dashboard">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-700 text-white">
            <CalendarDays aria-hidden className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">HBOOK</span>
            <span className="block text-xs text-slate-500">รถและห้องประชุม</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden className="h-4 w-4 text-slate-500" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-5 bottom-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">{user.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {user.role} - {user.department.name}
          </p>
          <form action={logoutAction} className="mt-4">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
              type="submit"
            >
              <LogOut aria-hidden className="h-4 w-4" />
              ออกจากระบบ
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-72">{children}</div>
    </div>
  );
}
