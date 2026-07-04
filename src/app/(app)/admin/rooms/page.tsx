import { DoorOpen, Monitor, PhoneCall, Power, Trash2 } from "lucide-react";

import { getPrisma } from "@/lib/db/prisma";
import {
  createMeetingRoomAction,
  softDeleteMeetingRoomAction,
  toggleMeetingRoomStatusAction,
  updateMeetingRoomAction,
} from "./actions";

export default async function MeetingRoomsPage() {
  const prisma = getPrisma();
  const rooms = await prisma.meetingRoom.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { bookings: true } } },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">Meeting rooms</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage rooms and equipment flags used by the booking calendar and room filters.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form
          action={createMeetingRoomAction}
          className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 text-teal-700">
              <DoorOpen aria-hidden className="h-5 w-5" />
            </span>
            <h2 className="text-base font-semibold text-slate-950">Create meeting room</h2>
          </div>

          <div className="mt-5 space-y-4">
            <Field label="Room name" name="name" />
            <Field label="Seat capacity" name="seatCapacity" type="number" />
            <label className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <input className="h-4 w-4" name="hasTv" type="checkbox" />
              Has TV
            </label>
            <label className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <input className="h-4 w-4" name="hasConferenceSet" type="checkbox" />
              Has conference set
            </label>
          </div>

          <button
            className="mt-5 w-full rounded-md bg-teal-700 px-4 py-2.5 text-sm font-medium text-white"
            type="submit"
          >
            Create room
          </button>
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          {rooms.map((room) => (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              key={room.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-950">{room.name}</h2>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {room.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{room.seatCapacity} seats</p>
                </div>
                <div className="flex gap-2">
                  <form action={toggleMeetingRoomStatusAction}>
                    <input name="id" type="hidden" value={room.id} />
                    <IconButton label={room.isActive ? "Deactivate" : "Activate"} tone="neutral">
                      <Power aria-hidden className="h-4 w-4" />
                    </IconButton>
                  </form>
                  <form action={softDeleteMeetingRoomAction}>
                    <input name="id" type="hidden" value={room.id} />
                    <IconButton label="Soft delete" tone="danger">
                      <Trash2 aria-hidden className="h-4 w-4" />
                    </IconButton>
                  </form>
                </div>
              </div>

              <div className="mt-5 grid gap-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <Monitor aria-hidden className="h-4 w-4 text-slate-400" />
                  {room.hasTv ? "TV available" : "No TV"}
                </span>
                <span className="inline-flex items-center gap-2">
                  <PhoneCall aria-hidden className="h-4 w-4 text-slate-400" />
                  {room.hasConferenceSet ? "Conference set available" : "No conference set"}
                </span>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                {room._count.bookings} booking{room._count.bookings === 1 ? "" : "s"}
              </p>
              <form action={updateMeetingRoomAction} className="mt-5 space-y-3 border-t border-slate-200 pt-4">
                <input name="id" type="hidden" value={room.id} />
                <Field defaultValue={room.name} label="Room name" name="name" />
                <Field
                  defaultValue={String(room.seatCapacity)}
                  label="Seat capacity"
                  name="seatCapacity"
                  type="number"
                />
                <label className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <input
                    className="h-4 w-4"
                    defaultChecked={room.hasTv}
                    name="hasTv"
                    type="checkbox"
                  />
                  Has TV
                </label>
                <label className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
                  <input
                    className="h-4 w-4"
                    defaultChecked={room.hasConferenceSet}
                    name="hasConferenceSet"
                    type="checkbox"
                  />
                  Has conference set
                </label>
                <button
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                  type="submit"
                >
                  Save room
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
