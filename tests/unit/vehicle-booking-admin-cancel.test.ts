import { describe, expect, it } from "vitest";
import { VehicleBookingStatus } from "@prisma/client";

import { cancelVehicleBookingByAdmin } from "@/server/services/vehicle-bookings/admin-cancel";

const now = new Date("2026-07-03T09:00:00.000Z");

function createTx(overrides?: { booking?: Record<string, unknown> }) {
  const writes: Array<{ type: string; data: unknown }> = [];
  const booking = {
    id: "booking-1",
    requesterUserId: "requester-1",
    status: VehicleBookingStatus.APPROVED,
    startAt: new Date("2026-07-04T09:00:00.000Z"),
    vehicleLicensePlateSnapshot: "CAR-100",
    requester: { id: "requester-1", name: "Requester" },
    ...overrides?.booking,
  };

  const tx = {
    writes,
    vehicleBooking: {
      findFirstOrThrow: async () => booking,
      update: async ({ data }: { data: Record<string, unknown> }) => {
        writes.push({ type: "vehicleBooking.update", data });
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

describe("admin vehicle booking cancellation service", () => {
  it("cancels an approved future booking with reason, requester notification, and audit log", async () => {
    const tx = createTx();

    const result = await cancelVehicleBookingByAdmin({
      actorUserId: "admin-1",
      bookingId: "booking-1",
      cancelReason: "Vehicle maintenance.",
      now: () => now,
      prisma: createPrisma(tx),
    });

    expect(result.status).toBe(VehicleBookingStatus.CANCELLED);
    expect(tx.writes).toContainEqual({
      type: "vehicleBooking.update",
      data: expect.objectContaining({
        cancelledAt: now,
        cancelledByUserId: "admin-1",
        cancelledReason: "Vehicle maintenance.",
        status: VehicleBookingStatus.CANCELLED,
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "notification.create",
      data: expect.objectContaining({
        recipientUserId: "requester-1",
        title: "Vehicle booking cancelled",
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "VEHICLE_BOOKING_ADMIN_CANCELLED",
        actorUserId: "admin-1",
        entityId: "booking-1",
      }),
    });
  });

  it("rejects cancellation for a booking that has already started", async () => {
    const tx = createTx({
      booking: { startAt: new Date("2026-07-03T08:00:00.000Z") },
    });

    await expect(
      cancelVehicleBookingByAdmin({
        actorUserId: "admin-1",
        bookingId: "booking-1",
        cancelReason: "Too late.",
        now: () => now,
        prisma: createPrisma(tx),
      }),
    ).rejects.toThrow("Only future vehicle bookings can be cancelled by admin.");
  });
});
