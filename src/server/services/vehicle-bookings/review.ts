import { DriverOption, ModuleName, VehicleBookingStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { isDriverAvailable as defaultIsDriverAvailable, isVehicleAvailable as defaultIsVehicleAvailable } from "@/lib/availability/vehicle";

type ReviewTransaction = {
  vehicleBooking: {
    findFirstOrThrow: (args: unknown) => Promise<VehicleBookingForReview>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<VehicleBookingForReview>;
  };
  driver: {
    findFirst: (args: unknown) => Promise<DriverForReview | null>;
  };
  notification: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

export type ReviewPrisma = {
  $transaction: <T>(callback: (transaction: ReviewTransaction) => Promise<T>) => Promise<T>;
};

type VehicleBookingForReview = {
  id: string;
  requesterUserId: string;
  vehicleId: string;
  status: VehicleBookingStatus;
  startAt: Date;
  endAt: Date;
  needDriver: boolean;
  vehicle: {
    id: string;
    licensePlate: string;
    driverOption: DriverOption;
  };
  requester: {
    id: string;
    name: string;
  };
};

type DriverForReview = {
  id: string;
  name: string;
  phone: string;
};

type AvailabilityCheck = (
  prisma: ReviewTransaction,
  id: string,
  range: { startAt: Date; endAt: Date },
  ignoreBookingId?: string,
) => Promise<boolean>;

type ReviewDependencies = {
  actorUserId: string;
  bookingId: string;
  prisma: ReviewPrisma;
  now?: () => Date;
};

export type ApproveVehicleBookingInput = ReviewDependencies & {
  assignedDriverId?: string;
  isDriverAvailable?: AvailabilityCheck;
  isVehicleAvailable?: AvailabilityCheck;
};

export type RejectVehicleBookingInput = ReviewDependencies & {
  rejectReason: string;
};

export async function approveVehicleBooking(input: ApproveVehicleBookingInput) {
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
    const booking = await findPendingBooking(tx, input.bookingId);
    const range = { startAt: booking.startAt, endAt: booking.endAt };

    const vehicleAvailable = await checkVehicleAvailable(
      tx,
      booking.vehicleId,
      range,
      booking.id,
    );

    if (!vehicleAvailable) {
      throw new Error("Vehicle is unavailable for the selected time range.");
    }

    if (booking.needDriver && !input.assignedDriverId) {
      throw new Error("Driver assignment is required for this request.");
    }

    if (
      input.assignedDriverId &&
      booking.vehicle.driverOption === DriverOption.SELF_DRIVE_ONLY
    ) {
      throw new Error("This vehicle is self-drive only.");
    }

    const driver = input.assignedDriverId
      ? await findAssignableDriver(tx, input.assignedDriverId, booking.vehicleId)
      : null;

    if (input.assignedDriverId && !driver) {
      throw new Error("Selected driver is not active or is not mapped to this vehicle.");
    }

    if (driver) {
      const driverAvailable = await checkDriverAvailable(tx, driver.id, range, booking.id);

      if (!driverAvailable) {
        throw new Error("Selected driver is unavailable for the selected time range.");
      }
    }

    const updated = await tx.vehicleBooking.update({
      where: { id: booking.id },
      data: {
        assignedDriverId: driver?.id ?? null,
        approvedAt: now(),
        approvedByUserId: input.actorUserId,
        driverNameSnapshot: driver?.name ?? null,
        driverPhoneSnapshot: driver?.phone ?? null,
        rejectReason: null,
        status: VehicleBookingStatus.APPROVED,
      },
    });

    await tx.notification.create({
      data: {
        recipientUserId: booking.requesterUserId,
        title: "Vehicle request approved",
        message: `Your request for ${booking.vehicle.licensePlate} was approved.`,
        module: ModuleName.VEHICLE_BOOKING,
        entityType: "vehicle_booking",
        entityId: booking.id,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: "VEHICLE_REQUEST_APPROVED",
        module: ModuleName.VEHICLE_BOOKING,
        entityType: "vehicle_booking",
        entityId: booking.id,
        oldValues: { status: booking.status },
        newValues: {
          assignedDriverId: driver?.id ?? null,
          status: updated.status,
        },
      },
    });

    return updated;
  });
}

export async function rejectVehicleBooking(input: RejectVehicleBookingInput) {
  return input.prisma.$transaction(async (tx) => {
    const booking = await findPendingBooking(tx, input.bookingId);
    const updated = await tx.vehicleBooking.update({
      where: { id: booking.id },
      data: {
        rejectReason: input.rejectReason,
        status: VehicleBookingStatus.REJECTED,
      },
    });

    await tx.notification.create({
      data: {
        recipientUserId: booking.requesterUserId,
        title: "Vehicle request rejected",
        message: `Your request for ${booking.vehicle.licensePlate} was rejected: ${input.rejectReason}`,
        module: ModuleName.VEHICLE_BOOKING,
        entityType: "vehicle_booking",
        entityId: booking.id,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: "VEHICLE_REQUEST_REJECTED",
        module: ModuleName.VEHICLE_BOOKING,
        entityType: "vehicle_booking",
        entityId: booking.id,
        oldValues: { status: booking.status },
        newValues: {
          rejectReason: input.rejectReason,
          status: updated.status,
        },
      },
    });

    return updated;
  });
}

function findPendingBooking(tx: ReviewTransaction, bookingId: string) {
  return tx.vehicleBooking.findFirstOrThrow({
    where: {
      id: bookingId,
      status: VehicleBookingStatus.PENDING,
    },
    include: {
      requester: { select: { id: true, name: true } },
      vehicle: { select: { id: true, driverOption: true, licensePlate: true } },
    },
  });
}

function findAssignableDriver(
  tx: ReviewTransaction,
  driverId: string,
  vehicleId: string,
) {
  return tx.driver.findFirst({
    where: {
      id: driverId,
      isActive: true,
      deletedAt: null,
      vehicleMappings: {
        some: { vehicleId },
      },
    },
    select: { id: true, name: true, phone: true },
  });
}
