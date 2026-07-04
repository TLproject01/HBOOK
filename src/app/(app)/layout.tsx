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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vehicles/calendar", label: "Vehicles", icon: Car },
  { href: "/vehicles/requests", label: "My vehicle requests", icon: Car },
  { href: "/rooms/calendar", label: "Meeting rooms", icon: DoorOpen },
  { href: "/rooms/bookings", label: "My room bookings", icon: DoorOpen },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/vehicle-requests", label: "Vehicle reviews", icon: ClipboardCheck },
  { href: "/admin/room-bookings", label: "Room reviews", icon: ClipboardCheck },
  { href: "/admin/reports", label: "Reports", icon: Download },
  { href: "/admin/users", label: "Users", icon: Settings },
  { href: "/admin/departments", label: "Departments", icon: Building2 },
  { href: "/admin/vehicles", label: "Vehicle master", icon: Car },
  { href: "/admin/drivers", label: "Driver master", icon: Settings },
  { href: "/admin/rooms", label: "Room master", icon: DoorOpen },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUser();

  if (user.mustChangePassword) {
    redirect("/change-password");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <Link className="flex items-center gap-3" href="/dashboard">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-700 text-white">
            <CalendarDays aria-hidden className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Booking System</span>
            <span className="block text-xs text-slate-500">Vehicle and rooms</span>
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
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="lg:pl-72">{children}</div>
    </div>
  );
}
