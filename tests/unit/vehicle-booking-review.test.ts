import { describe, expect, it } from "vitest";
import { DriverOption, VehicleBookingStatus } from "@prisma/client";

import {
  approveVehicleBooking,
  rejectVehicleBooking,
} from "@/server/services/vehicle-bookings/review";

const now = new Date("2026-07-03T09:00:00.000Z");

function createTx(overrides?: {
  booking?: Record<string, unknown>;
  driver?: Record<string, unknown> | null;
}) {
  const writes: Array<{ type: string; data: unknown }> = [];
  const booking = {
    id: "booking-1",
    requesterUserId: "requester-1",
    vehicleId: "vehicle-1",
    status: VehicleBookingStatus.PENDING,
    startAt: new Date("2026-07-04T09:00:00.000Z"),
    endAt: new Date("2026-07-04T10:00:00.000Z"),
    needDriver: true,
    vehicle: {
      id: "vehicle-1",
      licensePlate: "CAR-100",
      driverOption: DriverOption.DRIVER_OR_SELF_DRIVE,
    },
    requester: { id: "requester-1", name: "Requester" },
    ...overrides?.booking,
  };
  const driver =
    overrides?.driver === null
      ? null
      : {
          id: "driver-1",
          name: "Driver One",
          phone: "0999999999",
          ...overrides?.driver,
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
    driver: {
      findFirst: async () => driver,
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

describe("vehicle booking review service", () => {
  it("approves a pending driver request with driver snapshots, requester notification, and audit log", async () => {
    const tx = createTx();

    const result = await approveVehicleBooking({
      actorUserId: "admin-1",
      assignedDriverId: "driver-1",
      bookingId: "booking-1",
      isDriverAvailable: async () => true,
      isVehicleAvailable: async () => true,
      now: () => now,
      prisma: createPrisma(tx),
    });

    expect(result.status).toBe(VehicleBookingStatus.APPROVED);
    expect(tx.writes).toContainEqual({
      type: "vehicleBooking.update",
      data: expect.objectContaining({
        assignedDriverId: "driver-1",
        approvedAt: now,
        approvedByUserId: "admin-1",
        driverNameSnapshot: "Driver One",
        driverPhoneSnapshot: "0999999999",
        status: VehicleBookingStatus.APPROVED,
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "notification.create",
      data: expect.objectContaining({
        recipientUserId: "requester-1",
        title: "Vehicle request approved",
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "VEHICLE_REQUEST_APPROVED",
        actorUserId: "admin-1",
        entityId: "booking-1",
      }),
    });
  });

  it("rejects approval when the requested vehicle is no longer available", async () => {
    const tx = createTx();

    await expect(
      approveVehicleBooking({
        actorUserId: "admin-1",
        assignedDriverId: "driver-1",
        bookingId: "booking-1",
        isDriverAvailable: async () => true,
        isVehicleAvailable: async () => false,
        now: () => now,
        prisma: createPrisma(tx),
      }),
    ).rejects.toThrow("Vehicle is unavailable for the selected time range.");
  });

  it("rejects approval for a driver request without an assigned driver", async () => {
    const tx = createTx();

    await expect(
      approveVehicleBooking({
        actorUserId: "admin-1",
        bookingId: "booking-1",
        isDriverAvailable: async () => true,
        isVehicleAvailable: async () => true,
        now: () => now,
        prisma: createPrisma(tx),
      }),
    ).rejects.toThrow("Driver assignment is required for this request.");
  });

  it("rejects a pending request with reason, requester notification, and audit log", async () => {
    const tx = createTx();

    const result = await rejectVehicleBooking({
      actorUserId: "admin-1",
      bookingId: "booking-1",
      now: () => now,
      prisma: createPrisma(tx),
      rejectReason: "Vehicle is reserved for maintenance.",
    });

    expect(result.status).toBe(VehicleBookingStatus.REJECTED);
    expect(tx.writes).toContainEqual({
      type: "vehicleBooking.update",
      data: expect.objectContaining({
        rejectReason: "Vehicle is reserved for maintenance.",
        status: VehicleBookingStatus.REJECTED,
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "notification.create",
      data: expect.objectContaining({
        recipientUserId: "requester-1",
        title: "Vehicle request rejected",
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "VEHICLE_REQUEST_REJECTED",
        actorUserId: "admin-1",
        entityId: "booking-1",
      }),
    });
  });
});
