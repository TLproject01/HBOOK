"use client";

import { Calendar, dateFnsLocalizer, type Event } from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale/en-US";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export type BookingCalendarEvent = Event & {
  resourceLabel?: string;
  status?: string;
  roomId?: string;
};

type BookingCalendarProps = {
  events: BookingCalendarEvent[];
  emptyMessage?: string;
};

export function BookingCalendar({ events, emptyMessage }: BookingCalendarProps) {
  return (
    <div className="relative h-[calc(100vh-13rem)] min-h-[620px] rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {events.length === 0 && emptyMessage ? (
        <div className="pointer-events-none absolute inset-x-4 top-20 z-10 rounded-md border border-dashed border-slate-300 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
          {emptyMessage}
        </div>
      ) : null}
      <Calendar
        defaultView="month"
        events={events}
        eventPropGetter={(event) => ({
          className: event.status ? `booking-event-${event.status.toLowerCase()}` : undefined,
        })}
        localizer={localizer}
        popup
        showMultiDayTimes
        step={15}
        views={["month", "week", "day", "agenda"]}
      />
    </div>
  );
}
