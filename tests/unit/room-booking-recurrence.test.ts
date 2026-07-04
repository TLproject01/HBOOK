import { describe, expect, it } from "vitest";
import { RecurrenceType } from "@prisma/client";

import { buildRoomBookingOccurrences } from "@/server/services/room-bookings/recurrence";

describe("room booking recurrence", () => {
  it("builds weekly occurrences from the first range", () => {
    const occurrences = buildRoomBookingOccurrences({
      endAt: new Date("2026-07-04T10:00:00.000Z"),
      occurrenceCount: 3,
      recurrenceType: RecurrenceType.WEEKLY,
      startAt: new Date("2026-07-04T09:00:00.000Z"),
    });

    expect(occurrences).toEqual([
      {
        startAt: new Date("2026-07-04T09:00:00.000Z"),
        endAt: new Date("2026-07-04T10:00:00.000Z"),
      },
      {
        startAt: new Date("2026-07-11T09:00:00.000Z"),
        endAt: new Date("2026-07-11T10:00:00.000Z"),
      },
      {
        startAt: new Date("2026-07-18T09:00:00.000Z"),
        endAt: new Date("2026-07-18T10:00:00.000Z"),
      },
    ]);
  });

  it("builds monthly occurrences from the first range", () => {
    const occurrences = buildRoomBookingOccurrences({
      endAt: new Date("2026-07-04T10:00:00.000Z"),
      occurrenceCount: 2,
      recurrenceType: RecurrenceType.MONTHLY,
      startAt: new Date("2026-07-04T09:00:00.000Z"),
    });

    expect(occurrences).toEqual([
      {
        startAt: new Date("2026-07-04T09:00:00.000Z"),
        endAt: new Date("2026-07-04T10:00:00.000Z"),
      },
      {
        startAt: new Date("2026-08-04T09:00:00.000Z"),
        endAt: new Date("2026-08-04T10:00:00.000Z"),
      },
    ]);
  });

  it("rejects occurrence counts below one", () => {
    expect(() =>
      buildRoomBookingOccurrences({
        endAt: new Date("2026-07-04T10:00:00.000Z"),
        occurrenceCount: 0,
        recurrenceType: RecurrenceType.WEEKLY,
        startAt: new Date("2026-07-04T09:00:00.000Z"),
      }),
    ).toThrow("Occurrence count must be positive.");
  });
});
