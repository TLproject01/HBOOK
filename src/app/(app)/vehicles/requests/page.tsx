import Link from "next/link";
import { CalendarPlus, PencilLine, XCircle } from "lucide-react";
import { VehicleBookingStatus } from "@prisma/client";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { getPrisma } from "@/lib/db/prisma";
import { cancelPendingVehicleBookingAction } from "./actions";

export default async function MyVehicleRequestsPage() {
  const user = await requireCurrentUser();
  const prisma = getPrisma();
  const requests = await prisma.vehicleBooking.findMany({
    where: { requesterUserId: user.id },
    include: {
      routes: { orderBy: { sequence: "asc" } },
      vehicle: { select: { model: true, licensePlate: true } },
      assignedDriver: { select: { name: true, phone: true } },
    },
    orderBy: { startAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
            Vehicles
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">My vehicle requests</h1>
          <p className="mt-2 text-sm text-slate-600">
            Pending requests can be cancelled before admin review.
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white"
          href="/vehicles/new"
        >
          <CalendarPlus aria-hidden className="h-4 w-4" />
          Create request
        </Link>
      </div>

      <section className="space-y-4">
        {requests.map((request) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            key={request.id}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-950">
                    {request.vehicleLicensePlateSnapshot} - {request.vehicleModelSnapshot}
                  </h2>
                  <StatusBadge status={request.status} />
                  {request.needDriver ? (
                    <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
                      Driver requested
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {formatDateTime(request.startAt)} to {formatDateTime(request.endAt)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {request.startLocation} to{" "}
                  {request.routes.map((route) => route.destination).join(", ")}
                </p>
                <p className="mt-2 text-sm text-slate-600">{request.tripPurpose}</p>
              </div>

              {request.status === VehicleBookingStatus.PENDING ? (
                <div className="flex flex-wrap gap-2">
                  <Link
                    className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                    href={`/vehicles/requests/${request.id}/edit`}
                  >
                    <PencilLine aria-hidden className="h-4 w-4" />
                    Edit
                  </Link>
                  <form action={cancelPendingVehicleBookingAction}>
                    <input name="id" type="hidden" value={request.id} />
                    <button
                      className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-700"
                      type="submit"
                    >
                      <XCircle aria-hidden className="h-4 w-4" />
                      Cancel request
                    </button>
                  </form>
                </div>
              ) : null}
            </div>
          </article>
        ))}

        {requests.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-950">No vehicle requests yet</p>
            <p className="mt-2 text-sm text-slate-600">Create your first request from the calendar.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: VehicleBookingStatus }) {
  const tone = {
    PENDING: "bg-amber-50 text-amber-800",
    APPROVED: "bg-emerald-50 text-emerald-800",
    REJECTED: "bg-red-50 text-red-800",
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
