import { Car, Power, Trash2 } from "lucide-react";
import { DriverOption } from "@prisma/client";

import { getPrisma } from "@/lib/db/prisma";
import {
  createVehicleAction,
  softDeleteVehicleAction,
  toggleVehicleStatusAction,
  updateVehicleAction,
} from "./actions";

export default async function VehiclesPage() {
  const prisma = getPrisma();
  const vehicles = await prisma.vehicle.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { driverMappings: true, bookings: true } },
    },
    orderBy: [{ isActive: "desc" }, { licensePlate: "asc" }],
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
          ผู้ดูแลระบบ
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">ข้อมูลรถ</h1>
        <p className="mt-2 text-sm text-slate-600">
          จัดการทะเบียนรถ จำนวนที่นั่ง รูปภาพ และสถานะพร้อมใช้งาน
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          action={createVehicleAction}
          className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          encType="multipart/form-data"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-700">
              <Car aria-hidden className="h-5 w-5" />
            </span>
            <h2 className="text-base font-semibold text-slate-950">เพิ่มรถ</h2>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="รุ่นรถ" name="model" />
            <Field label="สี" name="color" />
            <Field label="ทะเบียนรถ" name="licensePlate" />
            <Field label="จำนวนที่นั่ง" name="seatCapacity" type="number" />
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">รูปแบบการใช้รถ</span>
              <select
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                name="driverOption"
              >
                <option value={DriverOption.SELF_DRIVE_ONLY}>ขับเองเท่านั้น</option>
                <option value={DriverOption.DRIVER_OR_SELF_DRIVE}>
                  ขอคนขับหรือขับเองได้
                </option>
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-slate-700">รูปถ่ายรถ</span>
              <input
                accept="image/jpeg,image/png,image/webp"
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                name="photo"
                type="file"
              />
            </label>
          </div>

          <button
            className="mt-5 w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white"
            type="submit"
          >
            เพิ่มรถ
          </button>
        </form>

        <div className="grid gap-4">
          {vehicles.map((vehicle) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={vehicle.id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-950">
                      {vehicle.licensePlate}
                    </h2>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {vehicle.isActive ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {vehicle.driverOption === DriverOption.SELF_DRIVE_ONLY
                        ? "ขับเองเท่านั้น"
                        : "ขอคนขับหรือขับเองได้"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {vehicle.model} · {vehicle.color} · {vehicle.seatCapacity} seats
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {vehicle._count.driverMappings} mapped driver
                    {vehicle._count.driverMappings === 1 ? "" : "s"} · {vehicle._count.bookings} booking
                    {vehicle._count.bookings === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="flex justify-start gap-2 lg:justify-end">
                  <form action={toggleVehicleStatusAction}>
                    <input name="id" type="hidden" value={vehicle.id} />
                    <IconButton
                      label={vehicle.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                      tone="neutral"
                    >
                      <Power aria-hidden className="h-4 w-4" />
                    </IconButton>
                  </form>
                  <form action={softDeleteVehicleAction}>
                    <input name="id" type="hidden" value={vehicle.id} />
                    <IconButton label="ลบรถ" tone="danger">
                      <Trash2 aria-hidden className="h-4 w-4" />
                    </IconButton>
                  </form>
                </div>
              </div>
              <form
                action={updateVehicleAction}
                className="mt-5 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2"
                encType="multipart/form-data"
              >
                <input name="id" type="hidden" value={vehicle.id} />
                <Field defaultValue={vehicle.model} label="รุ่นรถ" name="model" />
                <Field defaultValue={vehicle.color} label="สี" name="color" />
                <Field
                  defaultValue={vehicle.licensePlate}
                  label="ทะเบียนรถ"
                  name="licensePlate"
                />
                <Field
                  defaultValue={String(vehicle.seatCapacity)}
                  label="จำนวนที่นั่ง"
                  name="seatCapacity"
                  type="number"
                />
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">รูปแบบการใช้รถ</span>
                  <select
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                    defaultValue={vehicle.driverOption}
                    name="driverOption"
                  >
                    <option value={DriverOption.SELF_DRIVE_ONLY}>ขับเองเท่านั้น</option>
                    <option value={DriverOption.DRIVER_OR_SELF_DRIVE}>
                      ขอคนขับหรือขับเองได้
                    </option>
                  </select>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">เปลี่ยนรูปถ่ายรถ</span>
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    name="photo"
                    type="file"
                  />
                </label>
                <button
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 sm:col-span-2"
                  type="submit"
                >
                  บันทึกข้อมูลรถ
                </button>
              </form>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Field({
  defaultValue,
  label,
  name,
  type = "text",
}: {
  defaultValue?: string;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="block">
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

function IconButton({
  children,
  label,
  tone,
}: {
  children: React.ReactNode;
  label: string;
  tone: "neutral" | "danger";
}) {
  const toneClass =
    tone === "danger" ? "border-red-200 text-red-700" : "border-slate-300 text-slate-700";

  return (
    <button
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${toneClass}`}
      title={label}
      type="submit"
    >
      {children}
    </button>
  );
}
