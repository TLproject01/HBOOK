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
          ผู้ดูแลระบบ
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          อนุมัติคำขอใช้รถ
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          ตรวจคำขอที่รออนุมัติ มอบหมายคนขับ ย้ายเวลา หรือยกเลิกรายการที่อนุมัติแล้ว
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
                        ขอคนขับ
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        ขับเอง
                      </span>
                    )}
                  </div>

                  <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <Detail label="ผู้ขอ" value={request.requesterNameSnapshot} />
                    <Detail label="หน่วยงาน" value={request.departmentNameSnapshot} />
                    <Detail label="เริ่ม" value={formatDateTime(request.startAt)} />
                    <Detail label="สิ้นสุด" value={formatDateTime(request.endAt)} />
                    <Detail label="ผู้โดยสาร" value={String(request.passengerCount)} />
                    <Detail label="ติดต่อ" value={`${request.contactName} - ${request.contactPhone}`} />
                    <Detail label="จุดเริ่มต้น" value={request.startLocation} />
                    <Detail
                      label="ปลายทาง"
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
                              มอบหมายคนขับ
                            </span>
                            <select
                              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                              name="assignedDriverId"
                              required
                            >
                              <option value="">เลือกคนขับ</option>
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
                          อนุมัติ
                        </button>
                      </form>

                      <form action={rejectVehicleBookingAction} className="space-y-3">
                        <input name="id" type="hidden" value={request.id} />
                        <label className="block">
                          <span className="text-sm font-medium text-slate-700">
                            เหตุผลที่ไม่อนุมัติ
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
                          ไม่อนุมัติ
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
                            เปลี่ยนรถ
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
                            label="เวลาเริ่มใหม่"
                            name="startAt"
                            type="datetime-local"
                          />
                          <Field
                            defaultValue={toDateTimeLocalValue(request.endAt)}
                            label="เวลาสิ้นสุดใหม่"
                            name="endAt"
                            type="datetime-local"
                          />
                        </div>
                        <Field
                          defaultValue={String(request.passengerCount)}
                          label="ผู้โดยสาร"
                          name="passengerCount"
                          type="number"
                        />
                        <label className="block">
                          <span className="text-sm font-medium text-slate-700">
                            มอบหมายคนขับ
                          </span>
                          <select
                            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                            defaultValue={request.assignedDriverId ?? ""}
                            name="assignedDriverId"
                          >
                            <option value="">ไม่ใช้คนขับ</option>
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
                          บันทึกการย้ายรายการ
                        </button>
                      </form>

                      <form action={cancelVehicleBookingByAdminAction} className="space-y-3">
                        <input name="id" type="hidden" value={request.id} />
                        <label className="block">
                          <span className="text-sm font-medium text-slate-700">
                            เหตุผลที่ยกเลิก
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
                          ยกเลิกรายการ
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
              ไม่มีคำขอใช้รถที่รอดำเนินการ
            </p>
            <p className="mt-2 text-sm text-slate-600">
              คำขอใหม่และรายการอนุมัติในอนาคตจะแสดงที่นี่
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

  const label = {
    APPROVED: "อนุมัติแล้ว",
    CANCELLED: "ยกเลิกแล้ว",
    PENDING: "รออนุมัติ",
    REJECTED: "ไม่อนุมัติ",
  }[status];

  return <span className={`rounded-md px-2 py-1 text-xs font-medium ${tone}`}>{label}</span>;
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
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
