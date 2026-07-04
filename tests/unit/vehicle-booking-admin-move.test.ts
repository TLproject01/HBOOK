import { describe, expect, it } from "vitest";
import { DriverOption, VehicleBookingStatus } from "@prisma/client";

import { moveVehicleBookingByAdmin } from "@/server/services/vehicle-bookings/admin-move";

const now = new Date("2026-07-03T09:00:00.000Z");
const nextRange = {
  startAt: new Date("2026-07-04T13:00:00.000Z"),
  endAt: new Date("2026-07-04T14:00:00.000Z"),
};

function createTx(overrides?: {
  booking?: Record<string, unknown>;
  vehicle?: Record<string, unknown>;
  driver?: Record<string, unknown> | null;
}) {
  const writes: Array<{ type: string; data: unknown }> = [];
  const booking = {
    id: "booking-1",
    requesterUserId: "requester-1",
    status: VehicleBookingStatus.APPROVED,
    startAt: new Date("2026-07-04T09:00:00.000Z"),
    endAt: new Date("2026-07-04T10:00:00.000Z"),
    needDriver: true,
    vehicleId: "vehicle-1",
    assignedDriverId: "driver-1",
    ...overrides?.booking,
  };
  const vehicle = {
    id: "vehicle-2",
    color: "Black",
    driverOption: DriverOption.DRIVER_OR_SELF_DRIVE,
    licensePlate: "CAR-200",
    model: "SUV",
    seatCapacity: 5,
    ...overrides?.vehicle,
  };
  const driver =
    overrides?.driver === null
      ? null
      : {
          id: "driver-2",
          name: "Driver Two",
          phone: "0888888888",
          ...overrides?.driver,
        };

  const tx = {
    writes,
    vehicle: {
      findFirstOrThrow: async () => vehicle,
    },
    driver: {
      findFirst: async () => driver,
    },
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

describe("admin vehicle booking move service", () => {
  it("moves an approved future booking with vehicle and driver snapshots", async () => {
    const tx = createTx();

    const result = await moveVehicleBookingByAdmin({
      actorUserId: "admin-1",
      assignedDriverId: "driver-2",
      bookingId: "booking-1",
      isDriverAvailable: async () => true,
      isVehicleAvailable: async () => true,
      now: () => now,
      passengerCount: 4,
      prisma: createPrisma(tx),
      vehicleId: "vehicle-2",
      ...nextRange,
    });

    expect(result.status).toBe(VehicleBookingStatus.APPROVED);
    expect(tx.writes).toContainEqual({
      type: "vehicleBooking.update",
      data: expect.objectContaining({
        assignedDriverId: "driver-2",
        driverNameSnapshot: "Driver Two",
        endAt: nextRange.endAt,
        passengerCount: 4,
        startAt: nextRange.startAt,
        vehicleId: "vehicle-2",
        vehicleLicensePlateSnapshot: "CAR-200",
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "notification.create",
      data: expect.objectContaining({
        recipientUserId: "requester-1",
        title: "Vehicle booking moved",
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "VEHICLE_BOOKING_ADMIN_MOVED",
        actorUserId: "admin-1",
        entityId: "booking-1",
      }),
    });
  });

  it("rejects moving a booking that has already started", async () => {
    const tx = createTx({
      booking: { startAt: new Date("2026-07-03T08:00:00.000Z") },
    });

    await expect(
      moveVehicleBookingByAdmin({
        actorUserId: "admin-1",
        bookingId: "booking-1",
        isDriverAvailable: async () => true,
        isVehicleAvailable: async () => true,
        now: () => now,
        passengerCount: 4,
        prisma: createPrisma(tx),
        vehicleId: "vehicle-2",
        ...nextRange,
      }),
    ).rejects.toThrow("Only future vehicle bookings can be moved by admin.");
  });

  it("rejects moving when the target vehicle is unavailable excluding the current booking", async () => {
    const tx = createTx();
    const availabilityCalls: unknown[] = [];

    await expect(
      moveVehicleBookingByAdmin({
        actorUserId: "admin-1",
        bookingId: "booking-1",
        isDriverAvailable: async () => true,
        isVehicleAvailable: async (...args) => {
          availabilityCalls.push(args);
          return false;
        },
        now: () => now,
        passengerCount: 4,
        prisma: createPrisma(tx),
        vehicleId: "vehicle-2",
        ...nextRange,
      }),
    ).rejects.toThrow("Vehicle is unavailable for the selected time range.");

    expect(availabilityCalls[0]).toEqual([tx, "vehicle-2", nextRange, "booking-1"]);
  });
});
