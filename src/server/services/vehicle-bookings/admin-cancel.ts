import { ModuleName, VehicleBookingStatus } from "@prisma/client";

type AdminCancelTransaction = {
  vehicleBooking: {
    findFirstOrThrow: (args: unknown) => Promise<VehicleBookingForAdminCancel>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<VehicleBookingForAdminCancel>;
  };
  notification: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

export type AdminCancelPrisma = {
  $transaction: <T>(
    callback: (transaction: AdminCancelTransaction) => Promise<T>,
  ) => Promise<T>;
};

type VehicleBookingForAdminCancel = {
  id: string;
  requesterUserId: string;
  status: VehicleBookingStatus;
  startAt: Date;
  vehicleLicensePlateSnapshot: string;
};

export type CancelVehicleBookingByAdminInput = {
  actorUserId: string;
  bookingId: string;
  cancelReason: string;
  prisma: AdminCancelPrisma;
  now?: () => Date;
};

export async function cancelVehicleBookingByAdmin(
  input: CancelVehicleBookingByAdminInput,
) {
  const now = input.now ?? (() => new Date());

  return input.prisma.$transaction(async (tx) => {
    const booking = await tx.vehicleBooking.findFirstOrThrow({
      where: {
        id: input.bookingId,
        status: VehicleBookingStatus.APPROVED,
      },
    });
    const cancelledAt = now();

    if (booking.startAt <= cancelledAt) {
      throw new Error("ยกเลิกได้เฉพาะรายการใช้รถในอนาคต");
    }

    const updated = await tx.vehicleBooking.update({
      where: { id: booking.id },
      data: {
        cancelledAt,
        cancelledByUserId: input.actorUserId,
        cancelledReason: input.cancelReason,
        status: VehicleBookingStatus.CANCELLED,
      },
    });

    await tx.notification.create({
      data: {
        recipientUserId: booking.requesterUserId,
        title: "รายการใช้รถถูกยกเลิก",
        message: `รายการใช้รถ ${booking.vehicleLicensePlateSnapshot} ถูกยกเลิก: ${input.cancelReason}`,
        module: ModuleName.VEHICLE_BOOKING,
        entityType: "vehicle_booking",
        entityId: booking.id,
      },
    });

    await tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: "VEHICLE_BOOKING_ADMIN_CANCELLED",
        module: ModuleName.VEHICLE_BOOKING,
        entityType: "vehicle_booking",
        entityId: booking.id,
        oldValues: { status: booking.status },
        newValues: {
          cancelledReason: input.cancelReason,
          status: updated.status,
        },
      },
    });

    return updated;
  });
}
