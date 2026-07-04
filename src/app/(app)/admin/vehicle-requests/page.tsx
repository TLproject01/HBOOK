import { CheckCircle2, XCircle } from "lucide-react";
import { DriverOption, VehicleBookingStatus } from "@prisma/client";

import { getPrisma } from "@/lib/db/prisma";
import {
  approveVehicleBookingAction,
  cancelVehicleBookingByAdminAction,
  moveVehicleBookingByAdminAction,
  rejectVehicleBookingAction,
} from "./actions";

export default async function AdminVehicleRequestsPage() {
  const prisma = getPrisma();
  const [requests, mappings, vehicles] = await Promise.all([
    prisma.vehicleBooking.findMany({
      where: { status: { in: [VehicleBookingStatus.PENDING, VehicleBookingStatus.APPROVED] } },
      include: {
        requester: { select: { name: true, department: { select: { name: true } } } },
        routes: { orderBy: { sequence: "asc" } },
        vehicle: { select: { id: true, driverOption: true, licensePlate: true, model: true } },
      },
      orderBy: [{ status: "desc" }, { startAt: "asc" }],
    }),
    prisma.driverVehicleMapping.findMany({
      where: {
        driver: {
          isActive: true,
          deletedAt: null,
        },
        vehicle: {
          isActive: true,
          deletedAt: null,
        },
      },
      include: { driver: true },
      orderBy: { driver: { name: "asc" } },
    }),
    prisma.vehicle.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { licensePlate: "asc" },
    }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Vehicle request review
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Approve pending requests, assign mapped drivers when needed, or reject requests
          with a reason.
        </p>
      </div>

      <section className="space-y-4">
        {requests.map((request) => {
          const mappedDrivers = mappings.filter(
            (mapping) => mapping.vehicleId === request.vehicleId,
          );
          const isPending = request.status === VehicleBookingStatus.PENDING;
          const isApproved = request.status === VehicleBookingStatus.APPROVED;
          const requiresDriver =
            request.needDriver &&
            request.vehicle.driverOption === DriverOption.DRIVER_OR_SELF_DRIVE;

          return (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={request.id}
            >
              <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-950">
                      {request.vehicleLicensePlateSnapshot} -{" "}
                      {request.vehicleModelSnapshot}
                    </h2>
                    <StatusBadge status={request.status} />
                    {request.needDriver ? (
                      <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
                        Driver requested
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        Self-drive
                      </span>
                    )}
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <Detail label="Requester" value={request.requesterNameSnapshot} />
                    <Detail label="Department" value={request.departmentNameSnapshot} />
                    <Detail label="Start" value={formatDateTime(request.startAt)} />
                    <Detail label="End" value={formatDateTime(request.endAt)} />
                    <Detail label="Passengers" value={String(request.passengerCount)} />
                    <Detail label="Contact" value={`${request.contactName} - ${request.contactPhone}`} />
                    <Detail label="Start location" value={request.startLocation} />
                    <Detail
                      label="Destinations"
                      value={request.routes.map((route) => route.destination).join(", ")}
                    />
                  </dl>

                  <p className="mt-4 text-sm text-slate-700">{request.tripPurpose}</p>
                </div>

                <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4">
                  {isPending ? (
                    <>
                      <form action={approveVehicleBookingAction} className="space-y-3">
                        <input name="id" type="hidden" value={request.id} />
                        {requiresDriver ? (
                          <label className="block">
                            <span className="text-sm font-medium text-slate-700">
                              Assign driver
                            </span>
                            <select
                              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                              name="assignedDriverId"
                              required
                            >
                              <option value="">Select driver</option>
                              {mappedDrivers.map((mapping) => (
                                <option key={mapping.driverId} value={mapping.driverId}>
                                  {mapping.driver.name} - {mapping.driver.phone}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : null}
                        <button
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white"
                          type="submit"
                        >
                          <CheckCircle2 aria-hidden className="h-4 w-4" />
                          Approve
                        </button>
                      </form>

                      <form action={rejectVehicleBookingAction} className="space-y-3">
                        <input name="id" type="hidden" value={request.id} />
                        <label className="block">
                          <span className="text-sm font-medium text-slate-700">
                            Reject reason
                          </span>
                          <textarea
                            className="mt-2 min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                            name="rejectReason"
                            required
                          />
                        </label>
                        <button
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700"
                          type="submit"
                        >
                          <XCircle aria-hidden className="h-4 w-4" />
                          Reject
                        </button>
                      </form>
                    </>
                  ) : null}

                  {isApproved ? (
                    <>
                      <form action={moveVehicleBookingByAdminAction} className="space-y-3">
                        <input name="id" type="hidden" value={request.id} />
                        <label className="block">
                          <span className="text-sm font-medium text-slate-700">
                            Move vehicle
                          </span>
                          <select
                            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                            defaultValue={request.vehicleId}
                            name="vehicleId"
                            required
                          >
                            {vehicles.map((vehicle) => (
                              <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.licensePlate} - {vehicle.model}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field
                            defaultValue={toDateTimeLocalValue(request.startAt)}
                            label="Move start"
                            name="startAt"
                            type="datetime-local"
                          />
                          <Field
                            defaultValue={toDateTimeLocalValue(request.endAt)}
                            label="Move end"
                            name="endAt"
                            type="datetime-local"
                          />
                        </div>
                        <Field
                          defaultValue={String(request.passengerCount)}
                          label="Passengers"
                          name="passengerCount"
                          type="number"
                        />
                        <label className="block">
                          <span className="text-sm font-medium text-slate-700">
                            Assign driver
                          </span>
                          <select
                            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                            defaultValue={request.assignedDriverId ?? ""}
                            name="assignedDriverId"
                          >
                            <option value="">No driver</option>
                            {mappedDrivers.map((mapping) => (
                              <option key={mapping.driverId} value={mapping.driverId}>
                                {mapping.driver.name} - {mapping.driver.phone}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-teal-200 bg-white px-4 py-2.5 text-sm font-medium text-teal-700"
                          type="submit"
                        >
                          <CheckCircle2 aria-hidden className="h-4 w-4" />
                          Move booking
                        </button>
                      </form>

                      <form action={cancelVehicleBookingByAdminAction} className="space-y-3">
                        <input name="id" type="hidden" value={request.id} />
                        <label className="block">
                          <span className="text-sm font-medium text-slate-700">
                            Cancel reason
                          </span>
                          <textarea
                            className="mt-2 min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                            name="cancelReason"
                            required
                          />
                        </label>
                        <button
                          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700"
                          type="submit"
                        >
                          <XCircle aria-hidden className="h-4 w-4" />
                          Cancel booking
                        </button>
                      </form>
                    </>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}

        {requests.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-sm font-medium text-slate-950">
              No pending or approved vehicle requests
            </p>
            <p className="mt-2 text-sm text-slate-600">
              New user-created requests and approved future bookings will appear here.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: VehicleBookingStatus }) {
  const tone = {
    APPROVED: "bg-emerald-50 text-emerald-800",
    CANCELLED: "bg-slate-100 text-slate-700",
    PENDING: "bg-amber-50 text-amber-800",
    REJECTED: "bg-red-50 text-red-800",
  }[status];

  return <span className={`rounded-md px-2 py-1 text-xs font-medium ${tone}`}>{status}</span>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-slate-800">{value}</dd>
    </div>
  );
}

function Field({
  defaultValue,
  label,
  name,
  type = "text",
}: {
  defaultValue: string;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        defaultValue={defaultValue}
        name={name}
        required
        type={type}
      />
    </label>
  );
}

function toDateTimeLocalValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
