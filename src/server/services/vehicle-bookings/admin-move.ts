import { DriverOption, ModuleName, VehicleBookingStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import {
  isDriverAvailable as defaultIsDriverAvailable,
  isVehicleAvailable as defaultIsVehicleAvailable,
} from "@/lib/availability/vehicle";

type AdminMoveTransaction = {
  vehicle: {
    findFirstOrThrow: (args: unknown) => Promise<VehicleForAdminMove>;
  };
  driver: {
    findFirst: (args: unknown) => Promise<DriverForAdminMove | null>;
  };
  vehicleBooking: {
    findFirstOrThrow: (args: unknown) => Promise<VehicleBookingForAdminMove>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
  };
  notification: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

export type AdminMovePrisma = {
  $transaction: <T>(callback: (transaction: AdminMoveTransaction) => Promise<T>) => Promise<T>;
};

type VehicleBookingForAdminMove = {
  assignedDriverId: string | null;
  endAt: Date;
  id: string;
  needDriver: boolean;
  requesterUserId: string;
  startAt: Date;
  status: VehicleBookingStatus;
  vehicleId: string;
};

type VehicleForAdminMove = {
  color: string;
  driverOption: DriverOption;
  id: string;
  licensePlate: string;
  model: string;
  seatCapacity: number;
};

type DriverForAdminMove = {
  id: string;
  name: string;
  phone: string;
};

type AvailabilityCheck = (
  prisma: AdminMoveTransaction,
  id: string,
  range: { startAt: Date; endAt: Date },
  ignoreBookingId?: string,
) => Promise<boolean>;

export type MoveVehicleBookingByAdminInput = {
  actorUserId: string;
  assignedDriverId?: string;
  bookingId: string;
  endAt: Date;
  isDriverAvailable?: AvailabilityCheck;
  isVehicleAvailable?: AvailabilityCheck;
  now?: () => Date;
  passengerCount: number;
  prisma: AdminMovePrisma;
  startAt: Date;
  vehicleId: string;
};

export async function moveVehicleBookingByAdmin(input: MoveVehicleBookingByAdminInput) {
  const now = input.now ?? (() => new Date());
  const checkVehicleAvailable =
    input.isVehicleAvailable ??
    ((prisma, vehicleId, range, ignoreBookingId) =>
      defaultIsVehicleAvailable(
        prisma as unknown as Prisma.TransactionClient,
        vehicleId,
        range,
        ignoreBookingId,
      ));
  const checkDriverAvailable =
    input.isDriverAvailable ??
    ((prisma, driverId, range, ignoreBookingId) =>
      defaultIsDriverAvailable(
        prisma as unknown as Prisma.TransactionClient,
        driverId,
        range,
        ignoreBookingId,
      ));

  return input.prisma.$transaction(async (tx) => {
    const booking = await tx.vehicleBooking.findFirstOrThrow({
      where: {
        id: input.bookingId,
        status: VehicleBookingStatus.APPROVED,
      },
    });
    const movedAt = now();

    if (booking.startAt <= movedAt) {
      throw new Error("ย้ายได้เฉพาะรายการใช้รถในอนาคต");
    }

    const vehicle = await tx.vehicle.findFirstOrThrow({
      where: {
        id: input.vehicleId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (input.passengerCount > vehicle.seatCapacity) {
      throw new Error("จำนวนผู้โดยสารเกินจำนวนที่นั่งของรถ");
    }

    if (vehicle.driverOption === DriverOption.SELF_DRIVE_ONLY && input.assignedDriverId) {
      throw new Error("รถคันนี้เป็นรถขับเองเท่านั้น");
    }

    const range = { startAt: input.startAt, endAt: input.endAt };
    const vehicleAvailable = await checkVehicleAvailable(tx, vehicle.id, range, booking.id);

    if (!vehicleAvailable) {
      throw new Error("รถไม่ว่างในช่วงเวลาที่เลือก");
    }

    const driver = input.assignedDriverId
      ? await tx.driver.findFirst({
          where: {
            id: input.assignedDriverId,
            isActive: true,
            deletedAt: null,
            vehicleMappings: { some: { vehicleId: vehicle.id } },
          },
          select: { id: true, name: true, phone: true },
        })
      : null;

    if (input.assignedDriverId && !driver) {
      throw new Error("คนขับที่เลือกไม่ได้เปิดใช้งานหรือยังไม่ได้ผูกกับรถคันนี้");
    }

    if (driver) {
      const driverAvailable = await checkDriverAvailable(tx, driver.id, range, booking.id);

      if (!driverAvailable) {
        throw new Error("คนขับที่เลือกไม่ว่างในช่วงเวลานี้");
      }
    }

    const updated = await tx.vehicleBooking.update({
      where: { id: booking.id },
      data: {
        assignedDriverId: driver?.id ?? null,
        driverNameSnapshot: driver?.name ?? null,
        driverPhoneSnapshot: driver?.phone ?? null,
        endAt: input.endAt,
        passengerCount: input.passengerCount,
        startAt: input.startAt,
        vehicleColorSnapshot: vehicle.color,
        vehicleId: vehicle.id,
        vehicleLicensePlateSnapshot: vehicle.licensePlate,
        vehicleModelSnapshot: vehicle.model,
      },
    });

    await tx.notification.create({
      data: {
        recipientUserId: booking.requesterUserId,
        title: "รายการใช้รถถูกปรับกำหนดการ",
        message: `รายการใช้รถ ${vehicle.licensePlate} ถูกปรับกำหนดการแล้ว`,
        module: ModuleName.VEHICLE_BOOKING,
        entityType: "vehicle_booking",
        entityId: booking.id,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: "VEHICLE_BOOKING_ADMIN_MOVED",
        module: ModuleName.VEHICLE_BOOKING,
        entityType: "vehicle_booking",
        entityId: booking.id,
        oldValues: {
          assignedDriverId: booking.assignedDriverId,
          endAt: booking.endAt.toISOString(),
          startAt: booking.startAt.toISOString(),
          vehicleId: booking.vehicleId,
        },
        newValues: {
          assignedDriverId: driver?.id ?? null,
          endAt: input.endAt.toISOString(),
          startAt: input.startAt.toISOString(),
          vehicleId: vehicle.id,
        },
      },
    });

    return updated;
  });
}
