import { Link2, Power, Trash2, UserRoundPlus, X } from "lucide-react";

import { getPrisma } from "@/lib/db/prisma";
import {
  createDriverAction,
  createDriverVehicleMappingAction,
  deleteDriverVehicleMappingAction,
  softDeleteDriverAction,
  toggleDriverStatusAction,
  updateDriverAction,
} from "./actions";

export default async function DriversPage() {
  const prisma = getPrisma();
  const [drivers, vehicles, mappings] = await Promise.all([
    prisma.driver.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { vehicleMappings: true, bookings: true } } },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    }),
    prisma.vehicle.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { licensePlate: "asc" },
      select: { id: true, licensePlate: true, model: true },
    }),
    prisma.driverVehicleMapping.findMany({
      include: { driver: true, vehicle: true },
      orderBy: [{ driver: { name: "asc" } }, { vehicle: { licensePlate: "asc" } }],
    }),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-sky-700">
          ผู้ดูแลระบบ
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">ข้อมูลคนขับ</h1>
        <p className="mt-2 text-sm text-slate-600">
          จัดการข้อมูลคนขับและผูกรถที่คนขับแต่ละคนสามารถขับได้
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <form
            action={createDriverAction}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            encType="multipart/form-data"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                <UserRoundPlus aria-hidden className="h-5 w-5" />
              </span>
              <h2 className="text-base font-semibold text-slate-950">เพิ่มคนขับ</h2>
            </div>
            <div className="mt-5 space-y-4">
              <Field label="ชื่อคนขับ" name="name" />
              <Field label="เบอร์โทร" name="phone" />
              <label className="block">
                <span className="text-sm font-medium text-slate-700">รูปถ่ายคนขับ</span>
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  name="photo"
                  type="file"
                />
              </label>
            </div>
            <button
              className="mt-5 w-full rounded-md bg-sky-700 px-4 py-2.5 text-sm font-medium text-white"
              type="submit"
            >
              เพิ่มคนขับ
            </button>
          </form>

          <form
            action={createDriverVehicleMappingAction}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                <Link2 aria-hidden className="h-5 w-5" />
              </span>
              <h2 className="text-base font-semibold text-slate-950">ผูกคนขับกับรถ</h2>
            </div>
            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-700">คนขับ</span>
              <select
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                name="driverId"
              >
                {drivers
                  .filter((driver) => driver.isActive)
                  .map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">รถ</span>
              <select
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
                name="vehicleId"
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.licensePlate} - {vehicle.model}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="mt-5 w-full rounded-md border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-800"
              type="submit"
            >
              บันทึกการผูกข้อมูล
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {drivers.map((driver) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={driver.id}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-950">{driver.name}</h2>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {driver.isActive ? "ใช้งานอยู่" : "ปิดใช้งาน"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{driver.phone}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {driver._count.vehicleMappings} mapped vehicle
                    {driver._count.vehicleMappings === 1 ? "" : "s"} · {driver._count.bookings} booking
                    {driver._count.bookings === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex justify-start gap-2 lg:justify-end">
                  <form action={toggleDriverStatusAction}>
                    <input name="id" type="hidden" value={driver.id} />
                    <IconButton label={driver.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"} tone="neutral">
                      <Power aria-hidden className="h-4 w-4" />
                    </IconButton>
                  </form>
                  <form action={softDeleteDriverAction}>
                    <input name="id" type="hidden" value={driver.id} />
                    <IconButton label="ลบคนขับ" tone="danger">
                      <Trash2 aria-hidden className="h-4 w-4" />
                    </IconButton>
                  </form>
                </div>
              </div>
              <form
                action={updateDriverAction}
                className="mt-5 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2"
                encType="multipart/form-data"
              >
                <input name="id" type="hidden" value={driver.id} />
                <Field defaultValue={driver.name} label="ชื่อคนขับ" name="name" />
                <Field defaultValue={driver.phone} label="เบอร์โทร" name="phone" />
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">เปลี่ยนรูปถ่ายคนขับ</span>
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
                  บันทึกข้อมูลคนขับ
                </button>
              </form>
            </article>
          ))}

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-slate-950">รายการผูกคนขับกับรถ</h2>
            <div className="mt-4 divide-y divide-slate-200">
              {mappings.map((mapping) => (
                <div className="flex items-center justify-between gap-3 py-3" key={mapping.id}>
                  <div>
                    <p className="text-sm font-medium text-slate-950">{mapping.driver.name}</p>
                    <p className="text-sm text-slate-600">
                      {mapping.vehicle.licensePlate} - {mapping.vehicle.model}
                    </p>
                  </div>
                  <form action={deleteDriverVehicleMappingAction}>
                    <input name="id" type="hidden" value={mapping.id} />
                    <IconButton label="ลบการผูกข้อมูล" tone="danger">
                      <X aria-hidden className="h-4 w-4" />
                    </IconButton>
                  </form>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  defaultValue,
  label,
  name,
}: {
  defaultValue?: string;
  label: string;
  name: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
        defaultValue={defaultValue}
        name={name}
        required
        type="text"
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
