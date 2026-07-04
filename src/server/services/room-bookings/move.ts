import { ModuleName, RoomBookingStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { isRoomAvailable as defaultIsRoomAvailable } from "@/lib/availability/room";

type RoomMoveTransaction = {
  meetingRoom: {
    findFirstOrThrow: (args: unknown) => Promise<RoomForMove>;
  };
  roomBooking: {
    findFirstOrThrow: (args: unknown) => Promise<RoomBookingForMove>;
    update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<RoomBookingForMove>;
  };
  notification: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<unknown>;
  };
};

export type RoomMovePrisma = {
  $transaction: <T>(callback: (transaction: RoomMoveTransaction) => Promise<T>) => Promise<T>;
};

type RoomBookingForMove = {
  endAt: Date;
  id: string;
  requesterUserId: string;
  roomId: string;
  roomNameSnapshot: string;
  startAt: Date;
  status: RoomBookingStatus;
};

type RoomForMove = {
  hasConferenceSet: boolean;
  hasTv: boolean;
  id: string;
  name: string;
  seatCapacity: number;
};

type AvailabilityCheck = (
  prisma: RoomMoveTransaction,
  roomId: string,
  range: { startAt: Date; endAt: Date },
  ignoreBookingId?: string,
) => Promise<boolean>;

type MoveRoomBookingBaseInput = {
  bookingId: string;
  endAt: Date;
  isRoomAvailable?: AvailabilityCheck;
  now?: () => Date;
  prisma: RoomMovePrisma;
  roomId: string;
  startAt: Date;
};

export type MoveOwnRoomBookingInput = MoveRoomBookingBaseInput & {
  userId: string;
};

export type MoveRoomBookingByAdminInput = MoveRoomBookingBaseInput & {
  actorUserId: string;
};

export async function moveOwnRoomBooking(input: MoveOwnRoomBookingInput) {
  return moveRoomBooking({
    actorUserId: input.userId,
    auditAction: "ROOM_BOOKING_MOVED",
    bookingWhere: {
      id: input.bookingId,
      requesterUserId: input.userId,
      status: RoomBookingStatus.APPROVED,
    },
    endAt: input.endAt,
    isRoomAvailable: input.isRoomAvailable,
    notifyRequester: false,
    now: input.now,
    prisma: input.prisma,
    roomId: input.roomId,
    startAt: input.startAt,
  });
}

export async function moveRoomBookingByAdmin(input: MoveRoomBookingByAdminInput) {
  return moveRoomBooking({
    actorUserId: input.actorUserId,
    auditAction: "ROOM_BOOKING_ADMIN_MOVED",
    bookingWhere: {
      id: input.bookingId,
      status: RoomBookingStatus.APPROVED,
    },
    endAt: input.endAt,
    isRoomAvailable: input.isRoomAvailable,
    notifyRequester: true,
    now: input.now,
    prisma: input.prisma,
    roomId: input.roomId,
    startAt: input.startAt,
  });
}

async function moveRoomBooking(input: {
  actorUserId: string;
  auditAction: string;
  bookingWhere: Record<string, unknown>;
  endAt: Date;
  isRoomAvailable?: AvailabilityCheck;
  notifyRequester: boolean;
  now?: () => Date;
  prisma: RoomMovePrisma;
  roomId: string;
  startAt: Date;
}) {
  const now = input.now ?? (() => new Date());
  const checkRoomAvailable =
    input.isRoomAvailable ??
    ((prisma, roomId, range, ignoreBookingId) =>
      defaultIsRoomAvailable(
        prisma as unknown as Prisma.TransactionClient,
        roomId,
        range,
        ignoreBookingId,
      ));

  return input.prisma.$transaction(async (tx) => {
    const booking = await tx.roomBooking.findFirstOrThrow({ where: input.bookingWhere });
    const movedAt = now();

    if (booking.startAt <= movedAt) {
      throw new Error("ย้ายได้เฉพาะการจองห้องในอนาคต");
    }

    const room = await tx.meetingRoom.findFirstOrThrow({
      where: {
        id: input.roomId,
        isActive: true,
        deletedAt: null,
      },
    });
    const range = { startAt: input.startAt, endAt: input.endAt };
    const available = await checkRoomAvailable(tx, room.id, range, booking.id);

    if (!available) {
      throw new Error("ห้องประชุมไม่ว่างในช่วงเวลาที่เลือก");
    }

    const updated = await tx.roomBooking.update({
      where: { id: booking.id },
      data: {
        endAt: input.endAt,
        roomCapacitySnapshot: room.seatCapacity,
        roomHasConferenceSetSnapshot: room.hasConferenceSet,
        roomHasTvSnapshot: room.hasTv,
        roomId: room.id,
        roomNameSnapshot: room.name,
        startAt: input.startAt,
      },
    });

    if (input.notifyRequester) {
      await tx.notification.create({
        data: {
          recipientUserId: booking.requesterUserId,
          title: "รายการจองห้องถูกปรับกำหนดการ",
          message: `รายการจองห้องถูกย้ายไปที่ ${room.name} แล้ว`,
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
        oldValues: {
          endAt: booking.endAt.toISOString(),
          roomId: booking.roomId,
          startAt: booking.startAt.toISOString(),
        },
        newValues: {
          endAt: input.endAt.toISOString(),
          roomId: room.id,
          startAt: input.startAt.toISOString(),
        },
      },
    });

    return updated;
  });
}
