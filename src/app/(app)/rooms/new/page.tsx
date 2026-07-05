import Link from "next/link";
import { ArrowLeft, DoorOpen } from "lucide-react";

import { getPrisma } from "@/lib/db/prisma";
import { createRoomBookingAction } from "./actions";

export default async function NewRoomBookingPage() {
  const prisma = getPrisma();
  const rooms = await prisma.meetingRoom.findMany({
    where: {
      isActive: true,
      deletedAt: null,
    },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"
          href="/rooms/calendar"
        >
          <ArrowLeft aria-hidden className="h-4 w-4" />
          กลับไปตารางห้องประชุม
        </Link>
        <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-sky-700">
          ห้องประชุม
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          จองห้องประชุม
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          ระบุห้อง ช่วงเวลา และรายละเอียดการประชุม ระบบจะตรวจสอบเวลาว่างก่อนบันทึก
        </p>
      </div>

      <form
        action={createRoomBookingAction}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
            <DoorOpen aria-hidden className="h-5 w-5" />
          </span>
          <h2 className="text-base font-semibold text-slate-950">รายละเอียดการประชุม</h2>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">ห้องประชุม</span>
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              name="roomId"
              required
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}, {room.seatCapacity} ที่นั่ง
                  {room.hasTv ? ", TV" : ""}
                  {room.hasConferenceSet ? ", conference set" : ""}
                </option>
              ))}
            </select>
          </label>

          <Field label="วันและเวลาเริ่มประชุม" name="startAt" type="datetime-local" />
          <Field label="วันและเวลาสิ้นสุด" name="endAt" type="datetime-local" />
          <Field className="md:col-span-2" label="หัวข้อประชุม" name="meetingTitle" />
          <Field label="ชื่อผู้ประสานงาน" name="contactName" />
          <Field label="เบอร์ติดต่อ" name="contactPhone" />
          <label className="block">
            <span className="text-sm font-medium text-slate-700">การจองซ้ำ</span>
            <select
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2"
              name="recurrenceType"
            >
              <option value="">ไม่จองซ้ำ</option>
              <option value="WEEKLY">รายสัปดาห์</option>
              <option value="MONTHLY">รายเดือน</option>
            </select>
          </label>
          <Field defaultValue="1" label="จำนวนครั้ง" name="occurrenceCount" type="number" />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link
            className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
            href="/rooms/calendar"
          >
            ยกเลิก
          </Link>
          <button
            className="rounded-md bg-sky-700 px-4 py-2.5 text-sm font-medium text-white"
            type="submit"
          >
            บันทึกการจอง
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
  defaultValue?: string;
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
