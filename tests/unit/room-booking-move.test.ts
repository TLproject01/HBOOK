import { describe, expect, it } from "vitest";
import { RoomBookingStatus } from "@prisma/client";

import {
  moveOwnRoomBooking,
  moveRoomBookingByAdmin,
} from "@/server/services/room-bookings/move";

const now = new Date("2026-07-03T09:00:00.000Z");
const nextRange = {
  startAt: new Date("2026-07-04T13:00:00.000Z"),
  endAt: new Date("2026-07-04T14:00:00.000Z"),
};

function createTx(overrides?: {
  booking?: Record<string, unknown>;
  room?: Record<string, unknown>;
}) {
  const writes: Array<{ type: string; data: unknown }> = [];
  const booking = {
    id: "booking-1",
    requesterUserId: "requester-1",
    roomId: "room-1",
    roomNameSnapshot: "Conference A",
    startAt: new Date("2026-07-04T09:00:00.000Z"),
    endAt: new Date("2026-07-04T10:00:00.000Z"),
    status: RoomBookingStatus.APPROVED,
    ...overrides?.booking,
  };
  const room = {
    id: "room-2",
    hasConferenceSet: false,
    hasTv: true,
    name: "Conference B",
    seatCapacity: 8,
    ...overrides?.room,
  };

  const tx = {
    writes,
    meetingRoom: {
      findFirstOrThrow: async () => room,
    },
    roomBooking: {
      findFirstOrThrow: async () => booking,
      update: async ({ data }: { data: Record<string, unknown> }) => {
        writes.push({ type: "roomBooking.update", data });
        return { ...booking, ...data };
      },
    },
    notification: {
      create: async ({ data }: { data: Record<string, unknown> }) => {
        writes.push({ type: "notification.create", data });
        return data;
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

describe("room booking move service", () => {
  it("lets a requester move their own future room booking", async () => {
    const tx = createTx();

    const result = await moveOwnRoomBooking({
      bookingId: "booking-1",
      isRoomAvailable: async () => true,
      now: () => now,
      prisma: createPrisma(tx),
      roomId: "room-2",
      userId: "requester-1",
      ...nextRange,
    });

    expect(result.status).toBe(RoomBookingStatus.APPROVED);
    expect(tx.writes).toContainEqual({
      type: "roomBooking.update",
      data: expect.objectContaining({
        endAt: nextRange.endAt,
        roomCapacitySnapshot: 8,
        roomId: "room-2",
        roomNameSnapshot: "Conference B",
        startAt: nextRange.startAt,
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "ROOM_BOOKING_MOVED",
        actorUserId: "requester-1",
        entityId: "booking-1",
      }),
    });
  });

  it("lets an admin move any future room booking and notify requester", async () => {
    const tx = createTx();

    await moveRoomBookingByAdmin({
      actorUserId: "admin-1",
      bookingId: "booking-1",
      isRoomAvailable: async () => true,
      now: () => now,
      prisma: createPrisma(tx),
      roomId: "room-2",
      ...nextRange,
    });

    expect(tx.writes).toContainEqual({
      type: "notification.create",
      data: expect.objectContaining({
        recipientUserId: "requester-1",
        title: "รายการจองห้องถูกปรับกำหนดการ",
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "ROOM_BOOKING_ADMIN_MOVED",
        actorUserId: "admin-1",
        entityId: "booking-1",
      }),
    });
  });

  it("rejects moving a room booking that has already started", async () => {
    const tx = createTx({
      booking: { startAt: new Date("2026-07-03T08:00:00.000Z") },
    });

    await expect(
      moveOwnRoomBooking({
        bookingId: "booking-1",
        isRoomAvailable: async () => true,
        now: () => now,
        prisma: createPrisma(tx),
        roomId: "room-2",
        userId: "requester-1",
        ...nextRange,
      }),
    ).rejects.toThrow("ย้ายได้เฉพาะการจองห้องในอนาคต");
  });

  it("rejects moving when the target room is unavailable excluding the current booking", async () => {
    const tx = createTx();
    const availabilityCalls: unknown[] = [];

    await expect(
      moveOwnRoomBooking({
        bookingId: "booking-1",
        isRoomAvailable: async (...args) => {
          availabilityCalls.push(args);
          return false;
        },
        now: () => now,
        prisma: createPrisma(tx),
        roomId: "room-2",
        userId: "requester-1",
        ...nextRange,
      }),
    ).rejects.toThrow("ห้องประชุมไม่ว่างในช่วงเวลาที่เลือก");

    expect(availabilityCalls[0]).toEqual([tx, "room-2", nextRange, "booking-1"]);
  });
});
