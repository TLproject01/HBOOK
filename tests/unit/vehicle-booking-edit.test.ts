import { describe, expect, it } from "vitest";
import { DriverOption, VehicleBookingStatus } from "@prisma/client";

import { updateOwnPendingVehicleBooking } from "@/server/services/vehicle-bookings/edit-own";

const range = {
  startAt: new Date("2026-07-04T09:00:00.000Z"),
  endAt: new Date("2026-07-04T10:00:00.000Z"),
};

function createTx(overrides?: { vehicle?: Record<string, unknown> }) {
  const writes: Array<{ type: string; data: unknown }> = [];
  const vehicle = {
    id: "vehicle-1",
    color: "White",
    driverOption: DriverOption.DRIVER_OR_SELF_DRIVE,
    licensePlate: "CAR-100",
    model: "Van",
    seatCapacity: 6,
    ...overrides?.vehicle,
  };
  const booking = {
    id: "booking-1",
    requesterUserId: "user-1",
    status: VehicleBookingStatus.PENDING,
  };

  const tx = {
    writes,
    vehicle: {
      findFirstOrThrow: async () => vehicle,
    },
    vehicleBooking: {
      findFirstOrThrow: async () => booking,
      update: async ({ data }: { data: Record<string, unknown> }) => {
        writes.push({ type: "vehicleBooking.update", data });
        return { ...booking, ...data };
      },
    },
    vehicleBookingRoute: {
      deleteMany: async ({ where }: { where: Record<string, unknown> }) => {
        writes.push({ type: "vehicleBookingRoute.deleteMany", data: where });
        return { count: 2 };
      },
      createMany: async ({ data }: { data: unknown }) => {
        writes.push({ type: "vehicleBookingRoute.createMany", data });
        return { count: 2 };
      },
    },
    user: {
      findMany: async () => [{ id: "admin-1" }],
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

const updateInput = {
  bookingId: "booking-1",
  contactName: "Requester",
  contactPhone: "0812345678",
  destinations: ["Office", "Warehouse"],
  needDriver: true,
  passengerCount: 4,
  startLocation: "HQ",
  tripPurpose: "Site visit",
  user: {
    department: { name: "Operations" },
    id: "user-1",
    name: "Requester",
  },
  vehicleId: "vehicle-1",
  ...range,
};

describe("edit own pending vehicle booking service", () => {
  it("updates an owned pending request, replaces routes, notifies admins, and writes audit log", async () => {
    const tx = createTx();

    const result = await updateOwnPendingVehicleBooking({
      input: updateInput,
      isVehicleAvailable: async () => true,
      prisma: createPrisma(tx),
    });

    expect(result.status).toBe(VehicleBookingStatus.PENDING);
    expect(tx.writes).toContainEqual({
      type: "vehicleBooking.update",
      data: expect.objectContaining({
        contactName: "Requester",
        needDriver: true,
        passengerCount: 4,
        vehicleId: "vehicle-1",
        vehicleLicensePlateSnapshot: "CAR-100",
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "vehicleBookingRoute.deleteMany",
      data: { vehicleBookingId: "booking-1" },
    });
    expect(tx.writes).toContainEqual({
      type: "vehicleBookingRoute.createMany",
      data: [
        { destination: "Office", sequence: 1, vehicleBookingId: "booking-1" },
        { destination: "Warehouse", sequence: 2, vehicleBookingId: "booking-1" },
      ],
    });
    expect(tx.writes).toContainEqual({
      type: "notification.create",
      data: expect.objectContaining({
        recipientUserId: "admin-1",
        title: "คำขอใช้รถถูกแก้ไข",
      }),
    });
    expect(tx.writes).toContainEqual({
      type: "auditLog.create",
      data: expect.objectContaining({
        action: "VEHICLE_REQUEST_UPDATED",
        actorUserId: "user-1",
        entityId: "booking-1",
      }),
    });
  });

  it("rejects updates that exceed vehicle seat capacity", async () => {
    const tx = createTx({ vehicle: { seatCapacity: 2 } });

    await expect(
      updateOwnPendingVehicleBooking({
        input: updateInput,
        isVehicleAvailable: async () => true,
        prisma: createPrisma(tx),
      }),
    ).rejects.toThrow("จำนวนผู้โดยสารเกินจำนวนที่นั่งของรถ");
  });

  it("rejects updates when the vehicle is unavailable excluding the current booking", async () => {
    const tx = createTx();
    const availabilityCalls: unknown[] = [];

    await expect(
      updateOwnPendingVehicleBooking({
        input: updateInput,
        isVehicleAvailable: async (...args) => {
          availabilityCalls.push(args);
          return false;
        },
        prisma: createPrisma(tx),
      }),
    ).rejects.toThrow("รถไม่ว่างในช่วงเวลาที่เลือก");

    expect(availabilityCalls[0]).toEqual([tx, "vehicle-1", range, "booking-1"]);
  });
});
