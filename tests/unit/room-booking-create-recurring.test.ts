import { describe, expect, it } from "vitest";
import { RecurrenceType, RoomBookingStatus } from "@prisma/client";

import { createRoomBooking } from "@/server/services/room-bookings/create";

function createTx() {
  const writes: Array<{ type: string; data: unknown }> = [];
  const room = {
    id: "room-1",
    hasConferenceSet: true,
    hasTv: true,
    name: "Conference A",
    seatCapacity: 10,
  };

  const tx = {
    writes,
    meetingRoom: {
      findFirstOrThrow: async () => room,
    },
    recurringSeries: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        writes.push({ type: "recurringSeries.create", data });
        return { id: "series-1", ...data };
      },
    },
    roomBooking: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        writes.push({ type: "roomBooking.create", data });
        return { id: `booking-${writes.length}`, status: RoomBookingStatus.APPROVED, ...data };
      },
    },
    auditLog: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        writes.push({ type: "auditLog.create", data });
        return data;
      },
    },
  };

  return tx;
}

function createPrisma(tx: ReturnType<typeof createTx>) {
  return {
    $transaction: async <T>(callback: (transaction: typeof tx) => Promise<T>) =>
      callback(tx),
  };
}

describe("recurring room booking creation service", () => {
  it("creates a recurring series and one approved booking per occurrence", async () => {
    const tx = createTx();

    const result = await createRoomBooking({
      input: {
        contactName: "Requester",
        contactPhone: "0812345678",
        endAt: new Date("2026-07-04T10:00:00.000Z"),
        meetingTitle: "Planning",
        occurrenceCount: 2,
        recurrenceType: RecurrenceType.WEEKLY,
        roomId: "room-1",
        startAt: new Date("2026-07-04T09:00:00.000Z"),
        user: {
          department: { name: "Operations" },
          id: "user-1",
          name: "Requester",
        },
      },
      isRoomAvailable: async () => true,
      prisma: createPrisma(tx),
    });

    expect(result.id).toBe("series-1");
    expect(tx.writes).toContainEqual({
      type: "recurringSeries.create",
      data: expect.objectContaining({
        createdByUserId: "user-1",
        occurrenceCount: 2,
        recurrenceType: RecurrenceType.WEEKLY,
      }),
    });
    expect(tx.writes.filter((write) => write.type === "roomBooking.create")).toHaveLength(2);
    expect(tx.writes).toContainEqual({
      type: "roomBooking.create",
      data: expect.objectContaining({
        recurringSeriesId: "series-1",
        startAt: new Date("2026-07-11T09:00:00.000Z"),
      }),
    });
  });

  it("rejects the whole recurring series when any occurrence conflicts", async () => {
    const tx = createTx();
    let checkCount = 0;

    await expect(
      createRoomBooking({
        input: {
          contactName: "Requester",
          contactPhone: "0812345678",
          endAt: new Date("2026-07-04T10:00:00.000Z"),
          meetingTitle: "Planning",
          occurrenceCount: 2,
          recurrenceType: RecurrenceType.WEEKLY,
          roomId: "room-1",
          startAt: new Date("2026-07-04T09:00:00.000Z"),
          user: {
            department: { name: "Operations" },
            id: "user-1",
            name: "Requester",
          },
        },
        isRoomAvailable: async () => {
          checkCount += 1;
          return checkCount === 1;
        },
        prisma: createPrisma(tx),
      }),
    ).rejects.toThrow("Room is unavailable for one or more selected occurrences.");

    expect(tx.writes).toEqual([]);
  });
});
