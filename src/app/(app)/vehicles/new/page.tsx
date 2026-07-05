import Link from "next/link";
import { ArrowLeft, CarFront } from "lucide-react";
import { DriverOption } from "@prisma/client";

import { getPrisma } from "@/lib/db/prisma";
import { createVehicleBookingAction } from "./actions";

export default async function NewVehicleRequestPage() {
  const prisma = getPrisma();
  const vehicles = await prisma.vehicle.findMany({
    where: {
      isActive: true,
      deletedAt: null,
    },
    orderBy: [{ licensePlate: "asc" }],
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          href="/vehicles/calendar"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          กลับไปตารางใช้รถ
        </Link>
        <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-sky-700">
          รถส่วนกลาง
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">ส่งคำขอใช้รถ</h1>
        <p className="mt-2 text-sm text-slate-600">
          ระบุเส้นทาง ช่วงเวลา และจำนวนผู้โดยสาร ระบบจะตรวจสอบความพร้อมก่อนส่งให้ผู้ดูแลอนุมัติ
        </p>
      </div>

      <form
        action={createVehicleBookingAction}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
            <CarFront aria-hidden className="h-5 w-5" />
          </span>
          <h2 className="text-base font-semibold text-slate-950">รายละเอียดการเดินทาง</h2>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">รถที่ต้องการใช้</span>
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              name="vehicleId"
              required
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.licensePlate} - {vehicle.model}, {vehicle.seatCapacity} ที่นั่ง,{" "}
                  {vehicle.driverOption === DriverOption.SELF_DRIVE_ONLY
                    ? "ขับเองเท่านั้น"
                    : "ขอคนขับหรือขับเองได้"}
                </option>
              ))}
            </select>
          </label>

          <Field label="วันและเวลาเริ่มใช้รถ" name="startAt" type="datetime-local" />
          <Field label="วันและเวลาสิ้นสุด" name="endAt" type="datetime-local" />
          <Field label="จำนวนผู้โดยสาร" name="passengerCount" type="number" />
          <label className="flex min-h-10 items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <input className="h-4 w-4" name="needDriver" type="checkbox" />
            ต้องการคนขับ
          </label>

          <Field className="md:col-span-2" label="จุดเริ่มต้น" name="startLocation" />

          <div className="space-y-3 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">ปลายทาง</span>
            {[0, 1, 2].map((index) => (
              <input
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                key={index}
                name="destinations"
                placeholder={index === 0 ? "ปลายทางหลัก" : "ปลายทางเพิ่มเติม"}
                required={index === 0}
                type="text"
              />
            ))}
          </div>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">วัตถุประสงค์การเดินทาง</span>
            <textarea
              className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2"
              name="tripPurpose"
              required
            />
          </label>

          <Field label="ชื่อผู้ประสานงาน" name="contactName" />
          <Field label="เบอร์ติดต่อ" name="contactPhone" />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
            href="/vehicles/calendar"
          >
            ยกเลิก
          </Link>
          <button
            className="rounded-md bg-sky-700 px-4 py-2.5 text-sm font-medium text-white"
            type="submit"
          >
            ส่งคำขอ
          </button>
        </div>
      </form>
    </main>
  );
}

function Field({
  className,
  label,
  name,
  type = "text",
}: {
  className?: string;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className={className}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
        name={name}
        required
        type={type}
      />
    </label>
  );
}
