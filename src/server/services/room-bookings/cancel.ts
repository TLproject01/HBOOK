import { ModuleName, RoomBookingStatus } from "@prisma/client";

type RoomCancelTransaction = {
  roomBooking: {
    findFirstOrThrow: (args: unknown) => Promise<RoomBookingForCancel>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<RoomBookingForCancel>;
  };
  notification: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

export type RoomCancelPrisma = {
  $transaction: <T>(callback: (transaction: RoomCancelTransaction) => Promise<T>) => Promise<T>;
};

type RoomBookingForCancel = {
  id: string;
  requesterUserId: string;
  roomNameSnapshot: string;
  startAt: Date;
  status: RoomBookingStatus;
};

type CancelRoomBookingInput = {
  bookingId: string;
  cancelReason: string;
  now?: () => Date;
  prisma: RoomCancelPrisma;
};

export type CancelOwnRoomBookingInput = CancelRoomBookingInput & {
  userId: string;
};

export type CancelRoomBookingByAdminInput = CancelRoomBookingInput & {
  actorUserId: string;
};

export async function cancelOwnRoomBooking(input: CancelOwnRoomBookingInput) {
  return cancelRoomBooking({
    actorUserId: input.userId,
    bookingWhere: {
      id: input.bookingId,
      requesterUserId: input.userId,
      status: RoomBookingStatus.APPROVED,
    },
    cancelReason: input.cancelReason,
    notifyRequester: false,
    now: input.now,
    prisma: input.prisma,
    auditAction: "ROOM_BOOKING_CANCELLED",
  });
}

export async function cancelRoomBookingByAdmin(input: CancelRoomBookingByAdminInput) {
  return cancelRoomBooking({
    actorUserId: input.actorUserId,
    bookingWhere: {
      id: input.bookingId,
      status: RoomBookingStatus.APPROVED,
    },
    cancelReason: input.cancelReason,
    notifyRequester: true,
    now: input.now,
    prisma: input.prisma,
    auditAction: "ROOM_BOOKING_ADMIN_CANCELLED",
  });
}

async function cancelRoomBooking(input: {
  actorUserId: string;
  auditAction: string;
  bookingWhere: Record<string, unknown>;
  cancelReason: string;
  notifyRequester: boolean;
  now?: () => Date;
  prisma: RoomCancelPrisma;
}) {
  const now = input.now ?? (() => new Date());

  return input.prisma.$transaction(async (tx) => {
    const booking = await tx.roomBooking.findFirstOrThrow({ where: input.bookingWhere });
    const cancelledAt = now();

    if (booking.startAt <= cancelledAt) {
      throw new Error("Only future room bookings can be cancelled.");
    }

    const updated = await tx.roomBooking.update({
      where: { id: booking.id },
      data: {
        cancelledAt,
        cancelledByUserId: input.actorUserId,
        cancelledReason: input.cancelReason,
        status: RoomBookingStatus.CANCELLED,
      },
    });

    if (input.notifyRequester) {
      await tx.notification.create({
        data: {
          recipientUserId: booking.requesterUserId,
          title: "Room booking cancelled",
          message: `Your booking for ${booking.roomNameSnapshot} was cancelled: ${input.cancelReason}`,
          module: ModuleName.ROOM_BOOKING,
          entityType: "room_booking",
          entityId: booking.id,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        actorUserId: input.actorUserId,
        action: input.auditAction,
        module: ModuleName.ROOM_BOOKING,
        entityType: "room_booking",
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
