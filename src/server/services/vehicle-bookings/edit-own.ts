import { DriverOption, ModuleName, VehicleBookingStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { isVehicleAvailable as defaultIsVehicleAvailable } from "@/lib/availability/vehicle";

type EditOwnTransaction = {
  vehicle: {
    findFirstOrThrow: (args: unknown) => Promise<VehicleForEdit>;
  };
  vehicleBooking: {
    findFirstOrThrow: (args: unknown) => Promise<{ id: string; status: VehicleBookingStatus }>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
  };
  vehicleBookingRoute: {
    deleteMany: (args: { where: { vehicleBookingId: string } }) => Promise<unknown>;
    createMany: (args: { data: Array<{ vehicleBookingId: string; sequence: number; destination: string }> }) => Promise<unknown>;
  };
  user: {
    findMany: (args: unknown) => Promise<Array<{ id: string }>>;
  };
  notification: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

export type EditOwnVehicleBookingPrisma = {
  $transaction: <T>(callback: (transaction: EditOwnTransaction) => Promise<T>) => Promise<T>;
};

type VehicleForEdit = {
  id: string;
  color: string;
  driverOption: DriverOption;
  licensePlate: string;
  model: string;
  seatCapacity: number;
};

export type UpdateOwnPendingVehicleBookingInput = {
  bookingId: string;
  contactName: string;
  contactPhone: string;
  destinations: string[];
  endAt: Date;
  needDriver: boolean;
  passengerCount: number;
  startAt: Date;
  startLocation: string;
  tripPurpose: string;
  user: {
    id: string;
    name: string;
    department: { name: string };
  };
  vehicleId: string;
};

type AvailabilityCheck = (
  prisma: EditOwnTransaction,
  vehicleId: string,
  range: { startAt: Date; endAt: Date },
  ignoreBookingId?: string,
) => Promise<boolean>;

export type UpdateOwnPendingVehicleBookingDependencies = {
  input: UpdateOwnPendingVehicleBookingInput;
  prisma: EditOwnVehicleBookingPrisma;
  isVehicleAvailable?: AvailabilityCheck;
};

export async function updateOwnPendingVehicleBooking(
  dependencies: UpdateOwnPendingVehicleBookingDependencies,
) {
  const { input } = dependencies;
  const checkVehicleAvailable =
    dependencies.isVehicleAvailable ??
    ((prisma, vehicleId, range, ignoreBookingId) =>
      defaultIsVehicleAvailable(
        prisma as unknown as Prisma.TransactionClient,
        vehicleId,
        range,
        ignoreBookingId,
      ));

  return dependencies.prisma.$transaction(async (tx) => {
    const booking = await tx.vehicleBooking.findFirstOrThrow({
      where: {
        id: input.bookingId,
        requesterUserId: input.user.id,
        status: VehicleBookingStatus.PENDING,
      },
    });
    const vehicle = await tx.vehicle.findFirstOrThrow({
      where: {
        id: input.vehicleId,
        isActive: true,
        deletedAt: null,
      },
    });

    if (input.passengerCount > vehicle.seatCapacity) {
      throw new Error("Passenger count exceeds vehicle seat capacity.");
    }

    if (vehicle.driverOption === DriverOption.SELF_DRIVE_ONLY && input.needDriver) {
      throw new Error("This vehicle is self-drive only.");
    }

    const available = await checkVehicleAvailable(
      tx,
      vehicle.id,
      { startAt: input.startAt, endAt: input.endAt },
      booking.id,
    );

    if (!available) {
      throw new Error("Vehicle is unavailable for the selected time range.");
    }

    const updated = await tx.vehicleBooking.update({
      where: { id: booking.id },
      data: {
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        departmentNameSnapshot: input.user.department.name,
        endAt: input.endAt,
        needDriver: input.needDriver,
        passengerCount: input.passengerCount,
        requesterNameSnapshot: input.user.name,
        startAt: input.startAt,
        startLocation: input.startLocation,
        tripPurpose: input.tripPurpose,
        vehicleColorSnapshot: vehicle.color,
        vehicleId: vehicle.id,
        vehicleLicensePlateSnapshot: vehicle.licensePlate,
        vehicleModelSnapshot: vehicle.model,
      },
    });

    await tx.vehicleBookingRoute.deleteMany({
      where: { vehicleBookingId: booking.id },
    });
    await tx.vehicleBookingRoute.createMany({
      data: input.destinations.map((destination, index) => ({
        destination,
        sequence: index + 1,
        vehicleBookingId: booking.id,
      })),
    });

    const admins = await tx.user.findMany({
      where: {
        role: "ADMIN",
        isActive: true,
        deletedAt: null,
      },
      select: { id: true },
    });

    await Promise.all(
      admins.map((admin) =>
        tx.notification.create({
          data: {
            recipientUserId: admin.id,
            title: "Vehicle request updated",
            message: `${input.user.name} updated a pending vehicle request.`,
            module: ModuleName.VEHICLE_BOOKING,
            entityType: "vehicle_booking",
            entityId: booking.id,
          },
        }),
      ),
    );

    await tx.auditLog.create({
      data: {
        actorUserId: input.user.id,
        action: "VEHICLE_REQUEST_UPDATED",
        module: ModuleName.VEHICLE_BOOKING,
        entityType: "vehicle_booking",
        entityId: booking.id,
        oldValues: { status: booking.status },
        newValues: {
          endAt: input.endAt.toISOString(),
          startAt: input.startAt.toISOString(),
          vehicleId: vehicle.id,
        },
      },
    });

    return updated;
  });
}
