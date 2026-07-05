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
  PlusCircle,
  Settings,
  Users,
} from "lucide-react";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { logoutAction } from "./actions";

export const dynamic = "force-dynamic";

const navGroups = [
  {
    label: "งานประจำ",
    items: [
      { href: "/dashboard", label: "ภาพรวม", icon: LayoutDashboard },
      { href: "/vehicles/new", label: "ขอใช้รถ", icon: PlusCircle },
      { href: "/vehicles/calendar", label: "ตารางรถ", icon: Car },
      { href: "/vehicles/requests", label: "คำขอใช้รถของฉัน", icon: ClipboardCheck },
      { href: "/rooms/new", label: "จองห้องประชุม", icon: PlusCircle },
      { href: "/rooms/calendar", label: "ตารางห้องประชุม", icon: DoorOpen },
      { href: "/rooms/bookings", label: "การจองห้องของฉัน", icon: ClipboardCheck },
      { href: "/notifications", label: "แจ้งเตือน", icon: Bell },
    ],
  },
  {
    adminOnly: true,
    label: "งานผู้ดูแล",
    items: [
      { href: "/admin/vehicle-requests", label: "อนุมัติคำขอใช้รถ", icon: ClipboardCheck },
      { href: "/admin/room-bookings", label: "จัดการจองห้อง", icon: CalendarDays },
      { href: "/admin/reports", label: "รายงาน", icon: Download },
    ],
  },
  {
    adminOnly: true,
    label: "ข้อมูลหลัก",
    items: [
      { href: "/admin/users", label: "ผู้ใช้งาน", icon: Users },
      { href: "/admin/departments", label: "หน่วยงาน", icon: Building2 },
      { href: "/admin/vehicles", label: "รถ", icon: Car },
      { href: "/admin/drivers", label: "คนขับ", icon: Settings },
      { href: "/admin/rooms", label: "ห้องประชุม", icon: DoorOpen },
    ],
  },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUser();

  if (user.mustChangePassword) {
    redirect("/change-password");
  }

  const visibleGroups = navGroups.filter((group) => !group.adminOnly || user.role === "ADMIN");
  const mobileNavItems = visibleGroups.flatMap((group) => group.items);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950 text-white lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <Link className="flex items-center gap-2" href="/dashboard">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-600 text-white">
              <CalendarDays aria-hidden className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold">HBOOK</span>
              <span className="block text-xs text-slate-300">รถและห้องประชุม</span>
            </span>
          </Link>
          <form action={logoutAction}>
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-slate-100 hover:bg-white/10"
              title="ออกจากระบบ"
              type="submit"
            >
              <LogOut aria-hidden className="h-4 w-4" />
            </button>
          </form>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-white/10"
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden className="h-4 w-4 text-sky-200" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-900 bg-slate-950 px-5 py-6 text-white lg:block">
        <Link className="flex items-center gap-3" href="/dashboard">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-600 text-white">
            <CalendarDays aria-hidden className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">HBOOK</span>
            <span className="block text-xs text-slate-400">Operations Console</span>
          </span>
        </Link>

        <nav className="mt-8 space-y-6">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {group.label}
              </p>
              <div className="mt-2 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      className="flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white"
                      href={item.href}
                      key={item.href}
                    >
                      <Icon aria-hidden className="h-4 w-4 text-sky-300" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="absolute inset-x-5 bottom-6 rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="mt-1 text-xs text-slate-400">
            {user.role} - {user.department.name}
          </p>
          <form action={logoutAction} className="mt-4">
            <button
              className="flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-sky-50"
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
