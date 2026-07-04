import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PencilLine } from "lucide-react";
import { DriverOption, VehicleBookingStatus } from "@prisma/client";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { getPrisma } from "@/lib/db/prisma";
import { updateVehicleBookingAction } from "./actions";

export default async function EditVehicleRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, requireCurrentUser()]);
  const prisma = getPrisma();
  const [booking, vehicles] = await Promise.all([
    prisma.vehicleBooking.findFirst({
      where: {
        id,
        requesterUserId: user.id,
        status: VehicleBookingStatus.PENDING,
      },
      include: { routes: { orderBy: { sequence: "asc" } } },
    }),
    prisma.vehicle.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: [{ licensePlate: "asc" }],
    }),
  ]);

  if (!booking) {
    notFound();
  }

  const routeValues = [
    ...booking.routes.map((route) => route.destination),
    "",
    "",
    "",
  ].slice(0, 3);

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          href="/vehicles/requests"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          Back to my requests
        </Link>
        <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
          Vehicles
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Edit pending vehicle request
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Changes are allowed only before admin review.
        </p>
      </div>

      <form
        action={updateVehicleBookingAction}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <input name="id" type="hidden" value={booking.id} />
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-700">
            <PencilLine aria-hidden className="h-5 w-5" />
          </span>
          <h2 className="text-base font-semibold text-slate-950">Trip details</h2>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Vehicle</span>
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              defaultValue={booking.vehicleId}
              name="vehicleId"
              required
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.licensePlate} - {vehicle.model}, {vehicle.seatCapacity} seats,{" "}
                  {vehicle.driverOption === DriverOption.SELF_DRIVE_ONLY
                    ? "self-drive only"
                    : "driver or self-drive"}
                </option>
              ))}
            </select>
          </label>

          <Field
            defaultValue={toDateTimeLocalValue(booking.startAt)}
            label="Start datetime"
            name="startAt"
            type="datetime-local"
          />
          <Field
            defaultValue={toDateTimeLocalValue(booking.endAt)}
            label="End datetime"
            name="endAt"
            type="datetime-local"
          />
          <Field
            defaultValue={String(booking.passengerCount)}
            label="Passenger count"
            name="passengerCount"
            type="number"
          />
          <label className="flex min-h-10 items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <input
              className="h-4 w-4"
              defaultChecked={booking.needDriver}
              name="needDriver"
              type="checkbox"
            />
            Need driver
          </label>

          <Field
            className="md:col-span-2"
            defaultValue={booking.startLocation}
            label="Start location"
            name="startLocation"
          />

          <div className="space-y-3 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Route destinations</span>
            {routeValues.map((destination, index) => (
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                defaultValue={destination}
                key={index}
                name="destinations"
                placeholder={index === 0 ? "Required destination" : "Optional destination"}
                required={index === 0}
                type="text"
              />
            ))}
          </div>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Trip purpose</span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2"
              defaultValue={booking.tripPurpose}
              name="tripPurpose"
              required
            />
          </label>

          <Field defaultValue={booking.contactName} label="Contact name" name="contactName" />
          <Field defaultValue={booking.contactPhone} label="Contact phone" name="contactPhone" />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
            href="/vehicles/requests"
          >
            Cancel
          </Link>
          <button
            className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white"
            type="submit"
          >
            Save changes
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  className,
  defaultValue,
  label,
  name,
  type = "text",
}: {
  className?: string;
  defaultValue: string;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className={className}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
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
