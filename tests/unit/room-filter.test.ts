import { describe, expect, it } from "vitest";

import { filterEventsByRoom } from "@/lib/calendar/room-filter";

const events = [
  { id: "booking-1", roomId: "room-1" },
  { id: "booking-2", roomId: "room-2" },
  { id: "booking-3", roomId: "room-2" },
];

describe("filterEventsByRoom", () => {
  it("returns every event when all rooms are selected", () => {
    expect(filterEventsByRoom(events, "all")).toEqual(events);
  });

  it("returns only events for the selected room", () => {
    expect(filterEventsByRoom(events, "room-2")).toEqual([
      { id: "booking-2", roomId: "room-2" },
      { id: "booking-3", roomId: "room-2" },
    ]);
  });
});
