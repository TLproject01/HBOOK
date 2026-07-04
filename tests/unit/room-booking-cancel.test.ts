import { describe, expect, it } from "vitest";
import { RoomBookingStatus } from "@prisma/client";

import {
  cancelOwnRoomBooking,
  cancelRoomBookingByAdmin,
} from "@/server/services/room-bookings/cancel";

const now = new Date("2026-07-03T09:00:00.000Z");

function createTx(overrides?: { booking?: Record<string, unknown> }) {
  const writes: Array<{ type: string; data: unknown }> = [];
  const booking = {
    id: "booking-1",
    requesterUserId: "requester-1",
    roomNameSnapshot: "Conference A",
    startAt: new Date("2026-07-04T09:00:00.000Z"),
    status: RoomBookingStatus.APPROVED,
    ...overrides?.booking,
  };

  const tx = {
    writes,
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

describe("room booking cancellation service", () => {
  it("lets a requester cancel their own future room booking", async () => {
    const tx = createTx();

    const result = await cancelOwnRoomBooking({
      bookingId: "booking-1",
      cancelReason: "Meeting moved online.",
      now: () => now,
      prisma: createPrisma(tx),
      userId: "requester-1",
    });

    expect(result.status).toBe(RoomBookingStatus.CANCELLED);
    expect(tx.writes).toContainEqual({
      type: "roomBooking.update",
      data: expect.objectContaining({
        cancelledAt: now,
        cancelledByUserId: "requester-1",
        cancelledReason: "Meeting moved online.",
        status: RoomBookingStatus.CANCELLED,
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "ROOM_BOOKING_CANCELLED",
        actorUserId: "requester-1",
      }),
    });
  });

  it("lets an admin cancel any future room booking and notify the requester", async () => {
    const tx = createTx();

    await cancelRoomBookingByAdmin({
      actorUserId: "admin-1",
      bookingId: "booking-1",
      cancelReason: "Room maintenance.",
      now: () => now,
      prisma: createPrisma(tx),
    });

    expect(tx.writes).toContainEqual({
      type: "notification.create",
      data: expect.objectContaining({
        recipientUserId: "requester-1",
        title: "รายการจองห้องถูกยกเลิก",
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "ROOM_BOOKING_ADMIN_CANCELLED",
        actorUserId: "admin-1",
      }),
    });
  });

  it("rejects cancelling a room booking that has already started", async () => {
    const tx = createTx({
      booking: { startAt: new Date("2026-07-03T08:00:00.000Z") },
    });

    await expect(
      cancelOwnRoomBooking({
        bookingId: "booking-1",
        cancelReason: "Too late.",
        now: () => now,
        prisma: createPrisma(tx),
        userId: "requester-1",
      }),
    ).rejects.toThrow("ยกเลิกได้เฉพาะการจองห้องในอนาคต");
  });
});
