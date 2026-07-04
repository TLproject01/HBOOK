import { describe, expect, it } from "vitest";
import { RoomBookingStatus } from "@prisma/client";

import { createRoomBooking } from "@/server/services/room-bookings/create";

const range = {
  startAt: new Date("2026-07-04T09:00:00.000Z"),
  endAt: new Date("2026-07-04T10:00:00.000Z"),
};

function createTx(overrides?: { room?: Record<string, unknown> }) {
  const writes: Array<{ type: string; data: unknown }> = [];
  const room = {
    id: "room-1",
    hasConferenceSet: true,
    hasTv: true,
    name: "Conference A",
    seatCapacity: 10,
    ...overrides?.room,
  };

  const tx = {
    writes,
    meetingRoom: {
      findFirstOrThrow: async () => room,
    },
    roomBooking: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        writes.push({ type: "roomBooking.create", data });
        return { id: "booking-1", status: RoomBookingStatus.APPROVED, ...data };
      },
    },
    recurringSeries: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        writes.push({ type: "recurringSeries.create", data });
        return { id: "series-1", ...data };
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

const input = {
  contactName: "Requester",
  contactPhone: "0812345678",
  meetingTitle: "Planning",
  roomId: "room-1",
  user: {
    department: { name: "Operations" },
    id: "user-1",
    name: "Requester",
  },
  ...range,
};

describe("room booking creation service", () => {
  it("creates an approved room booking with room snapshots and audit log", async () => {
    const tx = createTx();

    const result = await createRoomBooking({
      input,
      isRoomAvailable: async () => true,
      prisma: createPrisma(tx),
    });

    expect(result).toEqual(expect.objectContaining({ status: RoomBookingStatus.APPROVED }));
    expect(tx.writes).toContainEqual({
      type: "roomBooking.create",
      data: expect.objectContaining({
        contactName: "Requester",
        requesterUserId: "user-1",
        roomCapacitySnapshot: 10,
        roomId: "room-1",
        roomNameSnapshot: "Conference A",
        status: RoomBookingStatus.APPROVED,
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "ROOM_BOOKING_CREATED",
        actorUserId: "user-1",
        entityId: "booking-1",
      }),
    });
  });

  it("rejects room bookings when the room is unavailable", async () => {
    const tx = createTx();

    await expect(
      createRoomBooking({
        input,
        isRoomAvailable: async () => false,
        prisma: createPrisma(tx),
      }),
    ).rejects.toThrow("Room is unavailable for the selected time range.");
  });
});
