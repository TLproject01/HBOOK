import { describe, expect, it } from "vitest";

import { rangesOverlap } from "@/lib/availability/overlap";

describe("rangesOverlap", () => {
  it("does not conflict when a booking ends exactly as the next starts", () => {
    expect(
      rangesOverlap(
        {
          startAt: new Date("2026-07-02T09:00:00.000Z"),
          endAt: new Date("2026-07-02T10:00:00.000Z"),
        },
        {
          startAt: new Date("2026-07-02T10:00:00.000Z"),
          endAt: new Date("2026-07-02T11:00:00.000Z"),
        },
      ),
    ).toBe(false);
  });

  it("conflicts when ranges overlap", () => {
    expect(
      rangesOverlap(
        {
          startAt: new Date("2026-07-02T09:00:00.000Z"),
          endAt: new Date("2026-07-02T10:00:00.000Z"),
        },
        {
          startAt: new Date("2026-07-02T09:30:00.000Z"),
          endAt: new Date("2026-07-02T10:30:00.000Z"),
        },
      ),
    ).toBe(true);
  });
});
