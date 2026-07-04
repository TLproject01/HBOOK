"use client";

import { useMemo, useState } from "react";
import { DoorOpen, Filter } from "lucide-react";

import { filterEventsByRoom } from "@/lib/calendar/room-filter";
import { BookingCalendar, type BookingCalendarEvent } from "./booking-calendar";

export type RoomCalendarRoom = {
  id: string;
  name: string;
};

export type RoomCalendarEventPayload = {
  id: string;
  title: string;
  start: string;
  end: string;
  roomId: string;
  resourceLabel: string;
  status: string;
};

type RoomCalendarClientProps = {
  rooms: RoomCalendarRoom[];
  events: RoomCalendarEventPayload[];
};

type RoomBookingCalendarEvent = BookingCalendarEvent & {
  roomId: string;
};

export function RoomCalendarClient({ rooms, events }: RoomCalendarClientProps) {
  const [selectedRoomId, setSelectedRoomId] = useState("all");

  const calendarEvents = useMemo<RoomBookingCalendarEvent[]>(
    () =>
      events.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      })),
    [events],
  );

  const filteredEvents = useMemo(
    () => filterEventsByRoom(calendarEvents, selectedRoomId),
    [calendarEvents, selectedRoomId],
  );

  const selectedRoomName =
    selectedRoomId === "all"
      ? "All rooms"
      : rooms.find((room) => room.id === selectedRoomId)?.name ?? "Selected room";

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Filter aria-hidden className="h-4 w-4 text-teal-700" />
              Room filter
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Showing {filteredEvents.length} booking{filteredEvents.length === 1 ? "" : "s"} for{" "}
              {selectedRoomName}.
            </p>
          </div>

          <label className="block w-full lg:w-80">
            <span className="text-sm font-medium text-slate-700">Meeting room</span>
            <div className="relative mt-2">
              <DoorOpen
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              />
              <select
                className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900"
                onChange={(event) => setSelectedRoomId(event.target.value)}
                value={selectedRoomId}
              >
                <option value="all">All rooms</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
          </label>
        </div>
      </div>

      <BookingCalendar
        emptyMessage={`No approved bookings found for ${selectedRoomName}.`}
        events={filteredEvents}
      />
    </section>
  );
}
